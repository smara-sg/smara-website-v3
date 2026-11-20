import { inferenceInterval, updatePersonAlpha, validateConfidenceMask, backgroundFromCategories, applyPersonMatte, createMatteSamplingMap, type MatteSamplingMap, type CategoryMaskWorkspace } from './mask';
import { needsMobileMaskCompatibility } from './compatibility';
import { cameraFrameGeometry } from './framing';

const visionAssets = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const desktopPersonModel = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';
const mobilePersonModel = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite';

type Mask = { width: number; height: number; getAsFloat32Array(): Float32Array };
type CategoryMask = { width: number; height: number; getAsUint8Array(): Uint8Array };
type Segmenter = {
  segmentForVideo(frame: ImageBitmap | HTMLCanvasElement, timestamp: number, callback: (result: { confidenceMasks?: Mask[]; categoryMask?: CategoryMask }) => void): void;
  close(): void;
};

/** One in-flight camera frame, no backlog; camera RGB always travels with its own matte. */
export function startPersonRenderer(
  feed: HTMLVideoElement,
  foreground: HTMLCanvasElement,
  mirrored: boolean,
  onReady: () => void,
  onError: () => void,
  isPaused: () => boolean = () => false,
  onMetrics?: (metrics: { durationMs: number; mode: 'worker' | 'fallback'; intervalMs: number; maskFormat: 'category' | 'confidence' }) => void,
  device: Pick<Navigator, 'userAgent' | 'maxTouchPoints'> = navigator,
) {
  const mobileCompatibility = needsMobileMaskCompatibility(device);
  const byteMaskCompatibility = mobileCompatibility;
  const personModel = mobileCompatibility ? mobilePersonModel : desktopPersonModel;
  const fg = foreground.getContext('2d', { willReadFrequently: mobileCompatibility });
  const mask = document.createElement('canvas');
  const maskContext = mask.getContext('2d');
  let pixels: ImageData | undefined;
  let previous: Float32Array | undefined;
  const categoryWorkspace: CategoryMaskWorkspace = {};
  let matteSampling: MatteSamplingMap | undefined;
  let active = true;
  let ready = false;
  let busy = false;
  let worker: Worker | undefined;
  let fallback: Segmenter | undefined;
  let fallbackStarted = false;
  let animation = 0;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let lastVideoTime = -1;
  let lastSubmitted = -Infinity;
  let interval = 1000 / 20;
  const extraction = document.createElement('canvas');
  const extractionContext = extraction.getContext('2d');
  const fallbackInput = document.createElement('canvas');
  const fallbackInputContext = fallbackInput.getContext('2d', { willReadFrequently: true });
  // Normalize mobile camera rotation/cropping through Canvas before transferring frames.
  let directVideoBitmap = !mobileCompatibility;

  function finishFrame(frame: ImageBitmap, confidence: Float32Array, width: number, height: number, duration: number) {
    if (!active || !fg || !maskContext) { frame.close(); return; }
    try {
      validateConfidenceMask(confidence, width, height);
      const resized = !pixels || pixels.width !== width || pixels.height !== height;
      if (resized) {
        mask.width = width;
        mask.height = height;
        pixels = maskContext.createImageData(width, height);
        previous = new Float32Array(width * height);
      }
      updatePersonAlpha(confidence, previous!, pixels!.data, !ready || resized, mobileCompatibility);
      if (!byteMaskCompatibility) maskContext.putImageData(pixels!, 0, 0);
      // Work at camera detail, not 1080x1920, then upscale once in the final composition.
      if (foreground.width !== frame.width || foreground.height !== frame.height) {
        foreground.width = frame.width;
        foreground.height = frame.height;
      }
      fg.setTransform(1, 0, 0, 1, 0, 0);
      fg.globalCompositeOperation = 'source-over';
      fg.filter = 'none';
      fg.clearRect(0, 0, foreground.width, foreground.height);
      fg.save();
      if (mirrored) { fg.translate(foreground.width, 0); fg.scale(-1, 1); }
      fg.imageSmoothingEnabled = true;
      fg.imageSmoothingQuality = 'high';
      fg.drawImage(frame, 0, 0);
      if (!byteMaskCompatibility) {
        fg.globalCompositeOperation = 'destination-in';
        fg.drawImage(mask, 0, 0, foreground.width, foreground.height);
      }
      fg.restore();
      if (byteMaskCompatibility) {
        const image = fg.getImageData(0, 0, foreground.width, foreground.height);
        if (!matteSampling || matteSampling.width !== foreground.width || matteSampling.maskWidth !== width || matteSampling.mirrored !== mirrored) {
          matteSampling = createMatteSamplingMap(foreground.width, width, mirrored);
        }
        applyPersonMatte(image.data, foreground.width, foreground.height, pixels!.data, width, height, mirrored, matteSampling);
        fg.putImageData(image, 0, 0);
      }
      interval = worker ? interval * 0.75 + inferenceInterval(duration) * 0.25
        : inferenceInterval(duration, false);
      onMetrics?.({ durationMs: duration, mode: worker ? 'worker' : 'fallback', intervalMs: interval, maskFormat: byteMaskCompatibility ? 'category' : 'confidence' });
      if (!ready) { ready = true; onReady(); }
    } finally {
      frame.close();
      busy = false;
      clearTimeout(watchdog);
    }
  }

  async function startFallback() {
    if (!active || fallbackStarted) return;
    fallbackStarted = true;
    worker?.terminate();
    worker = undefined;
    busy = false;
    clearTimeout(watchdog);
    try {
      const { FilesetResolver, ImageSegmenter } = await import(/* @vite-ignore */ `${visionAssets}/vision_bundle.mjs`);
      const files = await FilesetResolver.forVisionTasks(`${visionAssets}/wasm`);
      const create = (delegate: 'GPU' | 'CPU') => ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: personModel, delegate },
        runningMode: 'VIDEO', outputConfidenceMasks: !byteMaskCompatibility, outputCategoryMask: byteMaskCompatibility,
      });
      // A failed worker must not retry the same GPU path on the main thread.
      const model: Segmenter = await create('CPU');
      if (!active) { model.close(); return; }
      fallback = model;
      schedule();
    } catch { if (active) onError(); }
  }

  async function submit(timestamp: number) {
    busy = true;
    lastSubmitted = timestamp;
    lastVideoTime = feed.currentTime;
    let frame: ImageBitmap | undefined;
    try {
      const { x, y, cropWidth, cropHeight, width, height } = cameraFrameGeometry(feed.videoWidth, feed.videoHeight, mobileCompatibility);
      if (directVideoBitmap) {
        try {
          frame = await createImageBitmap(feed, x, y, Math.floor(cropWidth), Math.floor(cropHeight),
            { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
        } catch { directVideoBitmap = false; }
      }
      // Some mobile browsers accept canvas bitmaps but not video bitmaps/options.
      if (!frame) {
        if (extraction.width !== width || extraction.height !== height) {
          extraction.width = width;
          extraction.height = height;
        }
        if (!extractionContext) throw new Error('No camera frame canvas');
        extractionContext.drawImage(feed, x, y, cropWidth, cropHeight, 0, 0, width, height);
        frame = await createImageBitmap(extraction);
      }
      if (!active) { frame.close(); return; }
      if (worker) {
        worker.postMessage({ type: 'frame', frame, timestamp }, [frame]);
        watchdog = setTimeout(() => { void startFallback(); }, 5000);
      } else if (fallback) {
        const started = performance.now();
        const cameraFrame = frame;
        if (!fallbackInputContext) throw new Error('No fallback inference canvas');
        const inputHeight = Math.round(256 * cameraFrame.height / cameraFrame.width);
        if (fallbackInput.width !== 256 || fallbackInput.height !== inputHeight) {
          fallbackInput.width = 256;
          fallbackInput.height = inputHeight;
        }
        fallbackInputContext.drawImage(cameraFrame, 0, 0, 256, inputHeight);
        const result: { value?: { confidence: Float32Array; width: number; height: number } } = {};
        fallback.segmentForVideo(fallbackInput, timestamp, ({ confidenceMasks, categoryMask }) => {
          if (byteMaskCompatibility) {
            if (!categoryMask) throw new Error('No category mask');
            result.value = { confidence: backgroundFromCategories(categoryMask.getAsUint8Array(), categoryMask.width, categoryMask.height, mobileCompatibility, categoryWorkspace), width: categoryMask.width, height: categoryMask.height };
            return;
          }
          const background = confidenceMasks?.[0];
          if (!background) throw new Error('No background mask');
          result.value = { confidence: background.getAsFloat32Array().slice(), width: background.width, height: background.height };
        });
        if (!result.value) throw new Error('No result');
        finishFrame(cameraFrame, result.value.confidence, result.value.width, result.value.height, performance.now() - started);
      } else { frame.close(); busy = false; }
    } catch {
      frame?.close();
      busy = false;
      if (worker) void startFallback();
      else if (active) onError();
    }
  }

  function tick(timestamp: number) {
    if (!active) return;
    animation = requestAnimationFrame(tick);
    if (document.hidden || isPaused() || busy || feed.readyState < 2 || !feed.videoWidth
      || feed.currentTime === lastVideoTime || timestamp - lastSubmitted < interval) return;
    void submit(timestamp);
  }

  function schedule() {
    cancelAnimationFrame(animation);
    if (active) animation = requestAnimationFrame(tick);
  }

  if (!fg || !maskContext) { onError(); return () => {}; }
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
    void startFallback();
  } else {
    try {
      worker = new Worker('/ar-segmentation-worker.js?v=person-outline-4');
      worker.onmessage = ({ data }) => {
        if (!active) { data.frame?.close(); return; }
        if (data.type === 'ready') { clearTimeout(watchdog); schedule(); }
        else if (data.type === 'result') {
          try {
            const confidence = data.categories
              ? backgroundFromCategories(new Uint8Array(data.categories), data.width, data.height, mobileCompatibility, categoryWorkspace)
              : new Float32Array(data.confidence);
            finishFrame(data.frame, confidence, data.width, data.height, data.duration);
          }
          catch { data.frame?.close(); void startFallback(); }
        }
        else if (data.type === 'error') void startFallback();
      };
      worker.onerror = () => { void startFallback(); };
      worker.postMessage({ type: 'init', assets: visionAssets, model: personModel, delegate: mobileCompatibility ? 'CPU' : 'GPU', categoryMask: byteMaskCompatibility });
      watchdog = setTimeout(() => { void startFallback(); }, 30000);
    } catch { void startFallback(); }
  }

  return () => {
    if (!active) return;
    active = false;
    cancelAnimationFrame(animation);
    clearTimeout(watchdog);
    worker?.terminate();
    fallback?.close();
  };
}

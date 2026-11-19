/* Classic worker: MediaPipe's pinned WASM loader can use importScripts here. */
let segmenter;
let inferenceCanvas;
let inferenceContext;

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const { FilesetResolver, ImageSegmenter } = await import(`${data.assets}/vision_bundle.mjs`);
      const files = await FilesetResolver.forVisionTasks(`${data.assets}/wasm`);
      const create = (delegate) => ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: data.model, delegate },
        canvas: new OffscreenCanvas(256, 256),
        runningMode: 'VIDEO',
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
      // Mobile float texture readback can succeed but return a visibly corrupt matte.
      // Keep inference off the UI thread, with CPU masks on phones and tablets.
      if (data.delegate === 'CPU') segmenter = await create('CPU');
      else {
        try { segmenter = await create('GPU'); }
        catch { segmenter = await create('CPU'); }
      }
      inferenceCanvas = new OffscreenCanvas(256, 456);
      inferenceContext = inferenceCanvas.getContext('2d', { willReadFrequently: data.delegate === 'CPU' });
      if (!inferenceContext) throw new Error('No worker canvas');
      self.postMessage({ type: 'ready' });
    } catch {
      self.postMessage({ type: 'error' });
    }
    return;
  }
  if (data.type !== 'frame') return;
  const frame = data.frame;
  try {
    if (!segmenter || !inferenceContext) throw new Error('Not initialized');
    const started = performance.now();
    // Preserve portrait proportions and let MediaPipe apply its own model preprocessing.
    // Pre-stretching a head/body into a square can reduce segmentation accuracy.
    const height = Math.round(256 * frame.height / frame.width);
    if (inferenceCanvas.height !== height) inferenceCanvas.height = height;
    inferenceContext.drawImage(frame, 0, 0, 256, height);
    let result;
    segmenter.segmentForVideo(inferenceCanvas, data.timestamp, ({ confidenceMasks }) => {
      const background = confidenceMasks?.[0];
      if (!background) throw new Error('No background confidence');
      // MediaPipe only guarantees mask memory during this callback; transfer our own copy.
      const confidence = background.getAsFloat32Array().slice();
      result = {
        type: 'result', frame, confidence: confidence.buffer,
        width: background.width, height: background.height,
        duration: performance.now() - started,
      };
    });
    if (!result) throw new Error('No result');
    self.postMessage(result, [frame, result.confidence]);
  } catch {
    frame.close();
    self.postMessage({ type: 'error' });
  }
};

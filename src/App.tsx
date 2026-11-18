import { useEffect, useRef, useState } from 'react';
import { Camera, Download, RotateCcw, Square, SwitchCamera, Video, X } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './utils/scrollToTop';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import WhatIsSmara from './components/WhatIsSmara';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Community from './components/Community';
import EventsPage from './components/EventsPage';
import AboutPage from './components/AboutPage';
import GalleryPage from './components/GalleryPage';
import ArtCardsPage from './components/ArtCardsPage';
import NotFoundPage from './components/NotFoundPage';
import PageSeo from './components/PageSeo';
import Footer from './components/Footer';
import DayNightBackdrop from './components/DayNightBackdrop';

function Home() {
  return (
    <>
      <DayNightBackdrop />
      <div className="over-landscape">
        <HeroSection />
        <WhatIsSmara />
        <Experience />
        <Testimonials />
        <Community />
        <Footer />
      </div>
    </>
  );
}

const arSamples = [
  { name: 'Moonlit Lotus Pond', slug: 'moonlit-lotus-pond', image: '/images/ar-moonlit-lotus-pond.jpg', video: '/images/ar-moonlit-lotus-pond-seamless.mp4' },
  { name: 'Misty Mountain', slug: 'misty-mountain', image: '/images/ar-misty-mountain-v2.jpg', video: '/images/ar-misty-mountain-seamless.mp4' },
  { name: 'Tropical Beach', slug: 'tropical-beach', image: '/images/ar-tropical-beach.jpg', video: '/images/ar-tropical-beach-seamless.mp4' },
];

type ArSample = (typeof arSamples)[number];

const arLogo = '/images/smara-ar-logo.png';
const maxRecordingSeconds = 60;

const captureButtonClass = 'grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40';

const visionAssets = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const personModel = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

type PersonSegmenter = {
  segmentForVideo(
    frame: HTMLVideoElement,
    timestamp: number,
    callback: (result: { confidenceMasks?: { width: number; height: number; getAsFloat32Array(): Float32Array }[] }) => void,
  ): void;
  close(): void;
};

async function loadPersonSegmenter(): Promise<PersonSegmenter> {
  const { FilesetResolver, ImageSegmenter } = await import(/* @vite-ignore */ `${visionAssets}/vision_bundle.mjs`);
  const files = await FilesetResolver.forVisionTasks(`${visionAssets}/wasm`);
  return ImageSegmenter.createFromOptions(files, {
    baseOptions: { modelAssetPath: personModel, delegate: 'CPU' },
    runningMode: 'VIDEO',
    outputConfidenceMasks: true,
    outputCategoryMask: false,
  });
}

function CameraExperience({ sample, onClose }: { sample: ArSample; onClose: () => void }) {
  const { name, slug, image, video } = sample;
  const dialog = useRef<HTMLDialogElement>(null);
  const camera = useRef<HTMLVideoElement>(null);
  const backdropVideo = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const microphone = useRef<MediaStream | null>(null);
  const audio = useRef<{
    context: AudioContext;
    output: MediaStreamAudioDestinationNode;
    monitor: GainNode;
    microphoneSource?: MediaStreamAudioSourceNode;
  } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const downloadUrl = useRef('');
  const open = useRef(false);
  const recordingStarted = useRef(0);
  const [seconds, setSeconds] = useState(0);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [switching, setSwitching] = useState(false);
  const [permission, setPermission] = useState<'ask' | 'loading' | 'allowed'>('ask');
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState<{ url: string; filename: string } | null>(null);

  useEffect(() => {
    const modal = dialog.current;
    const { scrollX, scrollY } = window;
    modal?.showModal();
    open.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      open.current = false;
      modal?.close();
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      const activeRecorder = recorder.current;
      if (activeRecorder) {
        activeRecorder.onstop = null;
        if (activeRecorder.state !== 'inactive') activeRecorder.stop();
        activeRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      stream.current?.getTracks().forEach((track) => track.stop());
      microphone.current?.getTracks().forEach((track) => track.stop());
      void audio.current?.context.close().catch(() => {});
      URL.revokeObjectURL(downloadUrl.current);
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const elapsedMs = () => performance.now() - recordingStarted.current;
    const timer = window.setInterval(() => {
      setSeconds(Math.min(maxRecordingSeconds, Math.floor(elapsedMs() / 1000)));
    }, 200);
    const limit = window.setTimeout(() => {
      const active = recorder.current;
      if (active?.state === 'recording') active.stop();
    }, Math.max(0, maxRecordingSeconds * 1000 - elapsedMs()));
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(limit);
    };
  }, [recording]);

  useEffect(() => {
    if (permission !== 'allowed' || switching) return;
    const output = canvas.current;
    const feed = camera.current;
    const ctx = output?.getContext('2d');
    if (!ctx || !output || !feed) return;

    const foreground = document.createElement('canvas');
    foreground.width = output.width;
    foreground.height = output.height;
    const fg = foreground.getContext('2d');
    const mask = document.createElement('canvas');
    const maskContext = mask.getContext('2d');
    if (!fg || !maskContext) return;

    const background = new Image();
    background.src = image;
    const logo = new Image();
    logo.src = arLogo;
    const leaves = slug === 'moonlit-lotus-pond' ? new Image() : undefined;
    if (leaves) leaves.src = '/images/lotus-foreground-leaves.png';
    const rightLeaves = leaves ? new Image() : undefined;
    if (rightLeaves) rightLeaves.src = '/images/lotus-foreground-leaves-right.png';
    const breezeStartedAt = performance.now();
    let active = true;
    let segmenter: PersonSegmenter | undefined;
    let timer: number | undefined;
    let maskPixels: ImageData | undefined;
    let lastFrameTime = -1;
    let lastSegmentationTime = -Infinity;
    let firstFrame = true;

    function handleFailure() {
      if (!active) return;
      window.clearInterval(timer);
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      microphone.current?.getTracks().forEach((track) => track.stop());
      microphone.current = null;
      if (feed) feed.srcObject = null;
      setReady(false);
      setPermission('ask');
      setMessage('Background removal couldn’t start. Please try again.');
    }

    function draw() {
      if (!segmenter || !feed || !output || !ctx || !fg || !maskContext) return;
      const now = performance.now();
      if (feed.readyState >= 2 && feed.videoWidth && feed.currentTime !== lastFrameTime && now - lastSegmentationTime >= 60) {
        lastFrameTime = feed.currentTime;
        lastSegmentationTime = now;
        const { width, height } = output;
        const scale = Math.max(width / feed.videoWidth, height / feed.videoHeight);
        const cropWidth = width / scale;
        const cropHeight = height / scale;
        const cropX = (feed.videoWidth - cropWidth) / 2;
        const cropY = (feed.videoHeight - cropHeight) / 2;
        try {
          segmenter.segmentForVideo(feed, now, ({ confidenceMasks }) => {
            // Class zero is background. Its inverse keeps all person classes in the frame.
            const backgroundMask = confidenceMasks?.[0];
            if (!backgroundMask) throw new Error('Person mask unavailable');
            if (!maskPixels || maskPixels.width !== backgroundMask.width || maskPixels.height !== backgroundMask.height) {
              mask.width = backgroundMask.width;
              mask.height = backgroundMask.height;
              maskPixels = maskContext.createImageData(mask.width, mask.height);
            }
            const confidence = backgroundMask.getAsFloat32Array();
            for (let pixel = 0; pixel < confidence.length; pixel++) {
              const person = Math.max(0, Math.min(1, (0.85 - confidence[pixel]) / 0.7));
              maskPixels.data[pixel * 4 + 3] = person * 255;
            }
            maskContext.putImageData(maskPixels, 0, 0);
  
            fg.clearRect(0, 0, width, height);
            fg.save();
            if (facing === 'user') {
              fg.translate(width, 0);
              fg.scale(-1, 1);
            }
            fg.drawImage(feed, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
            fg.globalCompositeOperation = 'destination-in';
            const maskScaleX = mask.width / feed.videoWidth;
            const maskScaleY = mask.height / feed.videoHeight;
            fg.drawImage(mask, cropX * maskScaleX, cropY * maskScaleY, cropWidth * maskScaleX, cropHeight * maskScaleY, 0, 0, width, height);
            fg.restore();
  
            if (firstFrame) {
              firstFrame = false;
              setReady(true);
            }
          });
        } catch {
          handleFailure();
          return;
        }
      }

      if (firstFrame) return;
      const video = backdropVideo.current;
      if (video && video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        const scale = Math.max(output.width / video.videoWidth, output.height / video.videoHeight);
        const cropWidth = output.width / scale;
        const cropHeight = output.height / scale;
        ctx.drawImage(video, (video.videoWidth - cropWidth) / 2, (video.videoHeight - cropHeight) / 2,
          cropWidth, cropHeight, 0, 0, output.width, output.height);
      } else {
        ctx.drawImage(background, 0, 0, output.width, output.height);
      }
      ctx.drawImage(foreground, 0, 0);
      // Composite over the person so the same moving leaves are captured in photos and videos.
      if (leaves?.complete && leaves.naturalWidth) {
        const elapsed = (now - breezeStartedAt) / 1000;
        for (const side of [-1, 1]) {
          const phase = elapsed * Math.PI * 2 / (side === -1 ? 5.2 : 6.1) + (side === -1 ? 0 : 1.7);
          const sway = Math.sin(phase) * 0.065 + Math.sin(phase * 1.8) * 0.012;
          const sprite = side === 1 && rightLeaves?.complete && rightLeaves.naturalWidth ? rightLeaves : leaves;
          const leafHeight = output.height * (side === -1 ? 0.29 : 0.18);
          const leafWidth = leafHeight * sprite.naturalWidth / sprite.naturalHeight;
          ctx.save();
          ctx.translate(side === -1 ? -24 : output.width + 24, output.height + 38);
          ctx.scale(side === -1 ? 1 : -1, 1);
          ctx.rotate(sway + (side === 1 ? -0.12 : 0));
          ctx.drawImage(sprite, -leafWidth * 0.1, -leafHeight, leafWidth, leafHeight);
          ctx.restore();
        }
      }
      ctx.save();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
      ctx.shadowBlur = 14;
      const logoHeight = 76;
      const logoWidth = logoHeight * logo.naturalWidth / logo.naturalHeight;
      ctx.drawImage(logo, 34, output.height - logoHeight - 34, logoWidth, logoHeight);
      ctx.restore();
    }

    async function startSegmentation() {
      try {
        await Promise.all([background.decode(), logo.decode()]);
        // A missing decorative asset must not stop the camera experience.
        await Promise.all([leaves, rightLeaves].map(sprite => sprite?.decode().catch(() => undefined)));
        if (!active) return;
        const model = await loadPersonSegmenter();
        if (!active) {
          model.close();
          return;
        }
        segmenter = model;
        timer = window.setInterval(draw, 1000 / 30);
        draw();
      } catch {
        handleFailure();
      }
    }

    void startSegmentation();
    return () => {
      active = false;
      window.clearInterval(timer);
      segmenter?.close();
    };
  }, [permission, facing, switching, image, slug]);

  function startBackdropAudio() {
    const video = backdropVideo.current;
    if (!video) throw new Error('Backdrop video unavailable');
    if (!audio.current) {
      const context = new AudioContext();
      const output = context.createMediaStreamDestination();
      const soundtrack = context.createMediaElementSource(video);
      const monitor = context.createGain();
      const recordedMusic = context.createGain();
      monitor.gain.value = 0;
      recordedMusic.gain.value = 0.35;
      soundtrack.connect(monitor).connect(context.destination);
      soundtrack.connect(recordedMusic).connect(output);
      audio.current = { context, output, monitor };
    }
    // Unlock audible video and Web Audio in the permission button gesture.
    void audio.current.context.resume().catch(() => {});
    video.muted = false;
    void video.play().catch(() => {});
  }

  async function connectCamera(
    direction: 'user' | 'environment',
    exact = false,
    includeMicrophone = false,
  ) {
    const feed = camera.current;
    if (!feed) return;
    const media = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: exact ? { exact: direction } : { ideal: direction } },
      audio: includeMicrophone ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
    });
    if (!open.current) {
      media.getTracks().forEach((track) => track.stop());
      return;
    }
    const cameraStream = new MediaStream(media.getVideoTracks());
    stream.current = cameraStream;
    feed.srcObject = cameraStream;
    try {
      await feed.play();
      const mix = audio.current;
      if (open.current && includeMicrophone && mix) {
        const mic = new MediaStream(media.getAudioTracks());
        const source = mix.context.createMediaStreamSource(mic);
        mix.microphoneSource?.disconnect();
        source.connect(mix.output);
        mix.microphoneSource = source;
        microphone.current = mic;
      }
    } catch (error) {
      media.getTracks().forEach((track) => track.stop());
      stream.current = null;
      throw error;
    }
    if (!open.current) return;
    setFacing(media.getVideoTracks()[0]?.getSettings().facingMode === 'environment' ? 'environment' : direction);
    setPermission('allowed');
  }

  async function startCamera() {
    setMessage('');
    setPermission('loading');
    try {
      startBackdropAudio();
      await connectCamera('user', false, true);
    } catch (error) {
      if (!open.current) return;
      setPermission('ask');
      setMessage(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Camera or microphone access was denied. Allow both in your browser settings to try again.'
        : 'The camera or microphone couldn’t start. Check both devices and try again.');
    }
  }

  async function switchCamera() {
    if (switching || recorder.current) return;
    setSwitching(true);
    setReady(false);
    setMessage('');
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (camera.current) camera.current.srcObject = null;
    try {
      await connectCamera(facing === 'user' ? 'environment' : 'user', true);
    } catch {
      if (!open.current) return;
      try {
        await connectCamera(facing);
        if (open.current) setMessage('The other camera is unavailable.');
      } catch {
        if (!open.current) return;
        microphone.current?.getTracks().forEach((track) => track.stop());
        microphone.current = null;
        setPermission('ask');
        setMessage('The camera couldn’t reconnect. Please try again.');
      }
    } finally {
      if (open.current) setSwitching(false);
    }
  }

  function discardCapture() {
    URL.revokeObjectURL(downloadUrl.current);
    downloadUrl.current = '';
    setSaved(null);
  }

  function saveCapture(blob: Blob, extension: string, autoDownload = false) {
    if (!open.current) return;
    if (!blob.size) {
      setMessage('The capture was empty. Please try again.');
      return;
    }
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    const url = URL.createObjectURL(blob);
    const filename = 'smara-' + slug + '-' + Date.now() + '.' + extension;
    downloadUrl.current = url;
    setSaved({ url, filename });
    if (!autoDownload) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
  }

  function takePhoto() {
    setMessage('');
    canvas.current?.toBlob((photo) => {
      if (photo) saveCapture(photo, 'jpg', true);
      else if (open.current) setMessage('The photo couldn’t be saved. Please try again.');
    }, 'image/jpeg', 0.92);
  }

  function toggleRecording() {
    if (recorder.current?.state === 'recording') {
      recorder.current.stop();
      return;
    }
    const output = canvas.current;
    if (!output || recorder.current) return;
    setMessage('');
    if (!output.captureStream || typeof MediaRecorder === 'undefined') {
      setMessage('Video recording is unavailable in this browser. You can still take photos.');
      return;
    }
    let capture: MediaStream | undefined;
    try {
      const mimeType = ['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      const mix = audio.current;
      if (!mix || !microphone.current?.getAudioTracks().some((track) => track.readyState === 'live')) {
        setMessage('Microphone access is needed to record video with sound.');
        return;
      }
      void mix.context.resume().catch(() => {});
      capture = output.captureStream(30);
      for (const track of mix.output.stream.getAudioTracks()) capture.addTrack(track.clone());
      const active = new MediaRecorder(capture, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      active.ondataavailable = ({ data }) => { if (data.size) chunks.push(data); };
      active.onerror = () => {
        active.onstop = null;
        active.stream.getTracks().forEach((track) => track.stop());
        recorder.current = null;
        setRecording(false);
        setMessage('Recording stopped unexpectedly. Please try again.');
      };
      active.onstop = () => {
        active.stream.getTracks().forEach((track) => track.stop());
        recorder.current = null;
        if (!open.current) return;
        setRecording(false);
        const type = active.mimeType || chunks[0]?.type || 'video/webm';
        saveCapture(new Blob(chunks, { type }), type.startsWith('video/mp4') ? 'mp4' : 'webm');
      };
      active.start(1000);
      recordingStarted.current = performance.now();
      setSeconds(0);
      recorder.current = active;
      setRecording(true);
    } catch {
      capture?.getTracks().forEach((track) => track.stop());
      setMessage('Video recording couldn’t start. You can still take photos.');
    }
  }

  const reviewingVideo = saved && !saved.filename.endsWith('.jpg') ? saved : null;
  useEffect(() => {
    const monitor = audio.current?.monitor;
    if (monitor) monitor.gain.value = permission === 'allowed' && !reviewingVideo ? 1 : 0;
  }, [permission, reviewingVideo]);

  const elapsed = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');

  return (
    <dialog
      ref={dialog}
      aria-label={`${name} camera experience`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="m-auto max-h-none max-w-none overflow-hidden rounded-2xl bg-black p-0 text-white backdrop:bg-black/75"
      style={{ width: 'min(calc(100vw - 2rem), calc(56.25dvh - 1.125rem), 1080px)' }}
    >
      <div className="relative aspect-[9/16]">
        <video
          ref={backdropVideo}
          src={video}
          poster={image}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!ready && <img src={arLogo} alt="" className="pointer-events-none absolute bottom-[1.77%] left-[3.15%] z-10 h-[3.96%] w-auto drop-shadow-[0_0_5px_rgba(255,255,255,0.75)]" />}
        <video ref={camera} muted playsInline className="sr-only" aria-hidden="true" />
        <canvas ref={canvas} width={1080} height={1920} className={`absolute inset-0 h-full w-full ${ready ? '' : 'invisible'}`} aria-hidden="true" />
        {reviewingVideo && (
          <video src={reviewingVideo.url} controls loop playsInline aria-label="Recorded video preview" className="absolute inset-0 h-full w-full bg-black object-contain pb-16" />
        )}
        <button type="button" aria-label="Close experience" onClick={onClose} className={captureButtonClass + ' absolute right-2 top-2 z-10'}>
          <X size={20} aria-hidden="true" />
        </button>
        {permission !== 'allowed' && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 p-4 text-center">
            <div className="max-w-xs rounded-2xl bg-black/80 p-4">
              <p>This experience needs access to your camera and microphone. Allow access?</p>
              <div className="mt-4 flex justify-center gap-3">
                <button type="button" disabled={permission === 'loading'} onClick={startCamera} className="rounded-full bg-white px-4 py-2 text-black disabled:opacity-50">Yes</button>
                <button type="button" onClick={onClose} className="rounded-full border border-white/60 px-4 py-2">No</button>
              </div>
              {permission === 'loading' && <p role="status" className="mt-3 text-sm">Waiting for camera permission…</p>}
              {message && <p role="status" className="mt-3 text-sm">{message}</p>}
            </div>
          </div>
        )}
        {permission === 'allowed' && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
            {recording && <p role="timer" aria-label="Recording time" className="mx-auto mb-2 w-fit rounded-full bg-black/65 px-3 py-1 text-sm tabular-nums">{elapsed}</p>}
            <div className="relative flex justify-center gap-3">
              {reviewingVideo ? (
                <>
                  <a href={reviewingVideo.url} download={reviewingVideo.filename} aria-label="Save video" className={captureButtonClass}><Download size={20} aria-hidden="true" /></a>
                  <button type="button" aria-label="Start over" onClick={discardCapture} className={captureButtonClass}><RotateCcw size={20} aria-hidden="true" /></button>
                </>
              ) : (
                <>
                  <button type="button" disabled={!ready || switching} aria-label="Take JPEG photo" onClick={takePhoto} className={captureButtonClass}><Camera size={20} aria-hidden="true" /></button>
                  <button type="button" disabled={!ready || switching} aria-label={recording ? 'Stop recording' : 'Record video'} aria-pressed={recording} onClick={toggleRecording} className={captureButtonClass}>
                    {recording ? <Square size={18} aria-hidden="true" /> : <Video size={20} aria-hidden="true" />}
                  </button>
                  <button type="button" disabled={!ready || recording || switching} aria-label="Switch camera" onClick={switchCamera} className={captureButtonClass + ' absolute bottom-0 right-0 hidden [@media(pointer:coarse)]:grid'}>
                    <SwitchCamera size={20} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
            {!ready && <p role="status" className="mt-2 text-xs">{switching ? 'Switching camera…' : 'Preparing background removal…'}</p>}
            {message && <p role="status" className="mt-2 text-xs">{message}</p>}
            {saved && !reviewingVideo && <a href={saved.url} download={saved.filename} className="mt-2 inline-block text-xs underline">Download last photo</a>}
          </div>
        )}
      </div>
    </dialog>
  );
}

function ArExperiencePage() {
  const [selectedSample, setSelectedSample] = useState<ArSample | null>(null);
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto min-h-[60vh] max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
        <h1 className="display">Augment Reality (AR) Experience</h1>
        <ul aria-label="AR filter samples" className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-6">
          {arSamples.map((sample) => (
            <li key={sample.slug} className="relative min-w-0">
              <img
                src={sample.image}
                alt={sample.name}
                width={1080}
                height={1920}
                className="block h-auto w-full rounded-2xl sm:rounded-3xl"
              />
              <div className="absolute inset-0 grid place-items-center p-1.5 sm:p-3">
                <button
                  type="button"
                  onClick={() => setSelectedSample(sample)}
                  aria-label={`click me to experience ${sample.name}`}
                  className="flex min-h-11 max-w-full flex-col items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.7)] sm:px-4 sm:text-sm"
                >
                  <Camera size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
                  <span>click me to experience</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
        {selectedSample && <CameraExperience key={selectedSample.slug} sample={selectedSample} onClose={() => setSelectedSample(null)} />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <PageSeo />
      <Navigation />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/ar-experience" element={<ArExperiencePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/art-cards" element={<ArtCardsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;



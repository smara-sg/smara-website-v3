import { useEffect, useRef, useState } from 'react';
import { startPersonRenderer } from './ar/personRenderer';
import { needsMobileMaskCompatibility } from './ar/compatibility';
import { personPlacement } from './ar/framing';
import { Camera, Download, Link2, QrCode, ShoppingBasket, RotateCcw, Square, SwitchCamera, Video, X } from 'lucide-react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FilterQrDialog from './components/FilterQrDialog';
import { filterPath } from './ar/filterLinks';
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

type ArSample = { name: string; slug: string; image: string; video: string; embeddedLogo?: boolean; newRow?: boolean };

const publicArSamples: ArSample[] = [
  { name: 'Tropical Mandala', slug: 'tropical-mandala', image: '/images/ar-mandala-1h.jpg', video: '/images/ar-mandala-1h.mp4', embeddedLogo: true },
];
const workingArSamples: ArSample[] = [
  { name: 'Moonlit Mandala', slug: 'moonlit-mandala', image: '/images/ar-mandala-2g.jpg', video: '/hiddenpage/media/moonlit-mandala.mp4', embeddedLogo: true },
  { name: 'Mountain Mandala', slug: 'mountain-mandala', image: '/images/ar-mandala-3b.jpg', video: '/hiddenpage/media/mountain-mandala.mp4', embeddedLogo: true },
];
const collectionSamples = [
  { name: 'Moonlit Mandala', image: '/images/ar-mandala-2g.jpg' },
  { name: 'Mountain Mandala', image: '/images/ar-mandala-3b.jpg' },
  { name: 'Waterfall and Kingfisher', image: '/images/ar-waterfall-kingfisher.jpg' },
];
const overlayClass = 'flex min-h-11 max-w-full flex-col items-center justify-center gap-2 px-4 py-3 text-lg font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.7)]';

const arLogo = '/images/smara-ar-logo.png';
// Set to zero to remove the optional, very faint lily-pond sky movement.
const lotusSkyMistOpacity = 0.055;
const maxRecordingSeconds = 60;

const captureButtonClass = 'grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40';

function CameraExperience({ sample, onClose }: { sample: ArSample; onClose: () => void }) {
  const { name, slug, image, video, embeddedLogo = false } = sample;
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
  const reviewing = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [switching, setSwitching] = useState(false);
  const [permission, setPermission] = useState<'ask' | 'loading' | 'allowed'>('ask');
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [framing, setFraming] = useState<'fit' | 'fill'>('fit');
  const cameraFraming = useRef<'fit' | 'fill'>('fit');
  useEffect(() => { cameraFraming.current = framing; }, [framing]);
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
    foreground.width = 720;
    foreground.height = 1280;

    const background = new Image();
    background.src = image;
    const logo = new Image();
    if (!embeddedLogo) logo.src = arLogo;
    const leaves = slug === 'moonlit-lotus-pond' ? new Image() : undefined;
    if (leaves) leaves.src = '/images/lotus-foreground-leaves-left-v2.png';
    const rightLeaves = leaves ? new Image() : undefined;
    if (rightLeaves) rightLeaves.src = '/images/lotus-foreground-leaves-right-v2.png';

    // Build the soft cloud once; only its position changes during compositing.
    const skyMist = leaves ? document.createElement('canvas') : undefined;
    if (skyMist) {
      skyMist.width = 960;
      skyMist.height = 380;
      const mist = skyMist.getContext('2d');
      if (mist) {
        for (const [x, y, width, height] of [
          [240, 200, 210, 95], [460, 155, 250, 130], [700, 210, 220, 100],
        ]) {
          mist.save();
          mist.translate(x, y);
          mist.scale(width, height);
          const glow = mist.createRadialGradient(0, 0, 0, 0, 0, 1);
          glow.addColorStop(0, 'rgba(205, 213, 240, 0.8)');
          glow.addColorStop(0.45, 'rgba(197, 207, 234, 0.35)');
          glow.addColorStop(1, 'rgba(197, 207, 234, 0)');
          mist.fillStyle = glow;
          mist.fillRect(-1, -1, 2, 2);
          mist.restore();
        }
      }
    }
    const breezeStartedAt = performance.now();
    let active = true;
    let animation = 0;
    let stopPersonRenderer: (() => void) | undefined;
    let firstFrame = true;
    let lastDraw = -Infinity;

    function handleFailure() {
      if (!active) return;
      cancelAnimationFrame(animation);
      stopPersonRenderer?.();
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
      if (!active || !output || !ctx) return;
      const now = performance.now();
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
      // Mist stays in the sky, behind the person, and is part of captured media.
      if (skyMist && lotusSkyMistOpacity > 0) {
        const cloudWidth = output.width * 0.95;
        const cloudHeight = output.height * 0.20;
        const progress = ((now - breezeStartedAt) / 240000 + 0.28) % 1;
        const cloudX = -cloudWidth + progress * (output.width + 2 * cloudWidth);
        ctx.save();
        ctx.globalAlpha = lotusSkyMistOpacity;
        ctx.drawImage(skyMist, cloudX, output.height * 0.055, cloudWidth, cloudHeight);
        ctx.restore();
      }
      const placement = personPlacement(foreground.width, foreground.height, output.width, output.height, needsMobileMaskCompatibility(navigator), cameraFraming.current);
      ctx.drawImage(foreground, placement.x, placement.y, placement.width, placement.height);
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
          // The reference cluster leans toward the right edge in its original orientation.
          ctx.rotate(side === 1 ? sway * 0.7 : sway);
          ctx.drawImage(sprite, side === 1 ? -leafWidth : -leafWidth * 0.1, -leafHeight, leafWidth, leafHeight);
          ctx.restore();
        }
      }
      if (!embeddedLogo) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
        ctx.shadowBlur = 14;
        const logoHeight = 76;
        const logoWidth = logoHeight * logo.naturalWidth / logo.naturalHeight;
        ctx.drawImage(logo, 34, output.height - logoHeight - 34, logoWidth, logoHeight);
        ctx.restore();
      }
    }

    async function startSegmentation() {
      try {
        await Promise.all([background.decode(), embeddedLogo ? Promise.resolve() : logo.decode()]);
        // A missing decorative asset must not stop the camera experience.
        await Promise.all([leaves, rightLeaves].map(sprite => sprite?.decode().catch(() => undefined)));
        if (!active) return;
        stopPersonRenderer = startPersonRenderer(feed!, foreground, facing === 'user', () => {
          if (!active) return;
          firstFrame = false;
          setReady(true);
        }, handleFailure, () => reviewing.current);
        const render = (timestamp: number) => {
          if (!active) return;
          animation = requestAnimationFrame(render);
          if (document.hidden || reviewing.current || timestamp - lastDraw < 1000 / 30) return;
          lastDraw = timestamp;
          draw();
        };
        animation = requestAnimationFrame(render);
      } catch {
        handleFailure();
      }
    }

    void startSegmentation();
    return () => {
      active = false;
      cancelAnimationFrame(animation);
      stopPersonRenderer?.();
    };
  }, [permission, facing, switching, image, slug, embeddedLogo]);

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
      video: {
        facingMode: exact ? { exact: direction } : { ideal: direction },
        // Prefer an uncropped sensor frame on mobile; portrait fitting happens after cutout.
        ...(needsMobileMaskCompatibility(navigator)
          ? { width: { ideal: 1280 }, height: { ideal: 1280 }, resizeMode: { ideal: 'none' } }
          : { width: { ideal: 720 }, height: { ideal: 1280 } }),
        frameRate: { ideal: 30, max: 30 },
      },
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
    reviewing.current = Boolean(reviewingVideo);
    const monitor = audio.current?.monitor;
    if (monitor) monitor.gain.value = permission === 'allowed' && !reviewingVideo ? 1 : 0;
  }, [permission, reviewingVideo]);

  const elapsed = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');

  return (
    <dialog
      ref={dialog}
      aria-label={`${name} camera experience`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="ar-dialog m-auto max-h-none max-w-none overflow-hidden rounded-2xl bg-black p-0 text-white backdrop:bg-black/75"
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
        {!ready && !embeddedLogo && <img src={arLogo} alt="" className="pointer-events-none absolute bottom-[1.77%] left-[3.15%] z-10 h-[3.96%] w-auto drop-shadow-[0_0_5px_rgba(255,255,255,0.75)]" />}
        <video ref={camera} muted playsInline className="sr-only" aria-hidden="true" />
        <canvas ref={canvas} width={1080} height={1920} className={`absolute inset-0 h-full w-full ${ready ? '' : 'invisible'}`} aria-hidden="true" />
        {reviewingVideo && (
          <video src={reviewingVideo.url} controls loop playsInline aria-label="Recorded video preview" className="absolute inset-0 h-full w-full bg-black object-contain pb-16" />
        )}
        <button type="button" aria-label="Close experience" onClick={onClose} className={captureButtonClass + ' absolute right-2 top-2 z-10'}>
          <X size={20} aria-hidden="true" />
        </button>
        {permission === 'allowed' && needsMobileMaskCompatibility(navigator) && (
          <div role="group" aria-label="Camera framing" className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 rounded-full bg-black/65 p-1 text-sm">
            {(['fit', 'fill'] as const).map(value => (
              <button key={value} type="button" aria-pressed={framing === value} disabled={recording || switching}
                onClick={() => setFraming(value)}
                className={`min-h-11 whitespace-nowrap rounded-full px-3 disabled:opacity-50 ${framing === value ? 'bg-white text-black' : 'text-white'}`}>
                {value === 'fit' ? 'Fit view' : 'Fill frame'}
              </button>
            ))}
          </div>
        )}
        {permission !== 'allowed' && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 p-4 text-center">
            <div className="max-w-xs rounded-2xl bg-black/80 p-5 text-base leading-relaxed">
              <p>This experience needs access to your camera and microphone. Allow access?</p>
              <div className="mt-4 flex justify-center gap-3">
                <button type="button" disabled={permission === 'loading'} onClick={startCamera} className="min-h-12 min-w-16 rounded-full bg-white px-4 py-2 text-black disabled:opacity-50">Yes</button>
                <button type="button" onClick={onClose} className="min-h-12 min-w-16 rounded-full border border-white/60 px-4 py-2">No</button>
              </div>
              {permission === 'loading' && <p role="status" className="mt-3 text-sm">Waiting for camera permission…</p>}
              {message && <p role="status" className="mt-3 text-sm">{message}</p>}
            </div>
          </div>
        )}
        {permission === 'allowed' && (
          <div className="absolute inset-x-0 bottom-0 ar-capture-controls bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
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

function ArFilterCard({ sample, onQr }: { sample: ArSample; onQr: (sample: ArSample) => void }) {
  return <li className="mx-auto w-full max-w-[22rem] min-w-0">
    <div className="relative">
      <img src={sample.image} alt={sample.name} width={1080} height={1920} className="block h-auto w-full rounded-2xl sm:rounded-3xl" />
      <div className="absolute inset-0 grid place-items-center p-3">
        <a href={filterPath(sample.slug)} target="_blank" rel="noopener noreferrer" aria-label={`click me to experience ${sample.name} (opens in a new tab)`} className={overlayClass}>
          <Camera size={20} strokeWidth={1.5} aria-hidden="true" /><span>click me to experience</span>
        </a>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-center gap-5 text-base text-mute">
      <Link to={filterPath(sample.slug)} target="_blank" rel="noopener noreferrer" aria-label={`Share ${sample.name}`} className="inline-flex min-h-12 items-center gap-2 hover:text-ink"><Link2 size={18} strokeWidth={1.5} aria-hidden="true" />share</Link>
      <button type="button" onClick={() => onQr(sample)} aria-label={`QR code for ${sample.name}`} className="inline-flex min-h-12 items-center gap-2 hover:text-ink"><QrCode size={18} strokeWidth={1.5} aria-hidden="true" />QR code</button>
    </div>
  </li>;
}

function ServerRedirect({ to }: { to: string }) {
  useEffect(() => { window.location.replace(to); }, [to]);
  return <p role="status">Opening your AR experience…</p>;
}

function useWorkingAccess(enabled: boolean) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetch('/hiddenpage/access.json', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => response.ok && response.headers.get('content-type')?.includes('application/json') ? response.json() : null)
      .then(result => { if (!controller.signal.aborted) setAllowed(result?.authorized === true); })
      .catch(() => {});
    return () => controller.abort();
  }, [enabled]);
  return !enabled || allowed;
}

function ArExperiencePage({ working = false }: { working?: boolean }) {
  const [searchParams] = useSearchParams();
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => { setClientReady(true); }, []);
  const allowed = useWorkingAccess(working);
  const selectedSample = clientReady ? [...publicArSamples, ...workingArSamples].find(sample => sample.slug === searchParams.get('filter')) : null;
  const [qrSample, setQrSample] = useState<ArSample | null>(null);
  if (selectedSample) return <ServerRedirect to={filterPath(selectedSample.slug)} />;
  return <div className="min-h-screen bg-white">
    <main className="mx-auto min-h-[60vh] max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
      <h1 className="display">{working ? 'hidden: working filters' : 'Augment Reality (AR) Experience'}</h1>
      {allowed ? <>
        <ul aria-label={working ? 'Working AR filters' : 'AR filter samples'} className={working ? 'mx-auto mt-10 grid max-w-xl grid-cols-1 gap-6 min-[480px]:grid-cols-2' : 'mx-auto mt-10 w-full max-w-[22rem] md:max-w-[15rem]'}>
          {(working ? workingArSamples : publicArSamples).map(sample => <ArFilterCard key={sample.slug} sample={sample} onQr={setQrSample} />)}
        </ul>
        {!working && <ul aria-label="Collect filters" className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 min-[480px]:grid-cols-2 md:grid-cols-3">
          {collectionSamples.map(sample => <li key={sample.name} className="relative mx-auto w-full max-w-[22rem]">
            <img src={sample.image} alt={sample.name} width={1080} height={1920} className="block h-auto w-full rounded-2xl sm:rounded-3xl" />
            <div className="absolute inset-0 grid place-items-center p-3">
              <button type="button" disabled aria-label={`Collect ${sample.name} — purchase link not yet available`} className={overlayClass}>
                <ShoppingBasket size={66} strokeWidth={1.5} aria-hidden="true" /><span>collect this filter!</span>
              </button>
            </div>
          </li>)}
        </ul>}
      </> : <p role="status" className="mt-10">Owner access required. <a href="/hiddenpage/" className="underline">Sign in</a></p>}
      {qrSample && <FilterQrDialog name={qrSample.name} slug={qrSample.slug} onClose={() => setQrSample(null)} />}
    </main><Footer />
  </div>;
}

function StandaloneCameraPage({ working = false }: { working?: boolean }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => { setClientReady(true); }, []);
  const allowed = useWorkingAccess(working);
  const sample = (working ? workingArSamples : publicArSamples).find(value => value.slug === searchParams.get('filter'));
  const legacyPrivate = !working && workingArSamples.find(value => value.slug === searchParams.get('filter'));
  if (clientReady && legacyPrivate) return <ServerRedirect to={filterPath(legacyPrivate.slug)} />;
  if (clientReady && !sample) return <Navigate to={working ? '/hiddenpage/' : '/ar-experience/'} replace />;
  return <main className="min-h-[100dvh] bg-black text-white">
    <h1 className="sr-only">SMARA AR camera</h1>
    {clientReady && allowed && sample
      ? <CameraExperience key={sample.slug} sample={sample} onClose={() => navigate(working ? '/hiddenpage/' : '/ar-experience/')} />
      : <p role="status" className="p-6 text-center">{working && !allowed ? 'Owner access required.' : 'Opening your AR experience…'}</p>}
  </main>;
}

function App() {
  const { pathname } = useLocation();
  const cameraPage = ['/ar-camera', '/hiddenpage/camera'].includes(pathname.replace(/\/$/, ''));
  return (
    <div className="min-h-screen">
      <PageSeo />
      {!cameraPage && <Navigation />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/ar-experience" element={<ArExperiencePage />} />
        <Route path="/ar-camera" element={<StandaloneCameraPage />} />
        <Route path="/hiddenpage" element={<ArExperiencePage key="working" working />} />
        <Route path="/hiddenpage/camera" element={<StandaloneCameraPage key="working-camera" working />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/art-cards" element={<ArtCardsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;






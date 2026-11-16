import { useEffect, useRef, useState } from 'react';
import { Camera, Square, Video, X } from 'lucide-react';
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
  { name: 'Moonlit Lotus Pond', image: '/images/ar-moonlit-lotus-pond.jpg' },
  { name: 'Misty Mountain', image: '/images/ar-misty-mountain-v2.jpg' },
  { name: 'Tropical Beach', image: '/images/ar-tropical-beach.jpg' },
];

const captureButtonClass = 'grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40';

function PondExperience({ image, onClose }: { image: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useRef<HTMLImageElement>(null);
  const camera = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const downloadUrl = useRef('');
  const open = useRef(false);
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
      URL.revokeObjectURL(downloadUrl.current);
    };
  }, []);

  useEffect(() => {
    if (permission !== 'allowed') return;
    const output = canvas.current;
    const feed = camera.current;
    const scene = backdrop.current;
    const ctx = output?.getContext('2d');
    if (!ctx || !output || !feed || !scene) return;

    let firstFrame = true;
    const draw = () => {
      if (!scene.naturalWidth || feed.readyState < 2 || !feed.videoWidth) return;
      ctx.drawImage(scene, 0, 0, output.width, output.height);
      const x = 150, y = 440, width = 780, height = 920;
      const scale = Math.max(width / feed.videoWidth, height / feed.videoHeight);
      const cropWidth = width / scale, cropHeight = height / scale;
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, height, 90);
      else ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.translate(output.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(feed, (feed.videoWidth - cropWidth) / 2, (feed.videoHeight - cropHeight) / 2, cropWidth, cropHeight, x, y, width, height);
      ctx.restore();
      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
    };
    draw();
    const timer = globalThis.setInterval(draw, 1000 / 30);
    return () => globalThis.clearInterval(timer);
  }, [permission]);

  async function startCamera() {
    const feed = camera.current;
    if (!feed) return;
    setMessage('');
    setPermission('loading');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'user' } }, audio: false });
      if (!open.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      feed.srcObject = media;
      await feed.play();
      if (open.current) setPermission('allowed');
    } catch (error) {
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      if (!open.current) return;
      setPermission('ask');
      setMessage(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Camera access was denied. Allow it in your browser settings to try again.'
        : 'The camera couldn’t start. Check that your browser can access a camera and try again.');
    }
  }

  function saveCapture(blob: Blob, extension: string) {
    if (!open.current) return;
    if (!blob.size) {
      setMessage('The capture was empty. Please try again.');
      return;
    }
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    const url = URL.createObjectURL(blob);
    const filename = 'smara-lotus-pond-' + Date.now() + '.' + extension;
    downloadUrl.current = url;
    setSaved({ url, filename });
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
      if (photo) saveCapture(photo, 'jpg');
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
      const mimeType = ['video/mp4', 'video/webm;codecs=vp8', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      capture = output.captureStream(30);
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
      recorder.current = active;
      setRecording(true);
    } catch {
      capture?.getTracks().forEach((track) => track.stop());
      setMessage('Video recording couldn’t start. You can still take photos.');
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Moonlit Lotus Pond camera experience"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="m-auto max-h-none max-w-none overflow-hidden rounded-2xl bg-black p-0 text-white backdrop:bg-black/75"
      style={{ width: 'min(calc(100vw - 2rem), calc(56.25dvh - 1.125rem), 1080px)' }}
    >
      <div className="relative aspect-[9/16]">
        <img ref={backdrop} src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <video ref={camera} muted playsInline className="sr-only" aria-hidden="true" />
        <canvas ref={canvas} width={1080} height={1920} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <button type="button" aria-label="Close experience" onClick={onClose} className={captureButtonClass + ' absolute right-2 top-2 z-10'}>
          <X size={20} aria-hidden="true" />
        </button>
        {permission !== 'allowed' && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 p-4 text-center">
            <div className="max-w-xs rounded-2xl bg-black/80 p-4">
              <p>this function requires your permission to use the camera: yes or no</p>
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
            <div className="flex justify-center gap-4">
              <button type="button" disabled={!ready} aria-label="Take JPEG photo" onClick={takePhoto} className={captureButtonClass}><Camera size={20} aria-hidden="true" /></button>
              <button type="button" disabled={!ready} aria-label={recording ? 'Stop and save video' : 'Record video'} aria-pressed={recording} onClick={toggleRecording} className={captureButtonClass}>
                {recording ? <Square size={18} aria-hidden="true" /> : <Video size={20} aria-hidden="true" />}
              </button>
            </div>
            {!ready && <p role="status" className="mt-2 text-xs">Starting the camera…</p>}
            {recording && <p role="status" className="mt-2 text-xs">Recording</p>}
            {message && <p role="status" className="mt-2 text-xs">{message}</p>}
            {saved && <a href={saved.url} download={saved.filename} className="mt-2 inline-block text-xs underline">Download last capture</a>}
          </div>
        )}
      </div>
    </dialog>
  );
}

function ArExperiencePage() {
  const [pondOpen, setPondOpen] = useState(false);
  const pond = arSamples[0];
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto min-h-[60vh] max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
        <h1 className="display">Augment Reality (AR) Experience</h1>
        <ul aria-label="AR filter samples" className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-6">
          {arSamples.map(({ name, image }) => (
            <li key={name} className="relative min-w-0">
              <img
                src={image}
                alt={name}
                width={1080}
                height={1920}
                className="block h-auto w-full rounded-2xl sm:rounded-3xl"
              />
              <div className="absolute inset-0 grid place-items-center p-1.5 sm:p-3">
                <button
                  type="button"
                  disabled={name !== pond.name}
                  onClick={() => setPondOpen(true)}
                  aria-label={`click me to experience ${name}${name === pond.name ? '' : ' (coming soon)'}`}
                  className="flex min-h-11 max-w-full flex-col items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.7)] sm:px-4 sm:text-sm"
                >
                  <Camera size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
                  <span>click me to experience</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
        {pondOpen && <PondExperience image={pond.image} onClose={() => setPondOpen(false)} />}
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

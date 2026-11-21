import { lazy, Suspense, useEffect, useState } from 'react';
import { Camera, Link2, QrCode, ShoppingBasket } from 'lucide-react';
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

import type { ArSample } from './ar/types';

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
  { name: 'Waterfall and Kingfisher', image: '/images/ar-waterfall-kingfisher.jpg', showBrand: true },
];
const overlayClass = 'flex min-h-11 max-w-full flex-col items-center justify-center gap-3 px-3 py-3 text-[22px] font-semibold leading-tight text-white [text-shadow:0_2px_3px_rgba(0,0,0,1),0_0_12px_rgba(0,0,0,0.95),0_0_3px_rgba(255,255,255,0.5)] [&>svg]:shrink-0 [&>svg]:[filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.95))_drop-shadow(0_0_5px_rgba(255,255,255,0.65))]';

const arLogo = '/images/smara-ar-logo.png';
const CameraExperience = lazy(() => import('./components/CameraExperience'));

function ArFilterCard({ sample, onQr }: { sample: ArSample; onQr: (sample: ArSample) => void }) {
  return <li className="mx-auto w-full max-w-[22rem] min-w-0">
    <div className="relative">
      <img src={sample.image} alt={sample.name} width={1080} height={1920} className="block h-auto w-full rounded-2xl sm:rounded-3xl" />
      <div className="absolute inset-0 grid place-items-center p-3">
        <a href={filterPath(sample.slug)} target="_blank" rel="noopener noreferrer" aria-label={`click me to experience ${sample.name} (opens in a new tab)`} className={overlayClass}>
          <Camera size={60} strokeWidth={1.5} aria-hidden="true" /><span>click me to experience</span>
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

function CollectionCards() {
  return (<ul aria-label="Collect filters" className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 min-[480px]:grid-cols-2 md:grid-cols-3">
          {collectionSamples.map(sample => <li key={sample.name} className="relative mx-auto w-full max-w-[22rem] [container-type:inline-size]">
            <img src={sample.image} alt={sample.name} width={1080} height={1920} loading="lazy" decoding="async" className="block h-auto w-full rounded-2xl sm:rounded-3xl" />
            {'showBrand' in sample && sample.showBrand && <div aria-label="SMARA" className="pointer-events-none absolute bottom-[3%] right-[5%] flex w-[16%] flex-col items-center gap-[1.8cqw] drop-shadow-[0_0_3px_rgba(255,255,255,0.6)]">
              <img src={arLogo} alt="" width={76} height={144} className="block h-auto w-[42%]" />
              <span className="text-[3.1cqw] font-normal leading-none tracking-[0.27em] text-white">SMARA</span>
            </div>}
            <div className="absolute inset-0 grid place-items-center p-3">
              <button type="button" disabled aria-label={`Collect ${sample.name} — purchase link not yet available`} className={overlayClass}>
                <ShoppingBasket size={72} strokeWidth={1.5} aria-hidden="true" /><span>collect this filter!</span>
              </button>
            </div>
          </li>)}
        </ul>);
}

function BuyYourOwnPage() {
  return <div className="min-h-screen bg-white">
    <main className="mx-auto min-h-[60vh] max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
      <h1 className="display">Buy your own!</h1>
      <p className="lede mx-auto mt-8 max-w-2xl">Collect a SMARA filter of your own.</p>
      <CollectionCards />
    </main>
    <Footer />
  </div>;
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
        {!working && <CollectionCards />}
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
      ? <Suspense fallback={<p role="status" className="p-6 text-center">Opening your AR experience…</p>}><CameraExperience key={sample.slug} sample={sample} onClose={() => navigate(working ? '/hiddenpage/' : '/ar-experience/')} /></Suspense>
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
        <Route path="/buy-your-own" element={<BuyYourOwnPage />} />
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






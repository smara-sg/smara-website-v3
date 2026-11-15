import { Camera } from 'lucide-react';
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

function ArExperiencePage() {
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
                  disabled
                  aria-label={`click me to experience ${name} (coming soon)`}
                  className="flex min-h-11 max-w-full flex-col items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_9px_rgba(0,0,0,0.7)] sm:px-4 sm:text-sm"
                >
                  <Camera size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
                  <span>click me to experience</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
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

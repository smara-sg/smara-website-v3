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

function ArExperiencePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto min-h-[60vh] max-w-5xl px-6 pb-24 pt-24 text-center md:pt-32">
        <h1 className="display">Augment Reality (AR) Experience</h1>
        <ul aria-label="AR filter samples" className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-6">
          {['Filter 1', 'Filter 2', 'Filter 3'].map((label) => (
            <li key={label} className="min-w-0">
              <div className="grid aspect-[9/16] place-items-center rounded-2xl bg-mist p-2 text-center text-xs text-mute sm:rounded-3xl sm:text-sm">
                {label}
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

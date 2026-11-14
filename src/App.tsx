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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/art-cards" element={<ArtCardsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

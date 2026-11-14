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

function Home() {
  return (
    <>
      <HeroSection />
      <WhatIsSmara />
      <div className="bg-smara-2 bg-band" aria-hidden="true" />
      <Experience />
      <div className="bg-smara-3 bg-band" aria-hidden="true" />
      <Testimonials />
      <Community />
      <Footer />
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

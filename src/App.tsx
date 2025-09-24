import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function Home() {
  return (
    <>
      <HeroSection />
      <WhatIsSmara />
      <Experience />
      <Testimonials />
      <Community />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/art-cards" element={<ArtCardsPage />} />
          <Route path="*" element={<Home />} /> {/* Fallback to home */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import WhatIsSmara from './components/WhatIsSmara';
import Experience from './components/Experience';
import Testimonials from './components/Testimonials';
import Community from './components/Community';
import EventsPage from './components/EventsPage';
import AboutPage from './components/AboutPage';
import GalleryPage from './components/GalleryPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'gallery':
        return <GalleryPage onPageChange={setCurrentPage} />;
      case 'events':
        return <EventsPage />;
      case 'about':
        return <AboutPage />;
      default:
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
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
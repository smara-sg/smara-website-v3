import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-2]"
        style={{ 
          backgroundImage: 'url(/images/smara1a.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      {/* Restored Dark Scrim & Soft Blur Overlay */}
      <div className="absolute inset-0 z-[-1] bg-slate-950/45 backdrop-blur-[2px]" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-wide [text-shadow:0_2px_8px_rgba(0,0,0,0.75)]">
          SMARA
        </h1>
        <h2 className="text-2xl md:text-3xl font-light mb-8 [text-shadow:0_2px_6px_rgba(0,0,0,0.65)]">
          Self-Gaze Meditation Augmented Reality Art
        </h2>
        <h3 className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
          Discover inner peace as art, music, and your own reflection guide you inward.
        </h3>
      </div>
    </section>
  );
};

export default HeroSection;

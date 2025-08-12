import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundImage: 'url(/images/smara1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>
      <div className="absolute inset-0 bg-black/50 z-[-1]"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-wide timer-glow">
          Smara
        </h1>
        <h2 className="text-2xl md:text-3xl font-light mb-8 opacity-90 animate-float">
          Self-Gaze Meditation Augmented Reality Art
        </h2>
        <h3 className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed opacity-80 animate-pulse-slow">
          Discover inner peace as art, music, and your own reflection guide you inward.
        </h3>
      </div>
    </section>
  );
};

export default HeroSection;
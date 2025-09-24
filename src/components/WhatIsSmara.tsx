import React from 'react';
import { Heart, Focus, Leaf } from 'lucide-react';

const WhatIsSmara = () => {
  const benefits = [
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: "Self-Compassion",
      description: "Learn to greet yourself with kindness and be present with oneself."
    },
    {
      icon: <Focus className="w-8 h-8 text-blue-500" />,
      title: "Mindfulness",
      description: "Anchor attention in the here-and-now through focused, visual presence."
    },
    {
      icon: <Leaf className="w-8 h-8 text-green-500" />,
      title: "Relaxation",
      description: "Let tension melt as breath, music, and art settle in the present."
    }
  ];

  return (
    <section className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundImage: 'url(/images/smara2a.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>
      {/* Removed dark overlay div */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            What is SMARA?
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              Self-gaze meditation is a mindfulness practice that involves a deep and direct gaze at one’s own reflection. It offers many benefits including
improving mental well-being and finding a sense of relaxation and calm. With SMARA, an AR filter layers generative art and calming soundscapes over your reflection, turning the screen into a gentle sanctuary for self-discovery.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12">
              <div className="glass-card aspect-[4/3] rounded-lg overflow-hidden hover-lift">
                <img src="/images/smara4.png"
    alt="Self-gaze meditation practice"
    className="w-full h-full object-cover"
  />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">The Practice</h3>
                <p className="text-lg text-gray-200 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                By blending technology with timeless mindfulness, SMARA invites you to sit, breathe, and truly see yourself. Each session is a conversation between your inner world and the moving artwork around you, cultivating calm and clarity in minutes.
                </p>
              </div>
            </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] mt-8">
            A transformative experience that combines art, technology, and mindfulness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300 leaf-float">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-medium text-white mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{benefit.title}</h3>
              <p className="text-gray-200 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSmara;
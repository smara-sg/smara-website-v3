import React from 'react';
import { QrCode } from 'lucide-react';

const Experience = () => {
  const filters = [
    { name: "Flowing Waters", description: "Gentle ripples with oceanic sounds" },
    { name: "Celestial Garden", description: "Blooming patterns with nature ambience" },
    { name: "Sacred Geometry", description: "Mandala formations with meditation tones" }
  ];

  const steps = [
    {
      number: "1",
      title: "Set Your Space",
      description: "Find a quiet, comfortable place. Sit upright, open the SMARA AR filter on your device."
    },
    {
      number: "2", 
      title: "Prepare to Gaze",
      description: "Ensure you can see yourself in the filter and hear the music. Close your eyes and begin deep breaths."
    },
    {
      number: "3",
      title: "Calm Your Breath", 
      description: "Breathe in through your nose and exhale slowly through your mouth, making the exhale as long as possible. Continue for 1-2 minutes until you feel calm and your heart rate slows."
    },
    {
      number: "4",
      title: "Gaze and Observe",
      description: "Gently open your eyes and gaze at your reflection in the filter. Observe the art, the animation, the music, and yourself without judgment."
    },
    {
      number: "5",
      title: "Let Thoughts Pass",
      description: "Allow thoughts and emotions to come and go without assigning meaning or getting caught up in them. Simply observe."
    }
  ];

  return (
    <section className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundImage: 'url(/images/smara3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>
      <div className="absolute inset-0 bg-black/50 z-[-1]"></div>
      
      <div className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Your SMARA Experience
          </h2>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Experience self-gaze meditation with our specially designed AR filters.
          </p>
        </div>

        {/* AR Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {filters.map((filter, index) => (
            <div key={index} className="glass-card rounded-2xl p-8 hover-lift animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 gradient-ocean rounded-xl flex items-center justify-center animate-float">
                  <QrCode size={48} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-white mb-3 text-center">{filter.name}</h3>
              <p className="text-white text-center">{filter.description}</p>
            </div>
          ))}
        </div>

        {/* How to Practice */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-light text-white mb-12 text-center">How to Practice SMARA</h3>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white mb-2">{step.title}</h4>
                  <p className="text-gray-200 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
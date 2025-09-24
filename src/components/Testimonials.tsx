import React from 'react';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "SMARA has completely transformed my relationship with myself. The gentle AR visuals help me stay present during meditation, and I've noticed a significant decrease in my anxiety levels.",
      author: "Sarah Chen",
      location: "Singapore"
    },
    {
      quote: "I was skeptical about AR meditation at first, but the experience is incredibly calming. The flowing patterns help quiet my mind in ways traditional meditation never could.",
      author: "Marcus Rodriguez",
      location: "Barcelona"
    },
    {
      quote: "As someone who struggles with self-acceptance, SMARA has been a gentle guide toward self-love. The beautiful visuals make the practice feel like a gift to myself.",
      author: "Priya Patel",
      location: "Mumbai"
    },
    {
      quote: "The combination of self-gaze and augmented reality creates such a unique meditative experience. I feel more centered and aware after each session.",
      author: "David Kim",
      location: "Seoul"
    },
    {
      quote: "SMARA helped me through a difficult period in my life. The practice taught me to be present with my emotions without judgment, leading to profound healing.",
      author: "Emma Thompson",
      location: "London"
    },
    {
      quote: "I love how accessible SMARA makes meditation. The AR filters are beautiful and the guided experience makes it easy for beginners like me to start a practice.",
      author: "Alex Johnson",
      location: "Toronto"
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
      
      <div className="relative z-10 py-20 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-8 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              What People Are Saying
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              Hear from our community of mindfulness practitioners and art lovers
            </p>
          </div>
          <div className="flex overflow-x-auto space-x-6 px-4 sm:px-6 lg:px-8 pb-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-none w-80 glass-emerald rounded-2xl p-6 hover-lift transition-all duration-300 animate-fade-in">
                <div className="flex justify-center mb-4">
                  <Quote className="w-8 h-8 text-emerald-400 animate-pulse-slow" />
                </div>
                <blockquote className="text-gray-200 leading-relaxed mb-4 text-center italic [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-center">
                  <p className="text-white font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{testimonial.author}</p>
                  <p className="text-gray-300 text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator */}
          <div className="text-center mt-6">
            <p className="text-gray-300 text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">← Scroll to read more testimonials →</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Footer from './Footer';

interface GalleryPageProps {
  onPageChange: (page: string) => void;
}

const GalleryPage = ({ onPageChange }: GalleryPageProps) => {
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);

  const artworks = [
    {
      id: 1,
      title: "Flowing Waters",
      description: "A mesmerizing piece that captures the eternal dance of water, originally painted with fluid acrylics and transformed into a gentle, rippling AR experience that responds to your breath and movement.",
      image: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 2,
      title: "Celestial Garden",
      description: "Born from mixed media collage work, this piece blooms with organic patterns and celestial motifs. The digital animation brings the garden to life, with petals that unfold as you gaze deeper into your reflection.",
      image: "https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 3,
      title: "Sacred Geometry",
      description: "Originally created with precise ink drawings and geometric constructions, this mandala-inspired artwork transforms into a living meditation tool, with patterns that pulse and evolve in harmony with your inner state.",
      image: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 4,
      title: "Ocean Dreams",
      description: "This ethereal seascape began as an oil painting capturing the infinite horizon. The AR version creates waves of color that ebb and flow, inviting you to dive deep into contemplative stillness.",
      image: "https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: 5,
      title: "Forest Whispers",
      description: "Inspired by nature walks and created with watercolor techniques, this piece brings the tranquility of ancient forests to your meditation practice, with leaves that dance gently in digital wind.",
      image: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  const nextArtwork = () => {
    setCurrentArtworkIndex((prev) => (prev + 1) % artworks.length);
  };

  const prevArtwork = () => {
    setCurrentArtworkIndex((prev) => prev === 0 ? artworks.length - 1 : prev - 1);
  };

  const goToArtwork = (index: number) => {
    setCurrentArtworkIndex(index);
  };

  const currentArtwork = artworks[currentArtworkIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 text-center">
            Our Artwork
          </h1>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-2xl overflow-hidden hover-lift animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-96 lg:h-[600px]">
              <img
                src={currentArtwork.image}
                alt={currentArtwork.title}
                className="w-full h-full object-cover"
              />
              
              {/* Carousel Controls */}
              <button
                onClick={prevArtwork}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md transition-colors duration-200"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              
              <button
                onClick={nextArtwork}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md transition-colors duration-200"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {artworks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToArtwork(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      currentArtworkIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
                {currentArtwork.title}
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {currentArtwork.description}
              </p>

              <div className="bg-gray-100 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-500 italic leading-relaxed">
                  All artworks featured here were first created by Clarence as physical artworks, 
                  and then animated digitally to create immersive AR meditation experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Button - Outside Container and Centered */}
      <div className="text-center mt-12 mb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onPageChange('about')}
          className="gradient-emerald hover-lift text-white px-8 py-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
        >
          <Mail size={20} />
          <span>Contact to Buy Artwork</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default GalleryPage;
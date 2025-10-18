import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Footer from './Footer';

const GalleryPage = () => {
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const artworks = [
    {
      id: 1,
      title: "Enchanted Lavender",
      description: "A dreamy forest bathed in soft light, where lavender blooms line the edges of a winding path. The air feels alive with growth and quiet abundance, each flower standing as a symbol of renewal and harmony within nature's embrace.",
      image: "/images/enchanted_lavendar.jpg"
    },
    {
      id: 2,
      title: "Clear Blue",
      description: "A tranquil scene of a beach hut poised above crystalline waters, with endless blue skies melting seamlessly into the sea. It is a vision of pure escape, where serenity and clarity stretch as far as the horizon.",
      image: "/images/clear_blue.png"
    },
    {
      id: 3,
      title: "Godray",
      description: "Light breaks through drifting clouds and descends upon a vast valley, illuminating the land with a celestial glow. The scene evokes a quiet reverence, as if nature itself were touched by something divine.",
      image: "/images/godray_valley.png"
    },
    {
      id: 4,
      title: "Midnight Pond",
      description: "Under the glow of a full moon, a pond shimmers with an otherworldly luminescence. Silhouettes of fish glide beneath the surface, while lotus blossoms float gracefully—an ethereal balance of stillness and life beneath the midnight sky.",
      image: "/images/midnight_pond.png"
    },
    {
      id: 5,
      title: "Serene Seclusion",
      description: "In the heart of a flowering forest rests a solitary bench, nestled beneath a canopy of pink blooms. Petals scatter across the ground like whispers of time, creating a sanctuary of gentle solitude and unspoken beauty.",
      image: "/images/serene_seclusion.png"
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

  const nextCarouselImage = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % 4);
  };

  const prevCarouselImage = () => {
    setCurrentCarouselIndex((prev) => prev === 0 ? 3 : prev - 1);
  };

  const currentArtwork = artworks[currentArtworkIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 text-center">
            SMARA Artworks For Sale
          </h1>
          <p className="text-lg text-gray-600 text-center mt-6 max-w-3xl mx-auto">
            SMARA artworks do more than just promote mental wellbeing. They also function as affordable art pieces to beautify homes, offices, hospitals, and schools.
            <br /><br />
            Enquire on SMARA artworks at <a href="mailto:hello@smara.online" className="text-blue-600 hover:underline">hello@smara.online</a>.
          </p>
        </div>
      </div>

      {/* New Image Carousel */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-0 pb-[75%] bg-gray-100">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentCarouselIndex + 1 === num ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src={`/images/smarainplaces${num}.jpg`}
                    alt={`SMARA in place ${num}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <button
            onClick={prevCarouselImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <button
            onClick={nextCarouselImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200"
            aria-label="Next image"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
          
          {/* Navigation Dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <button 
                key={num}
                onClick={() => setCurrentCarouselIndex(num - 1)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentCarouselIndex + 1 === num ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View image ${num}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description Text */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          SMARA artworks offer calming visual beauty, making every physical space a wonderful living experience with themes that enhance overall ambiance, inspire moods and evoke memories. For offices and work places, these artworks shift focus away from daily stressors, encourage mental clarity and promote productivity.
        </p>
      </div>

      {/* Artwork Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-light text-gray-800 text-center mb-12">Other Artworks</h2>
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
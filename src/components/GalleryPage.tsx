import { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Footer from './Footer';
import OptimizedImage from './OptimizedImage';

const GalleryPage = () => {
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const artworks = [
    {
      id: 1,
      title: "Enchanted Lavender",
      description: "A dreamy forest bathed in soft light, where lavender blooms line the edges of a winding path. The air feels alive with growth and quiet abundance, each flower standing as a symbol of renewal and harmony within nature's embrace.",
      image: "/images/enchanted_lavender.jpg"
    },
    {
      id: 2,
      title: "Clear Blue",
      description: "A tranquil scene of a beach hut poised above crystalline waters, with endless blue skies melting seamlessly into the sea. It is a vision of pure escape, where serenity and clarity stretch as far as the horizon.",
      image: "/images/clear_blue.jpg"
    },
    {
      id: 3,
      title: "Godray",
      description: "Light breaks through drifting clouds and descends upon a vast valley, illuminating the land with a celestial glow. The scene evokes a quiet reverence, as if nature itself were touched by something divine.",
      image: "/images/godray_valley.jpg"
    },
    {
      id: 4,
      title: "Midnight Pond",
      description: "Under the glow of a full moon, a pond shimmers with an otherworldly luminescence. Silhouettes of fish glide beneath the surface, while lotus blossoms float gracefully—an ethereal balance of stillness and life beneath the midnight sky.",
      image: "/images/midnight_pond.jpg"
    },
    {
      id: 5,
      title: "Serene Seclusion",
      description: "In the heart of a flowering forest rests a solitary bench, nestled beneath a canopy of pink blooms. Petals scatter across the ground like whispers of time, creating a sanctuary of gentle solitude and unspoken beauty.",
      image: "/images/serene_seclusion.jpg"
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 pb-8 pt-24 text-center md:pt-32">
        <h1 className="display heading-glow">
          SMARA Artworks For Sale
        </h1>
        <p className="lede mt-8">
          SMARA artworks do more than just promote mental wellbeing. They also function as affordable art pieces to beautify homes, offices, hospitals, and schools.
          <br /><br />
          Enquire on SMARA artworks at <a href="mailto:hello@smara.online" className="text-accent hover:underline">hello@smara.online</a>.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-mist">
            <div className="relative h-0 bg-mist pb-[68%]">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentCarouselIndex + 1 === num ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <OptimizedImage
                    src={`/images/smarainplaces${num}.jpg`}
                    alt={`SMARA in place ${num}`}
                    fill
                    loading={currentCarouselIndex + 1 === num ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <button
            onClick={prevCarouselImage}
            className="icon-btn left-4"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextCarouselImage}
            className="icon-btn right-4"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>

          <div className="mt-5 flex justify-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setCurrentCarouselIndex(num - 1)}
                className={`h-1.5 rounded-full transition-all ${
                  currentCarouselIndex + 1 === num ? 'w-6 bg-ink' : 'w-1.5 bg-line'
                }`}
                aria-label={`View image ${num}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description Text */}
      <div className="mx-auto max-w-2xl px-6 pb-8 pt-12 text-center">
        <p className="lede">
          SMARA artworks offer calming visual beauty, making every physical space a wonderful living experience with themes that enhance overall ambiance, inspire moods and evoke memories. For offices and work places, these artworks shift focus away from daily stressors, encourage mental clarity and promote productivity.
        </p>
      </div>

      {/* Artwork Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-ink">Other Artworks</h2>
        <div className="overflow-hidden rounded-3xl bg-mist">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-[28rem] lg:h-[40rem]">
              <OptimizedImage
                src={currentArtwork.image}
                alt={currentArtwork.title}
                fill
              />
              
              {/* Carousel Controls */}
              <button
                onClick={prevArtwork}
                className="icon-btn left-4"
                aria-label="Previous artwork"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={nextArtwork}
                className="icon-btn right-4"
                aria-label="Next artwork"
              >
                <ChevronRight size={22} />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {artworks.map((artwork, index) => (
                  <button
                    key={artwork.id}
                    onClick={() => goToArtwork(index)}
                    className={`h-1.5 rounded-full ${
                      currentArtworkIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60'
                    }`}
                    aria-label={artwork.title}
                  />
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center p-8 md:p-14">
              <h2 className="text-4xl font-semibold tracking-tight text-ink">
                {currentArtwork.title}
              </h2>

              <p className="lede mt-6">
                {currentArtwork.description}
              </p>

              <p className="mt-8 text-sm italic leading-relaxed text-mute">
                  All artworks featured here were first created by Clarence as physical artworks, 
                  and then animated digitally to create immersive AR meditation experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Button - Outside Container and Centered */}
      <div className="px-6 pb-24 pt-4 text-center">
        <a
          href={`mailto:hello@smara.online?subject=${encodeURIComponent(`Artwork enquiry: ${currentArtwork.title}`)}`}
          className="btn-primary"
        >
          <Mail size={18} />
          Contact to Buy Artwork
        </a>
      </div>

      <Footer />
    </div>
  );
};

export default GalleryPage;
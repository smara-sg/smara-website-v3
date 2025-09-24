import { ArrowRight, ChevronDown, ChevronUp, Instagram, Music } from 'lucide-react';
import { useState } from 'react';
import Footer from './Footer';

interface Artist {
  name: string;
  bio: string;
  cardCount: number;
  instagram?: string;
  tiktok?: string;
}

interface ArtCard {
  title: string;
  description: string;
  image: string;
  artist: string;
}

const ArtCardsPage = () => {
  const [showAll, setShowAll] = useState(false);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const artists: Record<string, Artist> = {
    "Clarence Ho": {
      name: "Clarence Ho",
      bio: "Contemporary artist specializing in serene landscapes that capture the essence of nature's tranquility.",
      cardCount: 12,
      instagram: "clarenceho.art"
    },
    "Alvin Goh": {
      name: "Alvin Goh",
      bio: "Abstract expressionist known for vibrant, flowing patterns that evoke deep emotional responses.",
      cardCount: 8,
      instagram: "alvingoh.art"
    },
    "Sarah Lim": {
      name: "Sarah Lim",
      bio: "Digital artist exploring cosmic themes and the intersection of technology and spirituality.",
      cardCount: 6,
      instagram: "sarahlim.art"
    },
    "Michael Tan": {
      name: "Michael Tan",
      bio: "Marine life artist capturing the ethereal beauty of underwater ecosystems.",
      cardCount: 5,
      instagram: "michaeltan.art"
    },
    "Jessica Wong": {
      name: "Jessica Wong",
      bio: "Landscape painter inspired by mountain ranges and natural formations around the world.",
      cardCount: 7,
      instagram: "jessicaw.art"
    },
    "David Chen": {
      name: "David Chen",
      bio: "Urban sketcher and digital artist finding beauty in cityscapes and street scenes.",
      cardCount: 4,
      tiktok: "@davidchen.art"
    }
  };

  const allCards: ArtCard[] = [
    {
      title: "Serene Landscapes",
      description: "Immerse yourself in breathtaking natural vistas that promote deep relaxation and mindfulness.",
      image: "/images/landscape-card.jpg",
      artist: "Clarence Ho"
    },
    {
      title: "Abstract Mindfulness",
      description: "Let the flowing patterns and colors guide your mind into a state of peaceful awareness.",
      image: "/images/abstract-card.jpg",
      artist: "Alvin Goh"
    },
    {
      title: "Cosmic Harmony",
      description: "Explore the vastness of space and find peace in the celestial dance of stars and galaxies.",
      image: "/images/cosmic-card.png",
      artist: "Sarah Lim"
    },
    {
      title: "Ocean Depths",
      description: "Dive into the tranquil underwater world and experience the calming rhythm of ocean waves.",
      image: "/images/ocean-card.png",
      artist: "Michael Tan"
    },
    {
      title: "Mountain Peaks",
      description: "Find stillness in the majesty of towering mountains and crisp alpine air.",
      image: "/images/mountain-card.png",
      artist: "Jessica Wong"
    },
    {
      title: "Urban Zen",
      description: "Discover moments of peace in the heart of the city's vibrant energy.",
      image: "/images/urban-card.png",
      artist: "David Chen"
    }
  ];

  const featuredCards = showAll ? allCards : allCards.slice(0, 2);

  const handleCardClick = (index: number) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  const renderArtistProfile = (artistName: string) => {
    const artist = artists[artistName];
    if (!artist) return null;

    return (
      <div className="absolute inset-0 bg-white p-6 rounded-2xl shadow-xl backface-hidden rotate-y-180 flex flex-col justify-center items-center text-center">
        <h3 className="text-2xl font-medium text-gray-900 mb-4">{artist.name}</h3>
        <p className="text-gray-600 mb-6">{artist.bio}</p>
        <div className="text-gray-700 mb-6">
          <span className="font-medium">SMARA Cards:</span> {artist.cardCount}
        </div>
        <div className="flex space-x-4">
          {artist.instagram && (
            <a 
              href={`https://instagram.com/${artist.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram size={24} />
            </a>
          )}
          {artist.tiktok && (
            <a 
              href={`https://tiktok.com/${artist.tiktok}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Music size={24} />
            </a>
          )}
        </div>
      </div>
    );
  };

  const creatorBenefits = [
    "Turn Your Art And Design into Interactive Meditation",
    "Reach Global Communities",
    "Multiple Revenue Streams",
    "Creative & Technical Support"
  ];

  const applicationSteps = [
    "Submit artist profile and art portfolio",
    "Complete AR implementation tutorial",
    "Create first card with team's support",
    "Launch and start earning"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
            Transform Art into Interactive Meditation
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover SMARA Art Cards - where beautiful artwork meets mindful technology
          </p>
          
          {/* Art Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 transition-all duration-500 ease-in-out ${showAll ? 'max-h-full' : 'max-h-[800px] overflow-hidden'}`}>
            {featuredCards.map((card, index) => (
              <div 
                key={index} 
                className={`relative h-96 cursor-pointer perspective-1000 ${flippedCard === index ? 'flipped' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 transition-transform duration-500 transform-style-preserve-3d group">
                  <div className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden backface-hidden">
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/70 to-transparent">
                      <div className="bg-black/60 inline-block px-3 py-1 rounded-full text-sm mb-2">
                        {card.artist}
                      </div>
                      <h3 className="text-2xl font-medium mb-1">{card.title}</h3>
                      <p className="text-gray-200 text-sm">Click to view artist profile</p>
                    </div>
                  </div>
                  
                  {/* Back of Card */}
                  {renderArtistProfile(card.artist)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 inline-flex items-center group"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronUp className="ml-1 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                </>
              ) : (
                <>
                  View All Art Cards
                  <ChevronDown className="ml-1 h-5 w-5 group-hover:translate-y-[2px] transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Creator Program Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Join Our Creator Program
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Turn your art into interactive meditation experiences and reach a global audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 mb-6">Key Benefits for Artists:</h3>
              <ul className="space-y-4">
                {creatorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-3 text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-medium text-gray-900 mb-6">Application Process:</h3>
              <ol className="space-y-6">
                {applicationSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-900">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <button className="mt-8 w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtCardsPage;

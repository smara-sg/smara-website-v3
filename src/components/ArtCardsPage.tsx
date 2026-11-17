import { ChevronDown, ChevronUp, Instagram, Music } from 'lucide-react';
import { useState } from 'react';
import Footer from './Footer';
import OptimizedImage from './OptimizedImage';

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
      image: "/images/cosmic-card.jpg",
      artist: "Sarah Lim"
    },
    {
      title: "Ocean Depths",
      description: "Dive into the tranquil underwater world and experience the calming rhythm of ocean waves.",
      image: "/images/ocean-card.jpg",
      artist: "Michael Tan"
    },
    {
      title: "Mountain Peaks",
      description: "Find stillness in the majesty of towering mountains and crisp alpine air.",
      image: "/images/mountain-card.jpg",
      artist: "Jessica Wong"
    },
    {
      title: "Urban Zen",
      description: "Discover moments of peace in the heart of the city's vibrant energy.",
      image: "/images/urban-card.jpg",
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
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-mist p-6 text-center backface-hidden rotate-y-180">
        <h3 className="mb-4 text-2xl font-medium text-ink">{artist.name}</h3>
        <p className="mb-6 text-mute">{artist.bio}</p>
        <div className="mb-6 text-ink">
          <span className="font-medium">SMARA Cards:</span> {artist.cardCount}
        </div>
        <div className="flex space-x-4">
          {artist.instagram && (
            <a 
              href={`https://instagram.com/${artist.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:text-ink"
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
              className="text-ink transition-colors hover:text-accent"
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
      <section className="bg-white px-6 pb-8 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-6xl">
          <h1 className="display mx-auto max-w-4xl">
            Transform Art into Interactive Meditation
          </h1>
          <p className="lede mx-auto mt-8 max-w-2xl">
            Discover SMARA Art Cards - where beautiful artwork meets mindful technology
          </p>
          
          {/* Art Cards Grid */}
          <div className={`mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 ${showAll ? 'lg:max-w-none lg:grid-cols-3' : ''}`}>
            {featuredCards.map((card, index) => (
              <div 
                key={index} 
                className={`relative h-96 cursor-pointer perspective-1000 ${flippedCard === index ? 'flipped' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 transition-transform duration-500 transform-style-preserve-3d group">
                  <div className="absolute inset-0 overflow-hidden rounded-3xl backface-hidden">
                    <OptimizedImage
                      src={card.image}
                      alt={card.title}
                      fill
                      loading={index === 0 ? 'eager' : 'lazy'}
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
              className="group inline-flex items-center font-medium text-accent transition-colors duration-300 hover:text-ink"
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
      <section className="section bg-mist">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Join Our Creator Program
            </h2>
            <p className="lede mx-auto mt-6 max-w-2xl">
              Turn your art into interactive meditation experiences and reach a global audience
            </p>
          </div>

          <div className="mt-16 grid items-start gap-16 md:grid-cols-2">
            <div>
              <h3 className="mb-6 text-2xl font-medium text-ink">Key Benefits for Artists:</h3>
              <ul className="space-y-4">
                {creatorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-6 w-6 flex-shrink-0 text-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-3 text-ink">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-8 md:p-10">
              <h3 className="mb-6 text-2xl font-medium text-ink">Application Process:</h3>
              <ol className="space-y-6">
                {applicationSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-ink">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href={`mailto:hello@smara.online?subject=${encodeURIComponent('SMARA Creator Program application')}`}
                className="btn-primary mt-10 w-full"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtCardsPage;

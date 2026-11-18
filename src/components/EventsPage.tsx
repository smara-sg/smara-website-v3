import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import Footer from './Footer';
import OptimizedImage from './OptimizedImage';

type EventImage = { src: string; width?: number; height?: number }

const EventsPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0
  });

  const events: Array<{
    id: number
    title: string
    description: string
    images: EventImage[]
    date: string
    location: string
  }> = [
    {
      id: 0,
      title: "SMARA @ SAMH",
      description: "A two-day event featuring various mindfulness activities for the neighbourhood elderly. Participants were invited to experience self-gaze meditation sessions, alongside other activities planned by SAMH.",
      images: [
        { src: "/images/samh1.jpg" },
        { src: "/images/samh2-upright.jpg", width: 1500, height: 2000 },
        { src: "/images/samh3-upright.jpg", width: 1500, height: 2000 }
      ],
      date: "June 20–21, 2025",
      location: "SAMH, Mental Wellness for All"
    },
    {
      id: 1,
      title: "SMARA In The Heartlands",
      description: "Spot us at various SMARA calming spaces around Singapore, and discover the SMARA experience by scanning the QR on our stickers. An invitation to join us in this SMARA movement.",
      images: [
        { src: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800", width: 800, height: 1200 },
        { src: "https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=800", width: 800, height: 533 },
        { src: "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800", width: 800, height: 1200 }
      ],
      date: "Q4 2025",
      location: "Various Community Centres, Singapore"
    },
    {
      id: 2,
      title: "Watch this space for future events!",
      description: "Coming Soon",
      images: [
        { src: "/images/cate.gif" }
      ],
      date: "Coming Soon",
      location: "Coming soon"
    },
   
  ];

  const nextImage = (eventId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [eventId]: ((prev[eventId] ?? 0) + 1) % totalImages
    }));
  };

  const prevImage = (eventId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 0) === 0 ? totalImages - 1 : (prev[eventId] ?? 0) - 1
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-24 text-center md:pt-32">
        <h1 className="display">
          SMARA Events
        </h1>
        <p className="lede mt-8">
          Join our community for workshops, retreats, and gatherings focused on self-gaze meditation and mindful living.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="overflow-hidden rounded-3xl bg-mist">
              <div className="grid grid-cols-1 gap-0">
                {/* Image Carousel */}
                <div className="relative h-80 lg:h-96">
                  <OptimizedImage
                    src={event.images[currentImageIndex[event.id] ?? 0].src}
                    alt={`${event.title} - Image ${(currentImageIndex[event.id] ?? 0) + 1}`}
                    width={event.images[currentImageIndex[event.id] ?? 0].width}
                    height={event.images[currentImageIndex[event.id] ?? 0].height}
                    fill
                  />
                  
                  {/* Carousel Controls */}
                  <button
                    onClick={() => prevImage(event.id, event.images.length)}
                    className="icon-btn left-3"
                    aria-label={`Previous image for ${event.title}`}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => nextImage(event.id, event.images.length)}
                    className="icon-btn right-3"
                    aria-label={`Next image for ${event.title}`}
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(prev => ({ ...prev, [event.id]: index }))}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          (currentImageIndex[event.id] ?? 0) === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Event Content */}
                <div className="flex flex-col justify-center p-7">
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">
                    {event.title}
                  </h2>

                  <p className="mt-3 leading-relaxed text-mute">
                    {event.description}
                  </p>

                  <div className="mt-6 space-y-2 text-sm text-mute">
                    <p className="font-medium">Held on</p>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;


import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import Footer from './Footer';

const EventsPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0
  });

  const events = [
    {
      id: 0,
      title: "SMARA @ SAMH",
      description: "A two-day event featuring various mindfulness activities for the neighbourhood elderly. Participants were invited to experience self-gaze meditation sessions, alongside other activities planned by SAMH.",
      images: [
                "/images/samh1.jpg",
        "/images/samh2.jpg",
        "/images/samh3.jpg"
      ],
      date: "June 20–21, 2025",
      location: "SAMH, Mental Wellness for All"
    },
    {
      id: 1,
      title: "SMARA In The Heartlands",
      description: "Spot us at various Community Centres around Singapore, and discover the SMARA experience by scanning the QR on our stickers. An invitation to join us in this SMARA movement.",
      images: [
        "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      date: "Sep 1–30, 2025",
      location: "Various Community Centres, Singapore"
    },
   
  ];

  const nextImage = (eventId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [eventId]: (prev[eventId] + 1) % totalImages
    }));
  };

  const prevImage = (eventId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [eventId]: prev[eventId] === 0 ? totalImages - 1 : prev[eventId] - 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mt-12 mb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 text-center">
            SMARA Events
          </h1>
          <p className="text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto">
            Join our community for workshops, retreats, and gatherings focused on self-gaze meditation and mindful living.
          </p>
        </div>
      </div>

      {/* Events Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="glass-card rounded-2xl overflow-hidden hover-lift transition-shadow duration-300 animate-fade-in">
              <div className="grid grid-cols-1 gap-0">
                {/* Image Carousel */}
                <div className="relative h-80 lg:h-96">
                  <img
                    src={event.images[currentImageIndex[event.id]]}
                    alt={`${event.title} - Image ${currentImageIndex[event.id] + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Carousel Controls */}
                  <button
                    onClick={() => prevImage(event.id, event.images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200"
                  >
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => nextImage(event.id, event.images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200"
                  >
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(prev => ({ ...prev, [event.id]: index }))}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          currentImageIndex[event.id] === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6 flex flex-col justify-center">
                  <h2 className="text-2xl md:text-3xl font-light text-gray-800 mb-4">
                    {event.title}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {event.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-500">
                      <Calendar size={18} className="mr-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin size={18} className="mr-3" />
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
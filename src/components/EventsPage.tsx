import { Calendar, MapPin } from 'lucide-react';
import Footer from './Footer';
import EventPhotoCarousel, { type EventImage } from './EventPhotoCarousel';

const EventsPage = () => {
  const events: Array<{
    id: number
    title: string
    description: string
    images: EventImage[]
    date: string
    location: string
  }> = [
    {
      id: 3,
      title: "SMARA @ Punggol Damai",
      description: "Residents of Punggol Damai came together for a morning of SMARA meditation in front of our hand-painted communal wall mural. The session offered a shared space to pause, reflect, and connect through art and mindfulness.",
      images: [
        {"src": "/images/punggol-damai-session.jpg", "position": "50% 40%", "width": 2048, "height": 1152, "alt": "SMARA session in front of the hand-painted communal mural"},
        {"src": "/images/punggol-damai-meditation.jpg", "position": "55% 40%", "width": 2048, "height": 1152, "alt": "Residents taking part in a guided meditation"},
        {"src": "/images/punggol-damai-gathering.jpg", "width": 1900, "height": 1069, "alt": "A wider view of the group and mural at Punggol Damai"},
        {"src": "/images/punggol-damai-phone-experience.jpg", "position": "50% 25%", "width": 1066, "height": 1895, "alt": "A close-up of the SMARA mural experience on a participant’s phone"}
      ],
      date: "5 July 2026",
      location: "Punggol Damai"
    },
    {
      id: 4,
      title: "SMARA @ Toa Payoh Heights",
      description: "Residents gathered at Toa Payoh Heights RN for a SMARA session exploring art, self-gaze meditation, and mindful awareness. Guided teaching and shared activities created opportunities to pause, participate, and connect. The event was graced by MP Chee Hong Tat.",
      images: [
        { src: "/images/toa-payoh-heights-teaching.jpg", width: 1600, height: 1200, alt: "Guided SMARA teaching with residents at Toa Payoh Heights RN" },
        { src: "/images/toa-payoh-heights-interaction.jpg", width: 1600, height: 1200, alt: "Participants and facilitators interacting during the SMARA session" },
        { src: "/images/toa-payoh-heights-participation.jpg", width: 1600, height: 1200, alt: "Residents taking part in a standing activity beside the SMARA artwork" },
        { src: "/images/toa-payoh-heights-session.jpg", width: 1600, height: 1200, alt: "A wider view of residents and their teacher during the SMARA session" }
      ],
      date: "14 March 2026",
      location: "Toa Payoh Heights RN"
    },
    {
      id: 0,
      title: "SMARA @ SAMH",
      description: "A two-day event featuring various mindfulness activities for the neighbourhood elderly. Participants were invited to experience self-gaze meditation sessions, alongside other activities planned by SAMH.",
      images: [
        { src: "/images/samh1.jpg", position: "50% 40%" },
        { src: "/images/samh2-upright.jpg", width: 1500, height: 2000, position: "50% 40%" },
        { src: "/images/samh3-upright.jpg", width: 1500, height: 2000, position: "50% 40%" }
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
              <div className="flex h-full flex-col">
                <EventPhotoCarousel title={event.title} images={event.images} />

                {/* Event Content */}
                <div className="flex flex-1 flex-col justify-start p-7">
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



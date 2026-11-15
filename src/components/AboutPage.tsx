import { useRef, useState } from 'react';
import { Heart, Mail, Pause, Play } from 'lucide-react';
import Footer from './Footer';
import OptimizedImage from './OptimizedImage';

const MeditationPractice = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setHasError(false);
    if (audio.error) audio.load();
    try {
      await audio.play();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setHasError(true);
      }
    }
  };

  return (
    <div className="absolute inset-y-0 -right-3 left-[calc(50%+2.5rem)] z-10">
      <style>{`
        @keyframes meditation-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgb(37 97 121 / 16%); }
          50% { box-shadow: 0 0 0 6px rgb(37 97 121 / 4%); }
        }
        @keyframes meditation-bubble-in {
          from { opacity: 0; transform: translateX(-4px) scale(.97); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
      <audio
        ref={audioRef}
        src="/lilian-meditation-practice.mp3"
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setHasError(true);
        }}
      />
      <div className="text-left">
        <button
          type="button"
          aria-label={playing ? 'Pause meditation practice' : 'Play meditation practice with Lilian Ong'}
          aria-describedby={playing ? undefined : 'lilian-practice-invitation'}
          onClick={togglePlayback}
          className="absolute bottom-0 left-0 grid h-11 w-11 place-items-center rounded-full bg-accent text-white ring-2 ring-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:animate-[meditation-pulse_4s_ease-in-out_infinite]"
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        {!playing && (
          <p
            id="lilian-practice-invitation"
            className="absolute bottom-12 left-4 right-0 max-w-[9rem] origin-bottom-left rounded-xl bg-mist px-2 py-1.5 text-[11px] leading-snug text-ink motion-safe:animate-[meditation-bubble-in_300ms_ease-out_both]"
          >
            <span aria-hidden="true" className="absolute -bottom-1 left-2 h-2 w-2 rotate-45 bg-mist" />
            {hasError ? (
              <span role="status">Audio couldn’t play. Tap play to try again.</span>
            ) : 'Try a 3-minute soothing audio practice here. Close your eyes for best effect!'}
          </p>
        )}
      </div>
    </div>
  );
};

const AboutPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    enquiry: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.enquiry.trim() || !formData.contact.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', enquiry: '', contact: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    {
      name: "Clarence Ho",
      role: "Founder & Artist",
      description: "An artist specialising in 3D and interactive illusion art, augmented reality art, holograms, projection mapping, caricaturing and cartoons, with over 20 years of experience under his belt.",
      image: "/images/clarencepfp.jpeg"
    },
    {
      name: "Alvin Goh",
      role: "Artist & AR Developer",
      description: "Alvin brings the visual magic to life, creating the beautiful AR filters and animations that transform your meditation experience into an artistic journey.",
      image: "/images/alvinpfp.jpeg"
    },
    {
      name: "Lilian Ong",
      role: "Workshop Facilitator & Mindfulness Teacher",
      description: "Lilian brings more than 20 years’ experience as a professional counsellor, integrating mental health education with mindfulness practice to improve individual, community and workplace wellbeing.",
      image: "/images/lilianpfp.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-24 text-center md:pt-32">
        <h1 className="display">
          About SMARA
        </h1>
      </div>

      <section className="section">
        <div className="mx-auto grid max-w-5xl items-start gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">What is SMARA?</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-mute">
                <p>
                  SMARA is a mindfulness practice that involves a deep and direct gaze at one's own reflection. It offers many benefits including
improving mental well-being and finding a sense of relaxation and calm. The practice also increases self-awareness, relieves stress and allows
feelings of self-acceptance, resulting in self-love. 
                </p>
                <p>
                  SMARA is an engaging community augmented reality (AR) art project that offers the opportunity for the appreciation of art and the
promotion of mental well-being through the form of self-gaze meditation. It also helps bond and strengthen collective family and community
ties.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <Heart size={72} strokeWidth={1} className="text-accent/70" />
            </div>
          </div>
      </section>

      <section className="section bg-mist">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-ink">Who is Behind SMARA?</h2>
          <p className="lede mt-6">
            Meet the passionate team dedicated to bringing mindfulness and technology together for your wellbeing.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="rounded-3xl bg-white px-6 py-10 text-center">
              <div>
                <div className="relative mb-5">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-mist">
                    <OptimizedImage
                      src={member.image}
                      alt={member.name}
                      fill
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {member.name === 'Lilian Ong' && <MeditationPractice />}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-ink">{member.name}</h3>
                  <p className="mt-1 text-sm text-accent">{member.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-mute">{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="section">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-ink">Contact Us</h2>
            <p className="lede mt-6">
              We'd love to hear from you. Fill out the form below and we'll get back to you soon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="rounded-2xl bg-mist px-4 py-3 text-center">
                <p className="text-ink">Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="rounded-2xl bg-mist px-4 py-3 text-center">
                <p className="text-ink">Sorry, there was an error sending your message. Please try again later.</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="field"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="enquiry" className="mb-2 block text-sm font-medium text-ink">
                Enquiry
              </label>
              <textarea
                id="enquiry"
                name="enquiry"
                value={formData.enquiry}
                onChange={handleInputChange}
                required
                rows={5}
                className="field resize-y"
                placeholder="Tell us about your enquiry, questions, or feedback..."
              />
            </div>

            <div>
              <label htmlFor="contact" className="mb-2 block text-sm font-medium text-ink">
                Contact Number/Email
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="field"
                placeholder="Your phone number or email address"
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                <Mail size={18} />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutPage;

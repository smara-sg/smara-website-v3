import React, { useState } from 'react';
import { Heart, Users, Mail, Phone, MapPin } from 'lucide-react';
import Footer from './Footer';

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
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    {
      name: "Clarence Ho",
      role: "Founder & Artist",
      description: "An artist specialising in 3D or interactive illusion art, augmented reality art, holograms, projection mapping, caricaturing and cartoons,art and design for over 20 yearsy.",
      image: "/images/clarencepfp.jpeg"
    },
    {
      name: "Alvin Goh",
      role: "AR Developer & Designer",
      description: "Marcus brings the visual magic to life, creating the beautiful AR filters that transform your meditation experience into an artistic journey.",
      image: "/images/alvinpfp.jpeg"
    },
    {
      name: "Zhi Han",
      role: "Vibe Coder & Marketer",
      description: "A digital marketer and vibe coder who helps bring ideas to life.",
      image: "/images/hanpfp.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 text-center">
            About SMARA
          </h1>
        </div>
      </div>

      {/* What is Smara Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-emerald rounded-2xl p-8 lg:p-12 hover-lift animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-light text-gray-800 mb-6">What is SMARA?</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
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
            <div className="flex justify-center">
              <div className="w-80 h-80 gradient-ocean rounded-2xl flex items-center justify-center animate-float">
                <Heart size={80} className="text-white animate-pulse-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who is Behind Smara Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-800 mb-4">Who is Behind SMARA?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the passionate team dedicated to bringing mindfulness and technology together for your wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden hover-lift transition-shadow duration-300 animate-fade-in">
              <div className="p-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-ocean rounded-2xl p-8 lg:p-12 hover-lift animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">
              We'd love to hear from you. Fill out the form below and we'll get back to you soon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-center animate-fade-in">
                <p className="text-green-800">Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center animate-fade-in">
                <p className="text-red-800">Sorry, there was an error sending your message. Please try again later.</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="enquiry" className="block text-sm font-medium text-gray-700 mb-2">
                Enquiry
              </label>
              <textarea
                id="enquiry"
                name="enquiry"
                value={formData.enquiry}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                placeholder="Tell us about your enquiry, questions, or feedback..."
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number/Email
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Your phone number or email address"
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="gradient-emerald hover-lift text-white px-8 py-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={20} />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
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
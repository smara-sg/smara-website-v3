import React, { useState } from 'react';
import { Mail, Instagram, Music } from 'lucide-react';

const Community = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundImage: 'url(/images/smara3a.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>
      {/* Removed dark overlay div */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Stay tuned to our upcoming releases of new AR filters, and connect with others practicing self-gaze meditation.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Email Signup */}
          <form onSubmit={handleSubmit} className="mb-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 gradient-emerald hover-lift text-white rounded-full font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={20} />
                <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
              </button>
            </div>
          </form>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center animate-fade-in">
              <p className="text-green-200">Thank you for subscribing! We'll keep you updated on new AR filters and events.</p>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center animate-fade-in">
              <p className="text-red-200">Sorry, there was an error subscribing. Please try again later.</p>
            </div>
          )}

          {/* Social Links */}
          <div className="flex justify-center space-x-6 animate-fade-in">
            <a
              href="https://www.tiktok.com/@smara_online"
              className="flex items-center space-x-2 px-6 py-3 glass-card rounded-full hover-lift transition-shadow duration-200 text-white hover:text-pink-600"
            >
              <Music size={20} />
              <span>Follow TikTok</span>
            </a>
            <a
              href="https://www.instagram.com/smaraonline/"
              className="flex items-center space-x-2 px-6 py-3 glass-card rounded-full hover-lift transition-shadow duration-200 text-white hover:text-pink-600"
            >
              <Instagram size={20} />
              <span>Follow Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;

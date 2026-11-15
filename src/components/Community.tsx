import React, { useState } from 'react';

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
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section bg-mist">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="display">Join Our Community</h2>
        <p className="lede mt-8">
          Stay tuned to our upcoming releases of new AR filters, and connect with others practicing self-gaze meditation.
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="community-email">Email address</label>
            <input
              id="community-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="field flex-1 bg-white text-center sm:text-left"
              required
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>

        {submitStatus === 'success' && (
          <p className="mt-6 text-ink">Thank you for subscribing! We'll keep you updated on new AR filters and events.</p>
        )}
        {submitStatus === 'error' && (
          <p className="mt-6 text-ink">Sorry, there was an error subscribing. Please try again later.</p>
        )}

        <div className="mt-10 flex justify-center gap-8 text-sm">
          <a href="https://www.tiktok.com/@smara_online" className="text-accent hover:underline">
            Follow TikTok
          </a>
          <a href="https://www.instagram.com/smaraonline/" className="text-accent hover:underline">
            Follow Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default Community;

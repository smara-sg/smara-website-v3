import { Heart, Focus, Leaf } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const WhatIsSmara = () => {
  const benefits = [
    {
      icon: <Heart className="h-6 w-6 text-accent" strokeWidth={1.5} />,
      title: "Self-Compassion",
      description: "Learn to greet yourself with kindness and be present with oneself."
    },
    {
      icon: <Focus className="h-6 w-6 text-accent" strokeWidth={1.5} />,
      title: "Mindfulness",
      description: "Anchor attention in the here-and-now through focused, visual presence."
    },
    {
      icon: <Leaf className="h-6 w-6 text-accent" strokeWidth={1.5} />,
      title: "Relaxation",
      description: "Let tension melt as breath, music, and art settle in the present."
    }
  ];

  return (
    <section className="section">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="display">What is SMARA?</h2>
        <p className="lede mt-8">
          Self-gaze meditation is a mindfulness practice that involves a deep and direct gaze at one's own reflection. It offers many benefits including
improving mental well-being and finding a sense of relaxation and calm. With SMARA, an AR filter layers generative art and calming soundscapes over your reflection, turning the screen into a gentle sanctuary for self-discovery.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
          <OptimizedImage
            src="/images/smara4.jpg"
            alt="Self-gaze meditation practice"
            fill
          />
        </div>
        <div>
          <h3 className="text-3xl font-semibold tracking-tight text-ink">The Practice</h3>
          <p className="lede mt-6">
            By blending technology with timeless mindfulness, SMARA invites you to sit, breathe, and truly see yourself. Each session is a conversation between your inner world and the moving artwork around you, cultivating calm and clarity in minutes.
          </p>
        </div>
      </div>

      <p className="mx-auto mt-16 max-w-2xl text-center text-2xl font-medium tracking-tight text-ink">
        A transformative experience that combines art, technology, and mindfulness
      </p>

      <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="text-center">
            <div className="mb-5 flex justify-center">{benefit.icon}</div>
            <h3 className="text-lg font-medium text-ink">{benefit.title}</h3>
            <p className="mt-3 leading-relaxed text-mute">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatIsSmara;

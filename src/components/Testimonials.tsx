const Testimonials = () => {
  const testimonials = [
    {
      quote: "SMARA has completely transformed my relationship with myself. The gentle AR visuals help me stay present during meditation, and I've noticed a significant decrease in my anxiety levels.",
      author: "Sarah Chen",
      location: "Singapore"
    },
    {
      quote: "I was skeptical about AR meditation at first, but the experience is incredibly calming. The flowing patterns help quiet my mind in ways traditional meditation never could.",
      author: "Marcus Rodriguez",
      location: "Barcelona"
    },
    {
      quote: "As someone who struggles with self-acceptance, SMARA has been a gentle guide toward self-love. The beautiful visuals make the practice feel like a gift to myself.",
      author: "Priya Patel",
      location: "Mumbai"
    },
    {
      quote: "The combination of self-gaze and augmented reality creates such a unique meditative experience. I feel more centered and aware after each session.",
      author: "David Kim",
      location: "Seoul"
    },
    {
      quote: "SMARA helped me through a difficult period in my life. The practice taught me to be present with my emotions without judgment, leading to profound healing.",
      author: "Emma Thompson",
      location: "London"
    },
    {
      quote: "I love how accessible SMARA makes meditation. The AR filters are beautiful and the guided experience makes it easy for beginners like me to start a practice.",
      author: "Alex Johnson",
      location: "Toronto"
    }
  ];

  return (
    <section className="section">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="display">What People Are Saying</h2>
        <p className="lede mt-8">
          Hear from our community of mindfulness practitioners and art lovers
        </p>
      </div>

      <div className="mt-16 flex snap-x gap-5 overflow-x-auto px-6 pb-2 md:px-[max(1.5rem,calc((100%-72rem)/2))]">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.author} className="w-[min(85vw,22rem)] flex-none snap-start rounded-3xl bg-mist p-8">
            <blockquote className="text-lg leading-relaxed text-ink">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-8">
              <p className="font-medium text-ink">{testimonial.author}</p>
              <p className="text-sm text-mute">{testimonial.location}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-mute">← Scroll to read more testimonials →</p>
    </section>
  );
};

export default Testimonials;

const Experience = () => {
  const steps = [
    {
      number: "1",
      title: "Set Your Space",
      description: "Find a quiet, comfortable place. Sit upright, open the SMARA AR filter on your device."
    },
    {
      number: "2",
      title: "Prepare to Gaze",
      description: "Ensure you can see yourself in the filter and hear the music. Close your eyes and begin deep breaths."
    },
    {
      number: "3",
      title: "Calm Your Breath",
      description: "Breathe in through your nose and exhale slowly through your mouth, making the exhale as long as possible. Continue for 1-2 minutes until you feel calm and your heart rate slows."
    },
    {
      number: "4",
      title: "Gaze and Observe",
      description: "Gently open your eyes and gaze at your reflection in the filter. Observe the art, the animation, the music, and yourself without judgment."
    },
    {
      number: "5",
      title: "Let Thoughts Pass",
      description: "Allow thoughts and emotions to come and go without assigning meaning or getting caught up in them. Simply observe."
    }
  ];

  return (
    <section className="section bg-mist">
      <div className="mx-auto max-w-3xl">
        <h2 className="on-painting text-center text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          How to Practice SMARA
        </h2>
        <ol className="glass mt-12 space-y-10 rounded-3xl px-8 py-10">
          {steps.map((step) => (
            <li key={step.number} className="grid grid-cols-[auto_1fr] gap-6">
              <span className="pt-1 text-sm font-medium text-accent">{step.number}</span>
              <div>
                <h4 className="text-xl font-medium text-ink">{step.title}</h4>
                <p className="mt-2 leading-relaxed text-mute">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Experience;


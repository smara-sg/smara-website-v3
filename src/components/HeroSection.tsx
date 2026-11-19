import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden md:min-h-[calc(100svh-3.5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.38),rgba(255,255,255,0.1)_42%,transparent_70%)]" />

      <div className="rise relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-ink md:text-8xl">
          SMARA
        </h1>
        <h2 className="mx-auto mt-5 max-w-4xl text-balance text-2xl font-medium tracking-tight text-ink md:text-4xl">
          Self-Gaze Meditation Augmented Reality Art
        </h2>
        <h3 className="mx-auto mt-6 max-w-xl text-balance text-lg font-normal leading-relaxed text-[#2c2c2e] md:text-xl">
          Discover inner peace as art, music, and your own reflection guide you inward.
        </h3>
        <Link to="/gallery" className="btn-primary mt-10">
          Artwork
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;


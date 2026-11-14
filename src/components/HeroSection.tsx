import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] items-center">
      <div className="absolute inset-0 bg-smara-1" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.82),rgba(255,255,255,0.28)_46%,rgba(255,255,255,0.05)_72%)]" />

      <div className="rise relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-ink md:text-8xl">
          SMARA
        </h1>
        <h2 className="mx-auto mt-5 max-w-4xl text-balance text-2xl font-medium tracking-tight text-ink md:text-4xl">
          Self-Gaze Meditation Augmented Reality Art
        </h2>
        <h3 className="mx-auto mt-6 max-w-xl text-balance text-lg font-normal leading-relaxed text-mute md:text-xl">
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

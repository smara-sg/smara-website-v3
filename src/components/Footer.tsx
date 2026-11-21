import { Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToTop } from '../utils/scrollToTop';

const Footer = () => {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/events', label: 'Events' },
    { to: '/buy-your-own', label: 'Buy your own!' },
    { to: '/about', label: 'About' },
  ];

  return (
    <footer className="border-t border-line bg-mist">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium tracking-wide text-ink">SMARA</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
              Self-Gaze Meditation Augmented Reality Art. Discover inner peace through mindful technology.
            </p>
            <p className="mt-4 text-sm text-mute">Made with love for mindful living</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-mute">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-ink" onClick={scrollToTop}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink">Connect With Us</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="mailto:hello@smara.online" className="inline-flex items-center gap-2 text-mute hover:text-ink">
                  <Mail size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
                  hello@smara.online
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/smaraonline/" className="inline-flex items-center gap-2 text-mute hover:text-ink">
                  <Instagram size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
                  @smaraonline
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@smara_online" className="inline-flex items-center gap-2 text-mute hover:text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                    <path d="M9 12a4 4 0 1 0 4 4V4h4a4 4 0 0 0 4 4v4a8 8 0 0 1-4-1v5a8 8 0 1 1-8-8z" />
                  </svg>
                  @smara_online
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <h4 className="text-xs font-medium uppercase tracking-wider text-mute">Disclaimer</h4>
          <p className="mt-3 max-w-4xl text-xs leading-relaxed text-mute">
            Self-gaze Meditation AR Art or SMARA is not a substitute for professional medical or psychological
            advice, nor is it intended to cure, treat or diagnose medical conditions. Individual results may vary,
            and users are responsible for their own well-being. By using any of the products of SMARA, you
            agree to the disclaimer. The owners and creators of SMARA are not liable for any damages or injuries
            incurred or caused from use of any of its products.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-xs text-mute md:flex-row md:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} SMARA. All rights reserved.
          </p>
          <p>Mindful technology for inner peace</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


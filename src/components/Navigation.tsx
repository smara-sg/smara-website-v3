import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors duration-200 ${
    isActive ? 'text-ink' : 'text-mute hover:text-ink'
  }`;

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <NavLink
          to="/"
          className="flex items-center text-[15px] font-medium tracking-wide text-ink"
          onClick={closeMenu}
        >
          <OptimizedImage
            src="/images/SMARA_icon.png"
            alt="SMARA Logo"
            className="mr-2 h-7 w-auto"
            loading="eager"
          />
          SMARA
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/gallery" className={linkClass} onClick={closeMenu}>Artwork</NavLink>
          <NavLink to="/events" className={linkClass} onClick={closeMenu}>Events</NavLink>
          <NavLink to="/about" className={linkClass} onClick={closeMenu}>About</NavLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-black/5 bg-white/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/gallery" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Artwork</NavLink>
            <NavLink to="/events" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Events</NavLink>
            <NavLink to="/about" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>About</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

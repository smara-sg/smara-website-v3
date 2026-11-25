import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, ShoppingCart, X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors duration-200 ${
    isActive ? 'text-ink' : 'text-mute hover:text-ink'
  }`;

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:h-14 lg:px-6">
        <NavLink
          to="/"
          className="flex min-h-12 items-center text-lg font-medium tracking-wide text-ink lg:text-[15px]"
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

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          <NavLink to="/gallery" className={linkClass} onClick={closeMenu}>Artwork</NavLink>
          <NavLink to="/events" className={linkClass} onClick={closeMenu}>Events</NavLink>
          <NavLink to="/ar-experience" className={linkClass} onClick={closeMenu}>Augment Reality (AR) Experience</NavLink>
          <NavLink to="/buy-your-own" className={linkClass} onClick={closeMenu}>Buy your own!</NavLink>
          <NavLink to="/about" className={linkClass} onClick={closeMenu}>About</NavLink>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <NavLink
            to="/buy-your-own"
            aria-label="Cart"
            title="Buy your own!"
            onClick={closeMenu}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ShoppingCart size={24} strokeWidth={1.5} aria-hidden="true" />
          </NavLink>
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-black/5 bg-white/95 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/gallery" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Artwork</NavLink>
            <NavLink to="/events" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Events</NavLink>
            <NavLink to="/ar-experience" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Augment Reality (AR) Experience</NavLink>
            <NavLink to="/buy-your-own" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>Buy your own!</NavLink>
            <NavLink to="/about" className="rounded-xl px-3 py-3 text-lg text-ink" onClick={closeMenu}>About</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}


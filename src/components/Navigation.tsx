import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              onClick={closeMenu}
            >
              <img 
                src="/images/SMARA_icon.png" 
                alt="SMARA Logo" 
                className="h-8 w-auto mr-2" 
              />
              SMARA
            </NavLink>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <NavLink
              to="/gallery"
              className={navLinkClass}
              onClick={closeMenu}
            >
              Gallery
            </NavLink>
            <NavLink
              to="/events"
              className={navLinkClass}
              onClick={closeMenu}
            >
              Events
            </NavLink>
            <NavLink
              to="/about"
              className={navLinkClass}
              onClick={closeMenu}
            >
              About
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <NavLink
              to="/gallery"
              className={({ isActive }) => 
                `block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                  isActive 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`
              }
              onClick={closeMenu}
            >
              Gallery
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) => 
                `block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                  isActive 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`
              }
              onClick={closeMenu}
            >
              Events
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => 
                `block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                  isActive 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`
              }
              onClick={closeMenu}
            >
              About
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
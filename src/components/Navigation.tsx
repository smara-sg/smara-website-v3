import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              onClick={closeMenu}
            >
              Smara
            </NavLink>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NavLink
              to="/gallery"
              className={({ isActive }) => 
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
              }
              onClick={closeMenu}
            >
              Gallery
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) => 
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
              }
              onClick={closeMenu}
            >
              Events
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => 
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
              }
              onClick={closeMenu}
            >
              About
            </NavLink>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <NavLink
              to="/gallery"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={closeMenu}
            >
              Gallery
            </NavLink>
            <NavLink
              to="/events"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              onClick={closeMenu}
            >
              Events
            </NavLink>
            <NavLink
              to="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
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
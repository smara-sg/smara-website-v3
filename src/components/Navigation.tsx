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
        </div>
      </div>
    </nav>
  );
}
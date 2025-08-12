import React from 'react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onPageChange('home')}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              Smara
            </button>
          </div>
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onPageChange('gallery')}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === 'gallery'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => onPageChange('events')}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => onPageChange('about')}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
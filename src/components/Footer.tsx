import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Instagram, Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-light">SMARA</h3>
            <p className="text-gray-400 leading-relaxed">
              Self-Gaze Meditation Augmented Reality Art. Discover inner peace through mindful technology.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Heart size={16} className="text-rose-500" />
              <span className="text-sm">Made with love for mindful living</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors duration-200">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Connect With Us</h4>
            <div className="space-y-3">
              <a
                href="mailto:hello@smara.online"
                className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail size={18} />
                <span>hello@smara.online</span>
              </a>
              <a
                href="https://www.instagram.com/smaraonline/"
                className="flex items-center space-x-3 text-gray-400 hover:text-pink-400 transition-colors duration-200"
              >
                <Instagram size={18} />
                <span>@smaraonline</span>
              </a>
              <a
                href="https://www.tiktok.com/@smara_online"
                className="flex items-center space-x-3 text-gray-400 hover:text-pink-400 transition-colors duration-200"
              >
                <Music size={18} />
                <span>@smara_online</span>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Disclaimer</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Self-gaze Meditation AR Art or SMARA is not a substitute for professional medical or psychological 
              advice, nor is it intended to cure, treat or diagnose medical conditions. Individual results may vary, 
              and users are responsible for their own well-being. By using any of the products of SMARA, you 
              agree to the disclaimer. The owners and creators of SMARA is not liable for any damages or injuries 
              incurred or caused from use of any of its products.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 SMARA. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Mindful technology for inner peace
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

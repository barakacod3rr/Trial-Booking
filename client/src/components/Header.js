import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-golf-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-white text-golf-500 p-2 rounded-full">
              🏌️
            </div>
            <div>
              <h1 className="text-xl font-bold">Golf Bay Booking</h1>
              <p className="text-golf-100 text-sm">Premium Golf Experience</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-golf-600 text-white'
                  : 'text-golf-100 hover:text-white hover:bg-golf-600'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/book"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith('/book')
                  ? 'bg-golf-600 text-white'
                  : 'text-golf-100 hover:text-white hover:bg-golf-600'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">Book Now</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      const distanceScrolled = Math.abs(prevScrollPos - currentScrollPos);
      const isScrollingUp = prevScrollPos > currentScrollPos;

      if (distanceScrolled > 2 || currentScrollPos < 10) {
        if (!isOpen) {
          setVisible(isScrollingUp || currentScrollPos < 10);
        }
        setPrevScrollPos(currentScrollPos);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, isOpen]);

  useEffect(() => {
    // Check if user is logged in
    const token = authService.getToken();
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      {/* Fixed Navbar */}
      <nav 
        className={`w-full bg-teal-800 text-white fixed top-0 left-0 z-50 transition-transform duration-200 ease-in-out shadow-xl md:shadow-2xl rounded-b-md ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="relative layout-16by9 flex justify-between items-center px-4 md:px-8 py-4">
          {/* Logo - Left on Desktop, Centered on Mobile */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-lg md:text-xl font-bold">
              <a href="/" className="hover:text-teal-200 transition">CrispyBid</a>
            </div>
            <div className="border-l border-white/20 h-5 md:h-6"></div>
            <a href="/auctions" className="hover:text-teal-200 transition">Auctions</a>
            <a href="/bids" className="hover:text-teal-200 transition">My Bids</a>
          </div>

          {/* Logo - Centered on Mobile */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 text-lg font-bold">
            <a href="/" className="hover:text-teal-200 transition">CrispyBid</a>
          </div>

          {/* Desktop Menu - Right */}
          <div className="hidden md:flex items-center gap-6">
            <div className="border-l border-white/20 h-5 md:h-6"></div>
            {!isLoggedIn && (
              <a href="/login" className="hover:text-teal-200 transition">Login</a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white text-xl md:text-2xl focus:outline-none w-8 ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-teal-900 border-t border-teal-700 px-4 py-3 rounded-b-md animate-in fade-in slide-in-from-top-2 duration-200">
            <a href="/auctions" className="block py-1 hover:text-teal-200 transition">Auctions</a>
            <a href="/bids" className="block py-1 hover:text-teal-200 transition">My Bids</a>
            <div className="border-t border-white/20 my-3"></div>
            {!isLoggedIn && (
              <a href="/login" className="block py-1 hover:text-teal-200 transition">Login</a>
            )}
          </div>
        )}
      </nav>

      {/* Pseudo Navbar */}
      <div className="h-12 md:h-16 w-full" aria-hidden="true"></div>
    </>
  );
}
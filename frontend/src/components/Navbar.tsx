import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const parseTokenEmail = (token: string): string => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );

      const decoded = JSON.parse(payload) as { sub?: string; email?: string };
      return decoded.email || decoded.sub || 'Account';
    } catch {
      return 'Account';
    }
  };

  const refreshAuthState = () => {
    const token = authService.getToken();
    const loggedIn = !!token;

    setIsLoggedIn(loggedIn);
    setUserEmail(token ? parseTokenEmail(token) : '');

    if (!loggedIn) {
      setIsAccountMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      refreshAuthState();
      setIsOpen(false);
      window.location.href = '/login';
    }
  };

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
    refreshAuthState();

    const handleStorageChange = () => {
      refreshAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            {isLoggedIn && (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="max-w-64 truncate hover:text-teal-200 transition"
                  title={userEmail}
                >
                  {userEmail}
                </button>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                    <a
                      href="/user"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      User Page
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
            {isLoggedIn && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="w-full text-left py-1 hover:text-teal-200 transition font-medium truncate"
                >
                  {userEmail}
                </button>
                {isAccountMenuOpen && (
                  <div className="mt-2 pl-3 border-l border-white/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <a
                      href="/user"
                      className="block py-1 hover:text-teal-200 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      User Page
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block py-1 hover:text-teal-200 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Pseudo Navbar */}
      <div className="h-12 md:h-16 w-full" aria-hidden="true"></div>
    </>
  );
}
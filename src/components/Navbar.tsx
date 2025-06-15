
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import MobileMenu from './navigation/MobileMenu';
import { Button } from './ui/button';
import DesktopNav from './navigation/DesktopNav';
import FavoritesButton from './navigation/FavoritesButton';
import UserMenu from './navigation/UserMenu';
import SearchBar from './navigation/SearchBar';
import { useAuth } from '@/hooks/useAuthState';
import NotificationBar from './NotificationBar';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Change background when scrolled or on specific pages
  const shouldBeTransparent = location.pathname === '/' && !isScrolled;
  
  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        shouldBeTransparent 
          ? 'bg-transparent' 
          : 'bg-background/80 backdrop-blur-md border-b border-gray-800'
      }`}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-cinemax-500">Cine</span>Max
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <DesktopNav />
        </div>
        
        {/* Right-side Controls */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Search - Hidden on small screens */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          {/* Notification Bar */}
          <NotificationBar />
          
          {/* Favorites - Hidden on small screens */}
          <div className="hidden sm:block">
            <FavoritesButton />
          </div>
          
          {/* Theme Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          
          {/* User Menu or Auth */}
          <div className="hidden md:block">
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                className="bg-cinemax-500 hover:bg-cinemax-600 text-white text-sm px-4 py-2"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Toggle - Always visible on mobile */}
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import MobileMenu from './navigation/MobileMenu';
import { Button } from './ui/button';
import DesktopNav from './navigation/DesktopNav';
import FavoritesButton from './navigation/FavoritesButton';
import UserMenu from './navigation/UserMenu';
import SearchBar from './navigation/SearchBar';
import MobileSearchButton from './navigation/MobileSearchButton';
import SkipLink from './SkipLink';
import { useAuth } from '@/contexts/AuthContext';
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
    <>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      <header 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          shouldBeTransparent 
            ? 'bg-transparent' 
            : 'bg-background/80 backdrop-blur-md border-b border-gray-800'
        }`}
        role="banner"
      >
        <nav 
          id="navigation"
          className="container mx-auto px-4 py-3 flex items-center justify-between"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            aria-label="CineMax - Go to homepage"
          >
            <span className="text-xl font-bold tracking-tight text-white">
              <span className="text-cinemax-500">Cine</span>Max
            </span>
          </Link>
        {/* Desktop Navigation */}
        <div className="hidden lg:block" role="menubar">
          <DesktopNav />
        </div>
        
        {/* Right-side Controls */}
        <div className="flex items-center gap-1 md:gap-3" role="toolbar" aria-label="User actions">
          {/* Mobile Search Button */}
          <MobileSearchButton />
          
          {/* Desktop Search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          {/* Notification Bar */}
          <NotificationBar />
          
          {/* Favorites - Shows on mobile and desktop */}
          <FavoritesButton />
          
          {/* User Menu or Auth */}
          <div className="hidden md:block">
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                className="bg-cinemax-500 hover:bg-cinemax-600 text-white text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => navigate('/auth')}
                aria-label="Sign in to your account"
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
    </>
  );
};

export default Navbar;

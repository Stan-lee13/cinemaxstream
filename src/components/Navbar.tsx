import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import MobileMenu from './navigation/MobileMenu';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import DesktopNav from './navigation/DesktopNav';
import FavoritesButton from './navigation/FavoritesButton';
import UserMenu from './navigation/UserMenu';
import SearchBar from './navigation/SearchBar';
import { useAuth } from '@/hooks/useAuthState';
import NotificationBar from './NotificationBar';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
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
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
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
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
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
          {/* Search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          {/* Notification Bar */}
          <NotificationBar />
          
          {/* Favorites */}
          <div className="hidden sm:block">
            <FavoritesButton />
          </div>
          
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          
          {/* User Menu or Auth */}
          {user ? (
            <UserMenu />
          ) : (
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600 text-white"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
          
          {/* Mobile Menu Toggle */}
          <div className="block lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="ml-1 text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && <MobileMenu />}
    </header>
  );
};

export default Navbar;

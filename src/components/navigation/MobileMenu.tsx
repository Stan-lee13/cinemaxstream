
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Menu, 
  Film, 
  Tv, 
  Play, 
  Heart, 
  Download,
  LogOut,
  User,
  Settings,
  Home,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden p-2"
          aria-label="Menu"
        >
          <Menu size={24} className="text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-background border-gray-800 w-[280px] p-6">
        <nav className="flex flex-col gap-4 mt-8">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Home size={20} />
            <span className="text-base font-medium">Home</span>
          </Link>
          <Link 
            to="/movies" 
            className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Film size={20} />
            <span className="text-base font-medium">Movies</span>
          </Link>
          <Link 
            to="/series" 
            className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Tv size={20} />
            <span className="text-base font-medium">TV Series</span>
          </Link>
          <Link 
            to="/anime" 
            className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Play size={20} />
            <span className="text-base font-medium">Anime</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <Link 
                to="/favorites" 
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Heart size={20} />
                <span className="text-base font-medium">Favorites</span>
              </Link>
              <Link 
                to="/watch-history" 
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Clock size={20} />
                <span className="text-base font-medium">Watch History</span>
              </Link>
              <Link 
                to="/downloads" 
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Download size={20} />
                <span className="text-base font-medium">Downloads</span>
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Settings size={20} />
                <span className="text-base font-medium">Profile Settings</span>
              </Link>
              <div className="border-t border-gray-700 my-2"></div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors text-left w-full"
              >
                <LogOut size={20} />
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <button 
                onClick={handleSignIn}
                className="flex items-center gap-3 text-white hover:text-cinemax-400 py-3 px-2 rounded-lg hover:bg-white/5 transition-colors text-left w-full"
              >
                <User size={20} />
                <span className="text-base font-medium">Sign In</span>
              </button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

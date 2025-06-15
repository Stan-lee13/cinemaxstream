
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
  Settings
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
          className="md:hidden"
          aria-label="Menu"
        >
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-background border-gray-800 w-[300px]">
        <nav className="flex flex-col gap-6 mt-8">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-cinemax-400">
            <Film size={18} />
            <span>Home</span>
          </Link>
          <Link to="/movies" className="flex items-center gap-2 text-white hover:text-cinemax-400">
            <Film size={18} />
            <span>Movies</span>
          </Link>
          <Link to="/series" className="flex items-center gap-2 text-white hover:text-cinemax-400">
            <Tv size={18} />
            <span>TV Series</span>
          </Link>
          <Link to="/anime" className="flex items-center gap-2 text-white hover:text-cinemax-400">
            <Play size={18} />
            <span>Anime</span>
          </Link>
          {/* <Link to="/sports" className="flex items-center gap-2 text-white hover:text-cinemax-400">
            <Play size={18} />
            <span>Sports</span>
          </Link> */}
          
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                <Heart size={18} />
                <span>Favorites</span>
              </Link>
              <Link to="/downloads" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                <Download size={18} />
                <span>Downloads</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-white hover:text-cinemax-400">
                <Settings size={18} />
                <span>Profile Settings</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-white hover:text-cinemax-400"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleSignIn}
              className="flex items-center gap-2 text-white hover:text-cinemax-400"
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

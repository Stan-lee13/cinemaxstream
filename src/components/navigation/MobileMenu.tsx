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
  Clock,
  ArrowLeft,
  Crown,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/hooks/useUserTier";
import { Badge } from "@/components/ui/badge";

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  const { tier, isPro, isPremium } = useUserTier(user?.id);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  // Display tier label
  const getTierLabel = () => {
    if (isPremium || isPro) return 'Pro';
    return 'Free';
  };

  const getTierBadgeClass = () => {
    if (isPremium || isPro) {
      return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0';
    }
    return 'bg-muted text-muted-foreground border-border';
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
      <SheetContent className="bg-background border-gray-800 w-[280px] p-6 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 text-white"
          >
            <ArrowLeft size={20} />
          </Button>
          <span className="text-white font-medium">Menu</span>
        </div>

        {/* User Status Section */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs px-2 py-0.5 ${getTierBadgeClass()}`}>
                    {isPremium || isPro ? (
                      <>
                        <Crown size={10} className="mr-1" />
                        {getTierLabel()}
                      </>
                    ) : (
                      getTierLabel()
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Upgrade prompt for free users */}
            {!isPro && !isPremium && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                onClick={() => navigate('/upgrade')}
              >
                <Sparkles size={14} className="mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        )}

        <nav className="flex flex-col gap-4">
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
                  to="/history" 
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
                {(isPro || isPremium) && (
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs">Unlocked</Badge>
                )}
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
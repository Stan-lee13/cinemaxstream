
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Heart, Download, Play, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };
  
  if (!isAuthenticated) {
    return (
      <Button 
        className="hidden md:flex bg-cinemax-500 hover:bg-cinemax-600"
        onClick={handleSignIn}
      >
        Sign In
      </Button>
    );
  }
  
  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="bg-cinemax-500 text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border-gray-700">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/favorites')}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Favorites</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/downloads')}>
            <Download className="mr-2 h-4 w-4" />
            <span>Downloads</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/subscription')}>
            <Play className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500 hover:text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;

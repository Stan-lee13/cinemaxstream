
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";
import { useTheme } from "@/hooks/useTheme";

const FavoritesButton: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  if (!isAuthenticated) {
    return null;
  }
  
  const getThemeStyles = () => {
    switch(theme) {
      case "midnight":
        return "text-purple-400 hover:text-purple-300";
      case "neon":
        return "text-green-400 hover:text-green-300 neon-text";
      default:
        return "text-gray-300 hover:text-white";
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`hidden md:flex items-center gap-1 ${getThemeStyles()}`}
      onClick={() => navigate('/favorites')}
    >
      <Heart size={16} />
      <span>Favorites</span>
    </Button>
  );
};

export default FavoritesButton;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/authHooks";
import { useTheme } from "@/hooks/themeContext";

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
      case "sunrise":
        return "text-amber-400 hover:text-amber-300";
      case "forest":
        return "text-emerald-400 hover:text-emerald-300";
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
      data-tour-id="favorites-button"
    >
      <Heart size={16} />
      <span>Favorites</span>
    </Button>
  );
};

export default FavoritesButton;

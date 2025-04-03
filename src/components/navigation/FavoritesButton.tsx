
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";

const FavoritesButton: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="hidden md:flex items-center gap-1 text-gray-300 hover:text-white"
      onClick={() => navigate('/favorites')}
    >
      <Heart size={16} />
      <span>Favorites</span>
    </Button>
  );
};

export default FavoritesButton;

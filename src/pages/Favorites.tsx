
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useAuth } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/LoadingState";

interface FavoriteItem {
  id: string;
  content_id: string;
  title?: string;
  image?: string;
  created_at: string;
}

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching favorites:', error);
          toast.error('Failed to load favorites');
          return;
        }

        // Transform to our interface
        const favoriteItems: FavoriteItem[] = (data || []).map(item => ({
          id: item.id,
          content_id: item.content_id || '',
          title: `Content ${item.content_id}`, // We'll enhance this with actual content data
          image: '/placeholder.svg',
          created_at: item.created_at
        }));

        setFavorites(favoriteItems);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Remove from favorites
  const handleRemoveFavorite = async (favoriteId: string, contentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
        return;
      }

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your favorites..." />;
  }

  return (
    <ResponsiveLayout>
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">Your Favorites</h1>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {favorites.length} items
          </span>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-6">
              Start adding movies and shows to your favorites to see them here
            </p>
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600"
              onClick={() => navigate('/home')}
            >
              Browse Content
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="group relative">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden mb-2">
                  <div 
                    className="h-full w-full bg-cover bg-center flex items-center justify-center"
                    style={{ 
                      backgroundImage: favorite.image && favorite.image !== '/placeholder.svg' 
                        ? `url(${favorite.image})` 
                        : undefined 
                    }}
                  >
                    {(!favorite.image || favorite.image === '/placeholder.svg') && (
                      <span className="text-gray-400 text-sm text-center p-2">
                        {favorite.title}
                      </span>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      className="bg-cinemax-500 hover:bg-cinemax-600"
                      onClick={() => navigate(`/content/${favorite.content_id}`)}
                    >
                      <Play size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.content_id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium line-clamp-2 text-center">
                  {favorite.title}
                </h3>
                <p className="text-xs text-gray-400 text-center">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </ResponsiveLayout>
  );
};

export default Favorites;

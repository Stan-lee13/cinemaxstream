
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
  import useAuth from "@/contexts/authHooks";
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

// Raw shape that might be stored in localStorage (loose schema)
interface LocalFavoriteRaw {
  id?: string;
  title?: string;
  name?: string;
  image_url?: string;
  image?: string;
  poster_path?: string;
  added_at?: string;
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

  // Fetch favorites from database with full content details from TMDB
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const { data: favoritesData, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch full content details from TMDB for each favorite
        const favoritesWithDetails = await Promise.all(
          (favoritesData || []).map(async (fav) => {
            try {
              // Import tmdbApi dynamically
              const { tmdbApi } = await import('@/services/tmdbApiProduction');
              const contentDetails = await tmdbApi.getContentDetails(fav.content_id || '');
              
              return {
                id: fav.id,
                content_id: fav.content_id || '',
                title: contentDetails?.title || `Content ${fav.content_id}`,
                image: contentDetails?.image || contentDetails?.poster || undefined,
                created_at: fav.created_at
              };
            } catch (err) {
              // If TMDB fetch fails, return basic info
              return {
                id: fav.id,
                content_id: fav.content_id || '',
                title: `Content ${fav.content_id}`,
                image: undefined,
                created_at: fav.created_at
              };
            }
          })
        );

        setFavorites(favoritesWithDetails);
      } catch (error) {
        toast.error('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Remove from favorites (now using database)
  const handleRemoveFavorite = async (favoriteId: string, contentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update state
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
                  <div className="h-full w-full flex items-center justify-center">
                    {favorite.image && favorite.image !== 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80' ? (
                      <img
                        src={favorite.image}
                        alt={favorite.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-800">
                        <span className="text-gray-400 text-sm text-center p-2">
                          {favorite.title}
                        </span>
                      </div>
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

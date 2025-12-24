
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useAuth from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2, Film, Tv, Star, ChevronRight, Bookmark } from "lucide-react";
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

  // Remove from favorites
  const handleRemoveFavorite = async (favoriteId: string, contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from library');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Opening your private collection..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[5%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[35%] h-[35%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-900/20">
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                </div>
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Curated Library</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Favorites
              </h1>
              <p className="text-gray-400 text-lg">Your handpicked selection of premium entertainment.</p>
            </div>

            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-3 group hover:bg-white/10 transition-colors">
              <Bookmark className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-bold text-gray-300">
                {favorites.length} {favorites.length === 1 ? 'Masterpiece' : 'Masterpieces'}
              </span>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-32 bg-[#111] rounded-[32px] border border-white/5 backdrop-blur-sm">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-10 flex items-center justify-center border border-white/10 shadow-3xl group transition-all hover:scale-110">
                <Heart className="w-12 h-12 text-gray-600 group-hover:text-red-500 group-hover:fill-current transition-all duration-700" />
              </div>
              <h2 className="text-3xl font-black mb-4">Your collection is waiting</h2>
              <p className="text-gray-400 mb-12 max-w-sm mx-auto text-lg leading-relaxed">
                Start your journey by marking movies and series as favorites. They'll appear right here.
              </p>
              <Button
                className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-red-500 hover:text-white font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95"
                onClick={() => navigate('/home')}
              >
                Start Exploring
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {favorites.map((favorite) => (
                <div
                  id={`fav-${favorite.id}`}
                  key={favorite.id}
                  className="favorite-card group relative flex flex-col"
                  onClick={() => navigate(`/content/${favorite.content_id}`)}
                >
                  <div className="aspect-[2/3] rounded-[24px] overflow-hidden bg-[#111] border border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-red-500/20 group-hover:scale-[1.03] group-hover:border-white/10 relative">
                    {favorite.image ? (
                      <>
                        <img
                          src={favorite.image}
                          alt={favorite.title}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                        <Film className="w-12 h-12 text-gray-800 mb-4" />
                        <span className="text-gray-500 text-xs font-black uppercase tracking-widest leading-loose">
                          {favorite.title}
                        </span>
                      </div>
                    )}

                    {/* Hover Controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[4px]">
                      <Button
                        className="w-14 h-14 rounded-full bg-white text-black hover:bg-red-500 hover:text-white shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300 ease-out"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/content/${favorite.content_id}`);
                        }}
                      >
                        <Play size={24} className="fill-current ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-10 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 opacity-0 group-hover:opacity-100 transition-all delay-100"
                        onClick={(e) => handleRemoveFavorite(favorite.id, favorite.content_id, e)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remove
                      </Button>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100">
                      <Star size={16} className="text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <div className="mt-5 px-1 flex flex-col gap-1">
                    <h3 className="text-sm md:text-base font-black text-gray-100 line-clamp-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">
                      {favorite.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        Saved {new Date(favorite.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useAuth from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2, Film, Tv, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/LoadingState";
import gsap from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Animation effect
  useEffect(() => {
    if (!isLoading && favorites.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".favorite-card", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, favorites.length]);

  // Remove from favorites (now using database)
  const handleRemoveFavorite = async (favoriteId: string, contentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Animate removal
      const card = document.getElementById(`fav-${favoriteId}`);
      if (card) {
        gsap.to(card, {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
          }
        });
      } else {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      }
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Loading your favorites..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-pink-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Your Favorites
              </h1>
            </div>
            <p className="text-gray-400 ml-1">Curated collection of your top picks</p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm text-sm text-gray-300">
            {favorites.length} {favorites.length === 1 ? 'Title' : 'Titles'} Saved
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-6 flex items-center justify-center border border-white/10 shadow-2xl group">
              <Heart className="w-10 h-10 text-gray-600 group-hover:text-red-500 group-hover:fill-current transition-all duration-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Your list is empty</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Start building your personal collection by adding movies and shows you love.
            </p>
            <Button
              className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold"
              onClick={() => navigate('/home')}
            >
              Discover Content
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {favorites.map((favorite) => (
              <div
                id={`fav-${favorite.id}`}
                key={favorite.id}
                className="favorite-card group relative cursor-pointer"
                onClick={() => navigate(`/content/${favorite.content_id}`)}
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl transition-all duration-300 group-hover:shadow-red-900/20 group-hover:scale-[1.02] group-hover:border-white/20">
                  <div className="h-full w-full relative">
                    {favorite.image && favorite.image !== 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80' ? (
                      <>
                        <img
                          src={favorite.image}
                          alt={favorite.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800 p-4 text-center">
                        <Film className="w-8 h-8 text-gray-600 mb-2" />
                        <span className="text-gray-400 text-sm font-medium">
                          {favorite.title}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <Button
                        size="icon"
                        className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 delay-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/content/${favorite.content_id}`);
                        }}
                      >
                        <Play size={18} className="fill-current ml-0.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-10 h-10 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 delay-100"
                        onClick={(e) => handleRemoveFavorite(favorite.id, favorite.content_id, e)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star size={12} className="text-yellow-500 fill-current" />
                    </div>
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors pl-1">
                  {favorite.title}
                </h3>
                <p className="text-xs text-gray-500 pl-1">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;

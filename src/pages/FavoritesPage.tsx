import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { tmdbApi, ContentItem } from '@/services/tmdbApi'; // Assuming ContentItem is exported
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Film, Tv } from 'lucide-react';
import { toast } from 'sonner';

const FavoritesPage: React.FC = () => {
  const { favoriteIds, removeFavorite } = useFavorites();
  const [favoriteItems, setFavoriteItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFavoriteItems = async () => {
      if (favoriteIds.length === 0) {
        setFavoriteItems([]);
        return;
      }

      setIsLoading(true);
      const items: ContentItem[] = [];
      for (const id of favoriteIds) {
        try {
          // Attempt to fetch as movie first, then as series if null (or vice-versa)
          // This assumes IDs might not have type info stored with them.
          let itemDetails = await tmdbApi.getContentDetails(id, 'movie');
          if (!itemDetails) {
            itemDetails = await tmdbApi.getContentDetails(id, 'series');
          }
          if (!itemDetails) {
            itemDetails = await tmdbApi.getContentDetails(id, 'anime');
          }

          if (itemDetails) {
            items.push(itemDetails);
          } else {
            console.warn(`Could not fetch details for favorite ID: ${id}`);
            // Optionally, remove IDs that don't resolve to content after a few tries
            // removeFavorite(id); // Be cautious with this auto-removal
          }
        } catch (error) {
          console.error(`Error fetching details for favorite ID ${id}:`, error);
        }
      }
      setFavoriteItems(items);
      setIsLoading(false);
    };

    fetchFavoriteItems();
  }, [favoriteIds]); // Re-fetch when favoriteIds change

  const handleRemoveFavorite = (itemId: string, itemTitle: string) => {
    removeFavorite(itemId);
    toast.success(`${itemTitle} removed from favorites.`);
  };

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(favoriteIds.length || 4).fill(0).map((_, i) => ( // Show skeletons based on fav count or default
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800 mt-2" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Favorites</h1>

        {isLoading ? (
          renderSkeletonGrid()
        ) : favoriteItems.length === 0 ? (
          <div className="text-center py-12">
            <img src="/icons/empty-heart.svg" alt="No favorites" className="w-32 h-32 mx-auto mb-6 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-gray-400 mb-6">
              Add movies and shows to your favorites to see them here.
            </p>
            <Button onClick={() => navigate('/')}>Browse Content</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteItems.map(item => (
              <div key={item.id} className="bg-card rounded-lg overflow-hidden shadow-lg relative group">
                <Link to={`/content/${item.id}`} className="block">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/content/${item.id}`} className="block">
                    <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-cinemax-500 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    {item.type === 'movie' ? <Film className="w-4 h-4 mr-1 flex-shrink-0" /> : <Tv className="w-4 h-4 mr-1 flex-shrink-0" />}
                    <span className="capitalize">{item.type || item.category}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 group"
                    onClick={() => handleRemoveFavorite(item.id, item.title)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 group-hover:text-red-400" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FavoritesPage;

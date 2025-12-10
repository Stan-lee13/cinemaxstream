import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useAuth from '@/contexts/authHooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WatchListItem {
  id: string;
  content_id: string;
  user_id: string;
  created_at: string;
  title: string;
  image_url: string;
  content_type: string;
}

const WatchList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchList();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWatchList = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const enrichedData: WatchListItem[] = [];
        
        for (const item of data) {
          if (!item.content_id) continue;
          
          try {
            const API_KEY = "4626200399b08f9d04b72348e3625f15";
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${item.content_id}?api_key=${API_KEY}`
            );
            
            let title = 'Unknown Title';
            let image_url = '';
            
            if (response.ok) {
              const tmdbData = await response.json();
              title = tmdbData?.title || tmdbData?.name || 'Unknown Title';
              image_url = tmdbData?.backdrop_path || tmdbData?.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path || tmdbData.poster_path}`
                : '';
            }
            
            enrichedData.push({
              id: item.id,
              content_id: item.content_id,
              user_id: item.user_id,
              created_at: item.created_at,
              title,
              image_url,
              content_type: 'movie'
            });
          } catch {
            enrichedData.push({
              id: item.id,
              content_id: item.content_id,
              user_id: item.user_id,
              created_at: item.created_at,
              title: 'Unknown Title',
              image_url: '',
              content_type: 'movie'
            });
          }
        }
        
        setWatchList(enrichedData);
      } else {
        setWatchList([]);
      }
    } catch (error) {
      toast.error('Failed to load watch list');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWatchList(watchList.filter(item => item.id !== id));
      toast.success('Removed from watch list');
    } catch (error) {
      toast.error('Failed to remove from watch list');
    }
  };

  const handleContentClick = (contentId: string, contentType: string) => {
    navigate(`/content/${contentId}`, { state: { contentType } });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Watch List</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your watch list</p>
          <Button onClick={() => navigate('/onboarding/auth')}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-8 h-8" />
            My Watch List
          </h1>
          <p className="text-muted-foreground">
            {watchList.length} {watchList.length === 1 ? 'item' : 'items'} in your watch list
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : watchList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-white mb-2">Your watch list is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add movies and shows to your watch list to keep track of what you want to watch
              </p>
              <Button onClick={() => navigate('/')}>Browse Content</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchList.map((item) => (
              <div key={item.id} className="group relative">
                <div
                  className="aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleContentClick(item.content_id, item.content_type)}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Clock className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchList(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WatchList;

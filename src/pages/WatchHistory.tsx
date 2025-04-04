
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 
import LoadingState from "@/components/LoadingState";

type WatchHistoryItem = {
  id: string;
  contentId: string;
  title?: string;
  image?: string;
  episodeId?: string;
  lastWatched: string;
  watchPosition?: number;
  seasonNumber?: number;
  episodeNumber?: number;
};

const WatchHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch watch history
  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // First try to fetch from Supabase
        const { data: dbHistory, error } = await supabase
          .from('user_watch_history')
          .select('*, content:content_id(*)')
          .eq('user_id', user.id)
          .order('last_watched', { ascending: false })
          .limit(50);

        if (dbHistory && dbHistory.length > 0) {
          const formattedHistory = dbHistory.map((item: any) => ({
            id: item.id,
            contentId: item.content_id,
            title: item.content?.title || 'Unknown title',
            image: item.content?.image_url || item.content?.image_url || '/placeholder.jpg',
            episodeId: item.episode_id,
            lastWatched: item.last_watched,
            watchPosition: item.watch_position,
            seasonNumber: item.episode_id ? parseInt(item.episode_id.split('-')[1]) : undefined,
            episodeNumber: item.episode_id ? parseInt(item.episode_id.split('-')[2]) : undefined
          }));
          
          setHistory(formattedHistory);
        } else {
          // Fallback to localStorage if no DB history or error
          const localHistory = JSON.parse(localStorage.getItem('watch_history') || '[]');
          
          // If we have local history, format it
          if (localHistory.length > 0) {
            // Map local history to a consistent format
            const formattedLocalHistory = await Promise.all(localHistory.map(async (item: any) => {
              // Try to get content details
              try {
                const { data: content } = await supabase
                  .from('content')
                  .select('*')
                  .eq('id', item.contentId)
                  .single();
                  
                return {
                  id: crypto.randomUUID(),
                  contentId: item.contentId,
                  title: content?.title || 'Unknown title',
                  image: content?.image_url || '/placeholder.jpg',
                  episodeId: item.episodeId,
                  lastWatched: item.lastWatched,
                  watchPosition: item.currentTime,
                  seasonNumber: item.episodeId ? parseInt(item.episodeId.split('-')[1]) : undefined,
                  episodeNumber: item.episodeId ? parseInt(item.episodeId.split('-')[2]) : undefined
                };
              } catch (err) {
                return {
                  id: crypto.randomUUID(),
                  contentId: item.contentId,
                  lastWatched: item.lastWatched,
                  watchPosition: item.currentTime,
                  episodeId: item.episodeId
                };
              }
            }));
            
            setHistory(formattedLocalHistory);
          }
        }
      } catch (error) {
        console.error('Error fetching watch history:', error);
        toast.error('Failed to load watch history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Handle continue watching
  const handleContinueWatching = (item: WatchHistoryItem) => {
    navigate(`/content/${item.contentId}`, { 
      state: { 
        autoPlay: true,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        startPosition: item.watchPosition
      }
    });
  };

  // Handle remove from history
  const handleRemoveFromHistory = async (item: WatchHistoryItem) => {
    try {
      // Remove from Supabase if available
      if (user) {
        await supabase
          .from('user_watch_history')
          .delete()
          .eq('id', item.id);
      }
      
      // Also remove from local storage
      try {
        const localHistory = JSON.parse(localStorage.getItem('watch_history') || '[]');
        const updatedHistory = localHistory.filter((historyItem: any) => 
          historyItem.contentId !== item.contentId || historyItem.episodeId !== item.episodeId
        );
        localStorage.setItem('watch_history', JSON.stringify(updatedHistory));
      } catch (e) {
        // Ignore localStorage errors
      }
      
      // Update state
      setHistory(prev => prev.filter(historyItem => historyItem.id !== item.id));
      
      toast.success('Removed from watch history');
    } catch (error) {
      console.error('Error removing from history:', error);
      toast.error('Failed to remove from history');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 172800) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading watch history..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-8">Watch History</h1>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
            <p className="text-gray-400 mb-6">Start watching content to build your history</p>
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600"
              onClick={() => navigate('/')}
            >
              Browse Content
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-card rounded-lg overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 flex-shrink-0">
                  <div 
                    className="h-full w-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${item.image || '/placeholder.jpg'})`,
                      backgroundSize: 'cover'
                    }}
                  />
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg truncate">{item.title || 'Unknown title'}</h3>
                      <span className="text-xs text-gray-400">{formatDate(item.lastWatched)}</span>
                    </div>
                    
                    {item.seasonNumber && item.episodeNumber && (
                      <p className="text-gray-400 text-sm">
                        Season {item.seasonNumber} • Episode {item.episodeNumber}
                      </p>
                    )}
                    
                    {item.watchPosition && (
                      <div className="mt-2">
                        <div className="bg-gray-700 h-1 rounded-full w-full overflow-hidden">
                          <div 
                            className="bg-cinemax-500 h-full"
                            style={{ width: `${Math.min((item.watchPosition / 600) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleContinueWatching(item)}
                    >
                      <Play size={16} />
                      <span>Continue</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromHistory(item)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {history.length > 5 && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="border-gray-700"
                  onClick={() => {
                    try {
                      localStorage.removeItem('watch_history');
                      setHistory([]);
                      toast.success('Watch history cleared');
                    } catch (e) {
                      toast.error('Failed to clear history');
                    }
                  }}
                >
                  Clear All History
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default WatchHistory;

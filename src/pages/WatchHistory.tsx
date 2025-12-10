import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreditUsageBar from "@/components/CreditUsageBar";
import { useAuth } from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 
import LoadingState from "@/components/LoadingState";
import { getErrorMessage } from "@/utils/errorHelpers";

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

type DBHistoryRow = {
  id: string;
  content_id: string;
  episode_id?: string | null;
  last_watched: string;
  watch_position?: number | null;
  content?: {
    title?: string | null;
    image_url?: string | null;
  } | null;
};

type LocalHistoryRaw = {
  contentId: string;
  episodeId?: string | null;
  lastWatched: string;
  currentTime?: number;
};

const isLocalHistoryItem = (v: unknown): v is LocalHistoryRaw => {
  return typeof v === 'object' && v !== null && 'contentId' in v && 'lastWatched' in v &&
    typeof (v as Record<string, unknown>).contentId === 'string' && typeof (v as Record<string, unknown>).lastWatched === 'string';
};

const isLocalHistoryArray = (v: unknown): v is LocalHistoryRaw[] => {
  if (!Array.isArray(v)) return false;
  return v.every(isLocalHistoryItem);
};

const WatchHistory: React.FC = () => {
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
        const { data: dbHistory } = await supabase
          .from('user_watch_history')
          .select('*, content:content_id(*)')
          .eq('user_id', user.id)
          .order('last_watched', { ascending: false })
          .limit(50);

        if (Array.isArray(dbHistory) && dbHistory.length > 0) {
          const formattedHistory: WatchHistoryItem[] = (dbHistory as DBHistoryRow[]).map((item) => ({
            id: item.id,
            contentId: item.content_id,
            title: item.content?.title || 'Unknown title',
            image: item.content?.image_url || 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center',
            episodeId: item.episode_id ?? undefined,
            lastWatched: item.last_watched,
            watchPosition: item.watch_position ?? undefined,
            seasonNumber: item.episode_id ? parseInt(item.episode_id.split('-')[1]) : undefined,
            episodeNumber: item.episode_id ? parseInt(item.episode_id.split('-')[2]) : undefined
          }));

          setHistory(formattedHistory);
        } else {
          let localHistoryRaw: unknown = [];
          try {
            localHistoryRaw = JSON.parse(localStorage.getItem('watch_history') || '[]');
          } catch (err) {
            // ignore parse errors
            localHistoryRaw = [];
          }

          if (isLocalHistoryArray(localHistoryRaw) && localHistoryRaw.length > 0) {
            const formattedLocalHistory = await Promise.all(localHistoryRaw.map(async (item) => {
              try {
                const { data: content } = await supabase
                  .from('content')
                  .select('*')
                  .eq('id', item.contentId)
                  .single();

                const contentRow = content as Record<string, unknown> | null;
                const title = typeof contentRow?.title === 'string' ? contentRow.title : 'Unknown title';
                const image = typeof contentRow?.image_url === 'string' ? contentRow.image_url : 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center';

                return {
                  id: crypto.randomUUID(),
                  contentId: item.contentId,
                  title: title,
                  image: image,
                  episodeId: item.episodeId ?? undefined,
                  lastWatched: item.lastWatched,
                  watchPosition: item.currentTime,
                  seasonNumber: item.episodeId ? parseInt(item.episodeId.split('-')[1]) : undefined,
                  episodeNumber: item.episodeId ? parseInt(item.episodeId.split('-')[2]) : undefined
                } as WatchHistoryItem;
              } catch (err) {
                return {
                  id: crypto.randomUUID(),
                  contentId: item.contentId,
                  lastWatched: item.lastWatched,
                  watchPosition: item.currentTime,
                  episodeId: item.episodeId
                } as WatchHistoryItem;
              }
            }));

            setHistory(formattedLocalHistory);
          }
        }
      } catch (error) {
        console.error('Error fetching watch history:', getErrorMessage(error));
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
      if (user) {
        await supabase
          .from('user_watch_history')
          .delete()
          .eq('id', item.id);
      }
      
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem('watch_history') || '[]');
        if (isLocalHistoryArray(parsed)) {
          const updatedHistory = parsed.filter((historyItem) =>
            historyItem.contentId !== item.contentId || historyItem.episodeId !== item.episodeId
          );
          localStorage.setItem('watch_history', JSON.stringify(updatedHistory));
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      
      setHistory(prev => prev.filter(historyItem => historyItem.id !== item.id));
      
      toast.success('Removed from watch history');
    } catch (error) {
      console.error('Error removing from history:', getErrorMessage(error));
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
        
        {/* Credit Usage Bar */}
        {user && <CreditUsageBar />}
        
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
                  <div className="h-full w-full">
                    <img src={item.image || 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center'} alt={item.title || ''} className="h-full w-full object-cover" />
                  </div>
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
                          <progress
                            value={Math.min((item.watchPosition / 600) * 100, 100)}
                            max={100}
                            className="w-full h-1 rounded-full bg-cinemax-500"
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

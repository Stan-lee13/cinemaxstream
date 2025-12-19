import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreditUsageBar from "@/components/CreditUsageBar";
import { useAuth } from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/LoadingState";
import { getErrorMessage } from "@/utils/errorHelpers";
import gsap from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null);

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
          // Fallback to local storage (existing logic retained)
          let localHistoryRaw: unknown = [];
          try {
            localHistoryRaw = JSON.parse(localStorage.getItem('watch_history') || '[]');
          } catch (err) {
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

  // Animation effect
  useEffect(() => {
    if (!isLoading && history.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".history-item", {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, history.length]);

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
      // Animate removal first
      const el = document.getElementById(`history-${item.id}`);
      if (el) {
        await gsap.to(el, {
          height: 0,
          opacity: 0,
          marginBottom: 0,
          padding: 0,
          duration: 0.3
        });
      }

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
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Loading watch history..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <History className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Watch History
            </h1>
          </div>

          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-gray-400"
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
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Credit Usage Bar */}
        {user && <CreditUsageBar />}

        {history.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm mt-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-6 flex items-center justify-center border border-white/10 shadow-2xl">
              <Clock className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">No watch history yet</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start watching content to build your history</p>
            <Button
              className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold"
              onClick={() => navigate('/')}
            >
              Start Watching
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {history.map((item) => (
              <div
                id={`history-${item.id}`}
                key={item.id}
                className="history-item bg-[#111] hover:bg-[#161616] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 group"
              >
                <div className="w-full md:w-64 h-36 md:h-auto flex-shrink-0 relative overflow-hidden">
                  <div className="h-full w-full">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center'}
                      alt={item.title || ''}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100 duration-300">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {item.watchPosition && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div
                        className="h-full bg-gradient-to-r from-cinemax-500 to-purple-500"
                        style={{ width: `${Math.min((item.watchPosition / 600) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{item.title || 'Unknown title'}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {item.seasonNumber && item.episodeNumber ? (
                          <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">S{item.seasonNumber} E{item.episodeNumber}</span>
                        ) : (
                          <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">Movie</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(item.lastWatched)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <Button
                      className="gap-2 bg-white text-black hover:bg-gray-200 font-bold rounded-xl"
                      onClick={() => handleContinueWatching(item)}
                    >
                      <Play size={16} className="fill-current" />
                      <span>Continue Watching</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromHistory(item)}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WatchHistory;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreditUsageBar from "@/components/CreditUsageBar";
import { useAuth } from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock, History, RotateCcw, ChevronRight } from "lucide-react";
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
          // Fallback to local storage
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
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
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
          scale: 0.95,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
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
      toast.success('Removed from history');
    } catch (error) {
      console.error('Error removing from history:', getErrorMessage(error));
      toast.error('Failed to remove item');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const m = Math.floor(diffInSeconds / 60);
      return `${m}m ago`;
    }
    if (diffInSeconds < 86400) {
      const h = Math.floor(diffInSeconds / 3600);
      return `${h}h ago`;
    }
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Restoring your journey..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <History className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Watch History
                </h1>
                <p className="text-gray-400 mt-1">Pick up where you left off</p>
              </div>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all h-11"
                onClick={() => {
                  try {
                    localStorage.removeItem('watch_history');
                    setHistory([]);
                    toast.success('History cleared');
                  } catch (e) {
                    toast.error('Failed to clear history');
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All History
              </Button>
            )}
          </div>

          {user && (
            <div className="mb-10 transition-transform hover:scale-[1.01] duration-500">
              <CreditUsageBar />
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-32 bg-[#111] rounded-[32px] border border-white/5 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-8 flex items-center justify-center border border-white/10 shadow-2xl group transition-transform hover:rotate-12">
                <Clock className="w-10 h-10 text-gray-500 group-hover:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Your history is clear</h2>
              <p className="text-gray-400 mb-10 max-w-sm mx-auto">Every great adventure begins with the first click. Start watching now.</p>
              <Button
                className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-gray-200 font-bold text-lg shadow-xl transition-all hover:scale-105"
                onClick={() => navigate('/')}
              >
                <Play className="w-5 h-5 mr-3 fill-black" />
                Browse Catalog
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((item) => (
                <div
                  id={`history-${item.id}`}
                  key={item.id}
                  className="history-item group bg-[#111] hover:bg-[#161616] border border-white/5 rounded-[24px] overflow-hidden flex flex-col md:flex-row transition-all duration-300 relative"
                >
                  <div className="w-full md:w-80 lg:w-96 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center'}
                      alt={item.title || ''}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </div>

                    {item.watchPosition && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${Math.min((item.watchPosition / 3600) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl md:text-2xl text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {item.title || 'Untitled Masterpiece'}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromHistory(item);
                          }}
                          className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors h-10 w-10 flex-shrink-0"
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        {item.seasonNumber && item.episodeNumber ? (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            S{item.seasonNumber} • E{item.episodeNumber}
                          </span>
                        ) : (
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Feature Film
                          </span>
                        )}
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(item.lastWatched)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <Button
                        className="h-12 px-8 bg-white text-black hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 group/btn overflow-hidden relative"
                        onClick={() => handleContinueWatching(item)}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 group-hover/btn:rotate-[-45deg] transition-transform" />
                          Resume Watching
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/content/${item.contentId}`)}
                        className="text-gray-400 hover:text-white px-0 hover:bg-transparent group/more"
                      >
                        Details <ChevronRight className="w-4 h-4 ml-1 group-hover/more:translate-x-1 transition-transform" />
                      </Button>
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

export default WatchHistory;

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, Play, Film, ChevronRight, Bookmark, Sparkles, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useAuth from '@/contexts/authHooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingState from '@/components/LoadingState';
import { tmdbApi } from '@/services/tmdbApiProduction';

interface WatchListItem {
  id: string;
  content_id: string;
  user_id: string;
  created_at: string;
  title: string;
  image_url: string;
  content_type: string;
  rating?: string;
  year?: string;
}

const WatchList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, isLoading]);

  const fetchWatchList = useCallback(async () => {
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
        const enrichedData = await Promise.all(
          data.map(async (item) => {
            try {
              const details = await tmdbApi.getContentDetails(item.content_id || '');
              return {
                id: item.id,
                content_id: item.content_id || '',
                user_id: item.user_id,
                created_at: item.created_at,
                title: details?.title || 'Unknown Title',
                image_url: details?.image || details?.poster || '',
                content_type: details?.content_type || 'movie',
                rating: details?.rating,
                year: details?.year
              };
            } catch {
              return {
                id: item.id,
                content_id: item.content_id || '',
                user_id: item.user_id,
                created_at: item.created_at,
                title: 'Unknown Title',
                image_url: '',
                content_type: 'movie'
              };
            }
          })
        );

        setWatchList(enrichedData);
      } else {
        setWatchList([]);
      }
    } catch (error) {
      toast.error('Failed to load watch list matrix');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWatchList();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchWatchList]);

  const removeFromWatchList = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWatchList(prev => prev.filter(item => item.id !== id));
      toast.success('Removed from synchronized queue');
    } catch (error) {
      toast.error('Failed to terminate entry');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Recalibrating your personal queue..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-indigo-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="watchlist-header flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                  <Bookmark className="w-6 h-6 text-blue-500 fill-current" />
                </div>
                <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Temporal Buffer</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
                Watch List
              </h1>
              <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-2xl">
                Your high-priority content queue, synchronized across all neural nodes.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl flex items-center gap-3 group">
                <Clock className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-black text-gray-300">
                  {watchList.length} <span className="text-gray-500">{watchList.length === 1 ? 'UNIT' : 'UNITS'}</span>
                </span>
              </div>
            </div>
          </div>

          {watchList.length === 0 ? (
            <div className="watchlist-section text-center py-32 bg-[#111]/80 rounded-[40px] border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-gray-800 to-black mx-auto mb-10 flex items-center justify-center border border-white/10 shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                <Sparkles className="w-12 h-12 text-gray-600 group-hover:text-blue-400 transition-colors" />
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Matrix Entry Required</h2>
              <p className="text-gray-500 mb-12 max-w-sm mx-auto text-lg font-medium leading-relaxed">
                No temporal content signals detected. Initiate exploration to populate your buffer.
              </p>
              <Button
                className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-cinemax-500 hover:text-white font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/20"
                onClick={() => navigate('/')}
              >
                Launch Exploration
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {watchList.map((item) => (
                <div
                  id={`watchlist-${item.id}`}
                  key={item.id}
                  className="watchlist-card group relative flex flex-col"
                  onClick={() => navigate(`/content/${item.content_id}`)}
                >
                  <div className="aspect-[16/10] rounded-[32px] overflow-hidden bg-[#111] border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-[1.03] group-hover:border-blue-500/30 group-hover:shadow-blue-500/10 relative">
                    {item.image_url ? (
                      <>
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-all duration-500" />
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 p-8 text-center">
                        <Film className="w-12 h-12 text-gray-800 mb-4" />
                        <span className="text-gray-600 text-xs font-black uppercase tracking-widest">{item.title}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[4px]">
                      <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-3xl transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out hover:bg-blue-500 hover:text-white">
                        <Play size={28} className="fill-current ml-1" />
                      </div>
                    </div>

                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-red-500 hover:bg-white hover:border-transparent transition-all"
                        onClick={(e) => removeFromWatchList(item.id, e)}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>

                    {item.rating && (
                      <div className="absolute bottom-5 left-5 px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                        {item.rating} Score
                      </div>
                    )}
                  </div>

                  <div className="mt-6 px-2 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1 uppercase tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest bg-white/5 truncate px-2 py-0.5 rounded-md">
                          {item.content_type}
                        </span>
                        {item.year && (
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {item.year}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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

export default WatchList;

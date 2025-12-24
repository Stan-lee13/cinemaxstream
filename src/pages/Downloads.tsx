
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Clock, CheckCircle, XCircle, Loader2, FileVideo, HardDrive, Wifi, Tv, ArrowRight, Trash2 } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DownloadRequest {
  id: string;
  content_title: string;
  content_type: string;
  season_number?: number;
  episode_number?: number;
  year?: string;
  search_query?: string;
  nkiri_url?: string;
  download_url?: string;
  quality?: string;
  file_size?: string;
  status: string;
  error_message?: string;
  created_at: string;
}

const Downloads = () => {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const fetchDownloads = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('download_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = (data as unknown) as Array<Record<string, unknown>>;
      const normalized: DownloadRequest[] = (rows || []).map((r) => ({
        id: String(r.id),
        content_title: String(r.content_title ?? ''),
        content_type: String(r.content_type ?? 'movie'),
        season_number: r.season_number == null ? undefined : (r.season_number as number),
        episode_number: r.episode_number == null ? undefined : (r.episode_number as number),
        year: r.year == null ? undefined : String(r.year),
        search_query: r.search_query == null ? undefined : String(r.search_query),
        nkiri_url: r.nkiri_url == null ? undefined : String(r.nkiri_url),
        download_url: r.download_url == null ? undefined : String(r.download_url),
        quality: r.quality == null ? undefined : String(r.quality),
        file_size: r.file_size == null ? undefined : String(r.file_size),
        status: String(r.status ?? 'pending'),
        error_message: r.error_message == null ? undefined : String(r.error_message),
        created_at: String(r.created_at ?? new Date().toISOString()),
      }));

      setDownloads(normalized);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load downloads');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
      case 'found':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
      case 'found':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Connecting to storage library..." />
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
            <Download className="h-12 w-12 text-gray-500" />
          </div>
          <h1 className="text-4xl font-black mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">Your offline library is waiting. Sign in to manage your collection and view your requests.</p>
          <Button onClick={() => window.location.href = '/auth'} className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-gray-200 font-bold text-lg shadow-xl transition-all hover:scale-105">
            Sign In to Downloads
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <HardDrive className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Offline Library</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Downloads
              </h1>
              <p className="text-gray-400 text-lg">Track your requests and manage offline access.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-6 py-4 rounded-[20px] bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-emerald-500 text-2xl font-black">{downloads.filter(d => d.status === 'completed' || d.status === 'found').length}</span>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Ready</span>
              </div>
              <div className="px-6 py-4 rounded-[20px] bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-blue-500 text-2xl font-black">{downloads.filter(d => d.status === 'pending' || d.status === 'searching').length}</span>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Processing</span>
              </div>
            </div>
          </div>

          {downloads.length === 0 ? (
            <div className="text-center py-32 bg-[#111] rounded-[32px] border border-white/5 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-8 flex items-center justify-center border border-white/10 shadow-2xl group transition-transform hover:rotate-12">
                <Download className="h-10 w-10 text-gray-500 group-hover:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Your library is empty</h2>
              <p className="text-gray-400 mb-10 max-w-sm mx-auto text-lg">Save your favorites for offline viewing. Start exploring our collection tonight.</p>
              <Button onClick={() => window.location.href = '/'} className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-gray-200 font-bold text-lg shadow-xl transition-all hover:scale-105">
                Browse Masterpieces
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map((download) => (
                <motion.div
                  key={download.id}
                  className="download-card group relative overflow-hidden rounded-[28px] bg-[#111] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${getStatusStyles(download.status)} scale-90`}>
                            {getStatusIcon(download.status)}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{download.status}</span>
                        </div>
                        <h3 className="font-bold text-xl text-white mb-2 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
                          {download.content_title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md capitalize">
                            {download.content_type === 'movie' ? <FileVideo size={12} /> : <Tv size={12} />}
                            {download.content_type}
                          </span>
                          {download.year && <span className="text-gray-600">•</span>}
                          {download.year && <span>{download.year}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 bg-black/20 rounded-2xl p-4 border border-white/5">
                      {download.season_number && download.episode_number && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Episode</span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">S{download.season_number} E{download.episode_number}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Quality</span>
                        <span className="text-gray-300 font-bold">
                          {download.quality || 'Premium HD'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Size</span>
                        <span className="text-gray-300 font-bold">{download.file_size || 'Calculating...'}</span>
                      </div>
                    </div>

                    {download.error_message ? (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-xs text-red-400/80 flex items-start gap-3">
                        <XCircle className="w-5 h-5 shrink-0 text-red-500" />
                        <span className="leading-relaxed">{download.error_message}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {download.download_url && download.download_url !== download.nkiri_url && (
                          <Button
                            onClick={() => window.open(download.download_url, '_blank')}
                            className="w-full h-12 bg-white text-black hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
                          >
                            <Download className="h-5 w-5 transition-transform group-hover/btn:translate-y-1" />
                            Download Now
                          </Button>
                        )}

                        {download.nkiri_url && (
                          <Button
                            onClick={() => window.open(download.nkiri_url, '_blank')}
                            variant="ghost"
                            className="w-full h-12 border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium transition-all group/link"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Source Link
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Downloads;

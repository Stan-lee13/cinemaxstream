
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Clock, CheckCircle, XCircle, Loader2, FileVideo, HardDrive, Wifi, Tv } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import gsap from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);

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
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  // Animation effect when downloads are loaded
  useEffect(() => {
    if (!isLoading && downloads.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".download-card", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, downloads.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return <Loader2 className="h-5 w-5 animate-spin text-amber-500" />;
      case 'completed':
      case 'found':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'searching':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed':
      case 'found':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <LoadingState message="Loading your downloads..." />
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Download className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Please sign in to access your download history and manage your offline content.</p>
          <Button onClick={() => window.location.href = '/auth'} className="bg-white text-black hover:bg-gray-200">
            Sign In Now
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Downloads
            </h1>
            <p className="text-gray-400 text-lg">Manage your download requests and library</p>
          </div>

          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm flex items-center gap-2 text-sm text-gray-300">
              <HardDrive size={16} className="text-emerald-500" />
              <span>{downloads.filter(d => d.status === 'completed' || d.status === 'found').length} Ready</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm flex items-center gap-2 text-sm text-gray-300">
              <Clock size={16} className="text-amber-500" />
              <span>{downloads.filter(d => d.status === 'pending' || d.status === 'searching').length} Pending</span>
            </div>
          </div>
        </div>

        {downloads.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black mx-auto mb-6 flex items-center justify-center border border-white/10 shadow-2xl">
              <Download className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">No Downloads Yet</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start building your offline library by downloading movies and series.</p>
            <Button onClick={() => window.location.href = '/'} className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold">
              Browse Content
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="download-card group relative overflow-hidden rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${download.status === 'completed' || download.status === 'found' ? 'bg-emerald-500' :
                    download.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />

                <div className="p-6 pl-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {download.content_title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {download.content_type === 'movie' ? <FileVideo size={12} /> : <Tv size={12} />}
                        <span className="capitalize">{download.content_type}</span>
                        {download.year && <span>• {download.year}</span>}
                      </div>
                    </div>
                    <div className={`p-2 rounded-full border ${getStatusColor(download.status)}`}>
                      {getStatusIcon(download.status)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {download.season_number && download.episode_number && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Episode</span>
                        <span className="text-gray-300">S{download.season_number} E{download.episode_number}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quality</span>
                      <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded text-xs">
                        {download.quality || 'HD'}
                      </span>
                    </div>

                    {download.file_size && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size</span>
                        <span className="text-gray-300">{download.file_size}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Request Date</span>
                      <span className="text-gray-300">{new Date(download.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {download.error_message ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 flex items-start gap-2">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {download.error_message}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {download.download_url && download.download_url !== download.nkiri_url && (
                        <Button
                          onClick={() => window.open(download.download_url, '_blank')}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-900/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}

                      {download.nkiri_url && (
                        <Button
                          onClick={() => window.open(download.nkiri_url, '_blank')}
                          variant="outline"
                          className="flex-1 border-white/10 hover:bg-white/5 text-gray-300"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Link
                        </Button>
                      )}
                    </div>
                  )}
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

export default Downloads;

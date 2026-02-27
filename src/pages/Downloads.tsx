import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Download, Clock, CheckCircle, XCircle, Loader2, FileVideo, Tv, Trash2, Play } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { useDownloadManager } from '@/hooks/useDownloadManager';

interface DownloadRequest {
  id: string;
  content_title: string;
  content_type: string;
  season_number?: number;
  episode_number?: number;
  year?: string;
  quality?: string;
  file_size?: string;
  status: string;
  error_message?: string;
  created_at: string;
  cache_key?: string;
  progress?: number;
}

const Downloads = () => {
  const { user } = useAuth();
  const [dbDownloads, setDbDownloads] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackTitle, setPlaybackTitle] = useState('');
  const { downloads: managedDownloads, getPlaybackUrl, removeDownload } = useDownloadManager();

  const fetchDownloads = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('download_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = (data as unknown as Array<Record<string, unknown>>) || [];
      setDbDownloads(rows.map((r) => ({
        id: String(r.id),
        content_title: String(r.content_title ?? ''),
        content_type: String(r.content_type ?? 'movie'),
        season_number: r.season_number == null ? undefined : Number(r.season_number),
        episode_number: r.episode_number == null ? undefined : Number(r.episode_number),
        year: r.year == null ? undefined : String(r.year),
        quality: r.quality == null ? undefined : String(r.quality),
        file_size: r.file_size == null ? undefined : String(r.file_size),
        status: String(r.status ?? 'pending'),
        error_message: r.error_message == null ? undefined : String(r.error_message),
        created_at: String(r.created_at ?? new Date().toISOString()),
      })));
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

  const mergedDownloads: DownloadRequest[] = [
    ...managedDownloads.map((d) => ({
      id: d.id,
      content_title: d.title,
      content_type: d.contentType,
      season_number: d.seasonNumber,
      episode_number: d.episodeNumber,
      quality: 'HD',
      file_size: d.fileSizeLabel,
      status: d.status,
      error_message: d.error,
      created_at: d.createdAt,
      cache_key: d.cacheKey,
      progress: d.progress,
    })),
    ...dbDownloads,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleOfflinePlay = useCallback(async (cacheKey: string, title: string) => {
    const url = await getPlaybackUrl(cacheKey);
    if (!url) {
      toast.error('Offline file unavailable. Please re-download.');
      return;
    }

    setPlaybackUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setPlaybackTitle(title);
  }, [getPlaybackUrl]);

  const handleRemoveDownload = useCallback(async (id: string, cacheKey?: string) => {
    if (!cacheKey) return;
    await removeDownload(id, cacheKey);
    toast.success('Removed from offline library');
  }, [removeDownload]);

  const getStatusIcon = (status: string) => {
    if (status === 'downloading' || status === 'pending' || status === 'searching') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (status === 'completed' || status === 'found') return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /><LoadingState message="Loading downloads..." /><Footer /></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center">Sign in to view downloads.</div><Footer /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6"><BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" /></div>
        <h1 className="text-3xl font-black mb-6">Offline Library</h1>

        {mergedDownloads.length === 0 ? (
          <div className="text-gray-400">No downloads yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedDownloads.map((download) => (
              <div key={`${download.id}-${download.created_at}`} className="rounded-2xl border border-white/10 bg-[#111] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold line-clamp-2">{download.content_title}</h3>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                      {download.content_type === 'movie' ? <FileVideo size={12} /> : <Tv size={12} />}
                      {download.content_type}
                    </div>
                  </div>
                  {getStatusIcon(download.status)}
                </div>

                {typeof download.progress === 'number' && download.status === 'downloading' && (
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${download.progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{download.progress}%</p>
                  </div>
                )}

                <p className="text-xs text-gray-400">{download.file_size || 'Unknown size'}</p>

                <div className="flex gap-2">
                  {download.cache_key && download.status === 'completed' && (
                    <Button className="flex-1" onClick={() => handleOfflinePlay(download.cache_key as string, download.content_title)}>
                      <Play className="h-4 w-4 mr-2" />Play Offline
                    </Button>
                  )}
                  {download.cache_key && (
                    <Button variant="outline" onClick={() => handleRemoveDownload(download.id, download.cache_key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {download.error_message && <p className="text-xs text-red-400">{download.error_message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {playbackUrl && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#111] rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Offline Playback: {playbackTitle}</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                if (playbackUrl) URL.revokeObjectURL(playbackUrl);
                setPlaybackUrl(null);
              }}>Close</Button>
            </div>
            <video controls autoPlay className="w-full rounded-lg" src={playbackUrl} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Downloads;

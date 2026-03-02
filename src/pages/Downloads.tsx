import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Loader2, FileVideo, Tv, Trash2, Play, AlertTriangle } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface DownloadRecord {
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
}

interface OfflineFile {
  id: string;
  title: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  fileName: string;
  fileSize: number;
  fileSizeLabel: string;
  createdAt: string;
}

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cinemaxstream_offline', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline_media')) {
        db.createObjectStore('offline_media', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const Downloads = () => {
  const { user } = useAuth();
  const [dbDownloads, setDbDownloads] = useState<DownloadRecord[]>([]);
  const [offlineFiles, setOfflineFiles] = useState<OfflineFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackTitle, setPlaybackTitle] = useState('');

  const fetchDownloads = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch DB download history
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

      // Fetch offline files from IndexedDB
      try {
        const db = await openOfflineDB();
        const tx = db.transaction('offline_media', 'readonly');
        const store = tx.objectStore('offline_media');
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const files = (allReq.result || []).map((f: any) => ({
            id: f.id,
            title: f.title,
            contentType: f.contentType,
            seasonNumber: f.seasonNumber,
            episodeNumber: f.episodeNumber,
            fileName: f.fileName,
            fileSize: f.fileSize,
            fileSizeLabel: f.fileSizeLabel,
            createdAt: f.createdAt,
          }));
          setOfflineFiles(files);
        };
        tx.oncomplete = () => db.close();
      } catch {
        // IndexedDB not available
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load downloads');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchDownloads(); }, [fetchDownloads]);

  const handleOfflinePlay = useCallback(async (fileId: string, title: string) => {
    try {
      const db = await openOfflineDB();
      const tx = db.transaction('offline_media', 'readonly');
      const store = tx.objectStore('offline_media');
      const req = store.get(fileId);
      req.onsuccess = () => {
        const record = req.result;
        if (!record?.blob) {
          toast.error('Offline file not found. Please re-download.');
          return;
        }
        const url = URL.createObjectURL(record.blob);
        setPlaybackUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        setPlaybackTitle(title);
      };
      tx.oncomplete = () => db.close();
    } catch {
      toast.error('Failed to load offline file');
    }
  }, []);

  const handleDeleteOffline = useCallback(async (fileId: string) => {
    try {
      const db = await openOfflineDB();
      const tx = db.transaction('offline_media', 'readwrite');
      const store = tx.objectStore('offline_media');
      store.delete(fileId);
      tx.oncomplete = () => {
        db.close();
        setOfflineFiles(prev => prev.filter(f => f.id !== fileId));
        toast.success('Removed from offline library');
      };
    } catch {
      toast.error('Failed to remove file');
    }
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>;
    if (status === 'pending') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Awaiting File</Badge>;
    if (status === 'failed') return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{status}</Badge>;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background"><Navbar /><LoadingState message="Loading downloads..." /><Footer /></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-background text-foreground flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center">Sign in to view downloads.</div><Footer /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6"><BackButton className="hover:bg-white/5 text-muted-foreground hover:text-foreground border-border rounded-xl" /></div>
        <h1 className="text-3xl font-black mb-6">Offline Library</h1>

        {/* Offline-ready files */}
        {offlineFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Ready for Offline Playback
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlineFiles.map((file) => (
                <div key={file.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div>
                    <h3 className="font-bold line-clamp-2">{file.title}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      {file.contentType === 'movie' ? <FileVideo size={12} /> : <Tv size={12} />}
                      {file.contentType}
                      {file.seasonNumber && file.episodeNumber && <span>S{file.seasonNumber}E{file.episodeNumber}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{file.fileSizeLabel} · {file.fileName}</p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleOfflinePlay(file.id, file.title)}>
                      <Play className="h-4 w-4 mr-2" />Play Offline
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteOffline(file.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download history */}
        <h2 className="text-lg font-bold mb-3">Download History</h2>
        {dbDownloads.length === 0 ? (
          <div className="text-muted-foreground">No downloads yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbDownloads.map((download) => (
              <div key={download.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold line-clamp-2">{download.content_title}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      {download.content_type === 'movie' ? <FileVideo size={12} /> : <Tv size={12} />}
                      {download.content_type}
                    </div>
                  </div>
                  {getStatusBadge(download.status)}
                </div>
                <p className="text-xs text-muted-foreground">{download.file_size || 'Unknown size'}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(download.created_at).toLocaleString()}</p>
                {download.error_message && <p className="text-xs text-destructive">{download.error_message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline playback overlay */}
      {playbackUrl && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card rounded-2xl border border-border p-4">
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

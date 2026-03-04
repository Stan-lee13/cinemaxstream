import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileVideo, Tv, Trash2, Play, Upload } from 'lucide-react';
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

const MIN_FILE_SIZE_MB = 50;

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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

// --- Sub-components ---

const OfflineFileCard: React.FC<{
  file: OfflineFile;
  onPlay: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}> = ({ file, onPlay, onDelete }) => (
  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
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
      <Button className="flex-1" onClick={() => onPlay(file.id, file.title)}>
        <Play className="h-4 w-4 mr-2" />Play Offline
      </Button>
      <Button variant="outline" size="icon" onClick={() => onDelete(file.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const DownloadHistoryCard: React.FC<{
  download: DownloadRecord;
  onAttachFile: (download: DownloadRecord, file: File) => void;
}> = ({ download, onAttachFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAttachFile(download, file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>;
    if (status === 'pending') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Awaiting File</Badge>;
    if (status === 'failed') return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{status}</Badge>;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
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

      {download.status === 'pending' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mkv,.avi,.mp4,.webm,.mov"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Attach Downloaded File
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">File must be &gt; {MIN_FILE_SIZE_MB} MB</p>
        </>
      )}
    </div>
  );
};

// --- Main component ---

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

      try {
        const db = await openOfflineDB();
        const tx = db.transaction('offline_media', 'readonly');
        const store = tx.objectStore('offline_media');
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const files = (allReq.result || []).map((f: any) => ({
            id: f.id, title: f.title, contentType: f.contentType,
            seasonNumber: f.seasonNumber, episodeNumber: f.episodeNumber,
            fileName: f.fileName, fileSize: f.fileSize,
            fileSizeLabel: f.fileSizeLabel, createdAt: f.createdAt,
          }));
          setOfflineFiles(files);
        };
        tx.oncomplete = () => db.close();
      } catch { /* IndexedDB not available */ }
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

  const handleAttachFile = useCallback(async (download: DownloadRecord, file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB < MIN_FILE_SIZE_MB) {
      toast.error(`File too small (${fileSizeMB.toFixed(1)} MB). Must be > ${MIN_FILE_SIZE_MB} MB.`);
      return;
    }

    // Fuzzy name match warning
    const titleWords = download.content_title.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    const fileNameLower = file.name.toLowerCase();
    const nameMatches = titleWords.length === 0 || titleWords.some(word => fileNameLower.includes(word));
    if (!nameMatches) {
      toast.warning("File name doesn't closely match the content title. Proceeding anyway.");
    }

    try {
      const db = await openOfflineDB();
      const tx = db.transaction('offline_media', 'readwrite');
      const store = tx.objectStore('offline_media');

      const record = {
        id: download.id,
        title: download.content_title,
        contentType: download.content_type,
        seasonNumber: download.season_number,
        episodeNumber: download.episode_number,
        fileName: file.name,
        fileSize: file.size,
        fileSizeLabel: formatBytes(file.size),
        mimeType: file.type || 'video/mp4',
        blob: file,
        createdAt: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      tx.oncomplete = () => db.close();

      // Update DB status
      if (user) {
        await supabase
          .from('download_requests')
          .update({ status: 'completed', completed_at: new Date().toISOString(), file_size: formatBytes(file.size) })
          .eq('id', download.id);
      }

      toast.success('File saved for offline playback!');
      fetchDownloads();
    } catch (error) {
      toast.error('Failed to save file offline.');
    }
  }, [user, fetchDownloads]);

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

        {offlineFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Ready for Offline Playback
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offlineFiles.map((file) => (
                <OfflineFileCard key={file.id} file={file} onPlay={handleOfflinePlay} onDelete={handleDeleteOffline} />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-3">Download History</h2>
        {dbDownloads.length === 0 ? (
          <div className="text-muted-foreground">No downloads yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbDownloads.map((download) => (
              <DownloadHistoryCard key={download.id} download={download} onAttachFile={handleAttachFile} />
            ))}
          </div>
        )}
      </div>

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

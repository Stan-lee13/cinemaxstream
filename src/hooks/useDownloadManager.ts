import { useCallback, useEffect, useMemo, useState } from 'react';
import { mediaCache } from '@/utils/mediaCache';

export type ManagedDownloadStatus = 'downloading' | 'completed' | 'failed';

export interface ManagedDownload {
  id: string;
  cacheKey: string;
  title: string;
  sourceUrl: string;
  sourceProvider: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  createdAt: string;
  completedAt?: string;
  bytesDownloaded: number;
  totalBytes: number;
  progress: number;
  fileSizeLabel: string;
  mimeType?: string;
  status: ManagedDownloadStatus;
  error?: string;
}

interface StartDownloadInput {
  title: string;
  sourceUrl: string;
  sourceProvider: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

const DOWNLOAD_STORAGE_KEY = 'cinemax_download_manager_v1';

const parseSize = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let value = bytes;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const readPersisted = (): ManagedDownload[] => {
  try {
    const raw = localStorage.getItem(DOWNLOAD_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ManagedDownload[];
  } catch {
    return [];
  }
};

export const useDownloadManager = () => {
  const [downloads, setDownloads] = useState<ManagedDownload[]>(() => readPersisted());

  useEffect(() => {
    localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === DOWNLOAD_STORAGE_KEY) {
        setDownloads(readPersisted());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const upsertDownload = useCallback((id: string, update: Partial<ManagedDownload>) => {
    setDownloads((prev) => prev.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }, []);

  const startDownload = useCallback(async (input: StartDownloadInput): Promise<ManagedDownload> => {
    const id = `dl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cacheKey = `offline-media/${id}`;

    const baseRecord: ManagedDownload = {
      id,
      cacheKey,
      title: input.title,
      sourceUrl: input.sourceUrl,
      sourceProvider: input.sourceProvider,
      contentType: input.contentType,
      seasonNumber: input.seasonNumber,
      episodeNumber: input.episodeNumber,
      createdAt: new Date().toISOString(),
      bytesDownloaded: 0,
      totalBytes: 0,
      progress: 0,
      fileSizeLabel: 'Pending',
      status: 'downloading',
    };

    setDownloads((prev) => [baseRecord, ...prev]);

    try {
      const response = await fetch(input.sourceUrl);
      if (!response.ok || !response.body) {
        throw new Error(`Download request failed (${response.status})`);
      }

      const totalBytes = Number(response.headers.get('content-length') || '0');
      const mimeType = response.headers.get('content-type') || 'video/mp4';
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value);
        loaded += value.length;
        const progress = totalBytes > 0 ? Math.min(99, Math.round((loaded / totalBytes) * 100)) : 0;

        upsertDownload(id, {
          bytesDownloaded: loaded,
          totalBytes,
          progress,
          fileSizeLabel: totalBytes > 0 ? `${parseSize(loaded)} / ${parseSize(totalBytes)}` : parseSize(loaded),
          mimeType,
        });
      }

      const blob = new Blob(chunks as BlobPart[], { type: mimeType });
      const cached = await mediaCache.cacheMedia(cacheKey, blob, { maxAge: 1000 * 60 * 60 * 24 * 30, maxSize: 1024, priority: 'high' });

      if (!cached) throw new Error('Failed to persist file to offline cache');

      const completedAt = new Date().toISOString();
      const fileSizeLabel = parseSize(blob.size);

      upsertDownload(id, {
        status: 'completed',
        progress: 100,
        bytesDownloaded: blob.size,
        totalBytes: blob.size,
        fileSizeLabel,
        completedAt,
        mimeType,
      });

      return {
        ...baseRecord,
        status: 'completed',
        progress: 100,
        bytesDownloaded: blob.size,
        totalBytes: blob.size,
        fileSizeLabel,
        completedAt,
        mimeType,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download error';
      upsertDownload(id, { status: 'failed', error: message, progress: 0, fileSizeLabel: 'Failed' });
      throw new Error(message);
    }
  }, [upsertDownload]);

  const removeDownload = useCallback(async (id: string, cacheKey: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    const cache = await caches.open('cinemaxstream-media-v3');
    await cache.delete(cacheKey);
  }, []);

  const getPlaybackUrl = useCallback(async (cacheKey: string): Promise<string | null> => {
    const response = await mediaCache.getMedia(cacheKey);
    if (!response) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }, []);

  const completedDownloads = useMemo(() => downloads.filter((item) => item.status === 'completed'), [downloads]);

  return {
    downloads,
    completedDownloads,
    startDownload,
    removeDownload,
    getPlaybackUrl,
  };
};

/**
 * Offline downloads hook
 * Stores content metadata for offline access within the PWA
 * Does NOT trigger browser file downloads - stores internally
 */

import { useState, useEffect, useCallback } from 'react';

export interface OfflineContent {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  poster: string;
  backdrop?: string;
  description?: string;
  year?: string;
  rating?: number;
  duration?: string;
  source: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  progress: {
    watched: number;
    duration: number;
  };
  downloadedAt: number;
  lastUpdated: number;
}

const OFFLINE_STORAGE_KEY = 'offline_downloads';
const MAX_OFFLINE_ITEMS = 50;

export const useOfflineDownloads = () => {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineContent[];
        setOfflineContent(parsed);
      }
    } catch (error) {
      console.error('Failed to load offline downloads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const persistContent = useCallback((content: OfflineContent[]) => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(content));
    } catch (error) {
      console.error('Failed to save offline downloads:', error);
    }
  }, []);

  // Add content for offline access
  const addOfflineContent = useCallback((content: Omit<OfflineContent, 'downloadedAt' | 'lastUpdated'>): boolean => {
    // Check if already exists
    const exists = offlineContent.some(c => 
      c.id === content.id &&
      c.season === content.season &&
      c.episode === content.episode
    );

    if (exists) {
      return false;
    }

    // Check storage limit
    if (offlineContent.length >= MAX_OFFLINE_ITEMS) {
      return false;
    }

    const newContent: OfflineContent = {
      ...content,
      downloadedAt: Date.now(),
      lastUpdated: Date.now()
    };

    const updated = [newContent, ...offlineContent];
    setOfflineContent(updated);
    persistContent(updated);

    return true;
  }, [offlineContent, persistContent]);

  // Remove offline content
  const removeOfflineContent = useCallback((
    id: string,
    season?: number,
    episode?: number
  ): boolean => {
    const updated = offlineContent.filter(c => 
      !(c.id === id && c.season === season && c.episode === episode)
    );

    if (updated.length === offlineContent.length) {
      return false;
    }

    setOfflineContent(updated);
    persistContent(updated);
    return true;
  }, [offlineContent, persistContent]);

  // Update progress for offline content
  const updateProgress = useCallback((
    id: string,
    progress: { watched: number; duration: number },
    season?: number,
    episode?: number
  ) => {
    const updated = offlineContent.map(c => {
      if (c.id === id && c.season === season && c.episode === episode) {
        return {
          ...c,
          progress,
          lastUpdated: Date.now()
        };
      }
      return c;
    });

    setOfflineContent(updated);
    persistContent(updated);
  }, [offlineContent, persistContent]);

  // Check if content is available offline
  const isOfflineAvailable = useCallback((
    id: string,
    season?: number,
    episode?: number
  ): boolean => {
    return offlineContent.some(c => 
      c.id === id && c.season === season && c.episode === episode
    );
  }, [offlineContent]);

  // Get offline content by ID
  const getOfflineContent = useCallback((
    id: string,
    season?: number,
    episode?: number
  ): OfflineContent | null => {
    return offlineContent.find(c => 
      c.id === id && c.season === season && c.episode === episode
    ) || null;
  }, [offlineContent]);

  // Clear all offline content
  const clearAllOffline = useCallback(() => {
    setOfflineContent([]);
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear offline downloads:', error);
    }
  }, []);

  // Get total count
  const getOfflineCount = useCallback(() => {
    return offlineContent.length;
  }, [offlineContent]);

  // Get storage limit info
  const getStorageInfo = useCallback(() => {
    return {
      used: offlineContent.length,
      limit: MAX_OFFLINE_ITEMS,
      available: MAX_OFFLINE_ITEMS - offlineContent.length
    };
  }, [offlineContent]);

  return {
    offlineContent,
    isLoading,
    addOfflineContent,
    removeOfflineContent,
    updateProgress,
    isOfflineAvailable,
    getOfflineContent,
    clearAllOffline,
    getOfflineCount,
    getStorageInfo
  };
};

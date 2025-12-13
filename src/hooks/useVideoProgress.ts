/**
 * Video progress tracking hook
 * Stores and retrieves playback progress for resume functionality
 * Includes VidRock listener for enhanced progress tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface VideoProgress {
  contentId: string;
  contentType: string;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  timestamp: number;
  source: number;
  title?: string;
  poster?: string;
}

interface VidRockMediaData {
  type: string;
  data: {
    currentTime?: number;
    duration?: number;
    title?: string;
    episode?: number;
    season?: number;
  };
}

const PROGRESS_STORAGE_KEY = 'video_progress';
const MAX_STORED_ITEMS = 100;

export const useVideoProgress = () => {
  const [allProgress, setAllProgress] = useState<VideoProgress[]>([]);
  const vidRockListenerRef = useRef<boolean>(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VideoProgress[];
        setAllProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load video progress:', error);
    }
  }, []);

  // VidRock message listener for enhanced progress tracking
  useEffect(() => {
    if (vidRockListenerRef.current) return;
    vidRockListenerRef.current = true;

    const handleVidRockMessage = (event: MessageEvent) => {
      // Only accept messages from VidRock
      if (!event.origin.includes('vidrock.net')) return;

      try {
        const data = event.data as VidRockMediaData;
        if (data?.type === 'MEDIA_DATA' && data.data) {
          // Store VidRock progress
          localStorage.setItem('vidRockProgress', JSON.stringify(data.data));
        }
      } catch (error) {
        // Ignore parsing errors from other messages
      }
    };

    window.addEventListener('message', handleVidRockMessage);

    return () => {
      window.removeEventListener('message', handleVidRockMessage);
      vidRockListenerRef.current = false;
    };
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: VideoProgress) => {
    setAllProgress(prev => {
      // Find existing entry for this content
      const existingIndex = prev.findIndex(p => 
        p.contentId === progress.contentId &&
        p.season === progress.season &&
        p.episode === progress.episode
      );

      let updated: VideoProgress[];
      
      if (existingIndex >= 0) {
        // Update existing entry
        updated = [...prev];
        updated[existingIndex] = { ...progress, timestamp: Date.now() };
      } else {
        // Add new entry
        updated = [{ ...progress, timestamp: Date.now() }, ...prev];
      }

      // Limit stored items
      if (updated.length > MAX_STORED_ITEMS) {
        updated = updated.slice(0, MAX_STORED_ITEMS);
      }

      // Persist to localStorage
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save video progress:', error);
      }

      return updated;
    });
  }, []);

  // Get progress for specific content
  const getProgress = useCallback((
    contentId: string,
    season?: number,
    episode?: number
  ): VideoProgress | null => {
    return allProgress.find(p => 
      p.contentId === contentId &&
      p.season === season &&
      p.episode === episode
    ) || null;
  }, [allProgress]);

  // Clear progress for specific content
  const clearProgress = useCallback((
    contentId: string,
    season?: number,
    episode?: number
  ) => {
    setAllProgress(prev => {
      const updated = prev.filter(p => 
        !(p.contentId === contentId &&
          p.season === season &&
          p.episode === episode)
      );

      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to clear video progress:', error);
      }

      return updated;
    });
  }, []);

  // Clear all progress
  const clearAllProgress = useCallback(() => {
    setAllProgress([]);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear all video progress:', error);
    }
  }, []);

  // Get recently watched (for continue watching)
  const getRecentlyWatched = useCallback((limit: number = 10): VideoProgress[] => {
    return allProgress
      .filter(p => p.position > 0 && p.position < p.duration * 0.95) // Not finished
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [allProgress]);

  return {
    allProgress,
    saveProgress,
    getProgress,
    clearProgress,
    clearAllProgress,
    getRecentlyWatched
  };
};

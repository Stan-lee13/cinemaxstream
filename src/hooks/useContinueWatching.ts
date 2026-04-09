/**
 * Continue Watching Hook
 * 
 * Fetches and manages the user's partially watched content.
 * Data is now sourced from localStorage video progress (useVideoProgress)
 * instead of the broken Supabase watch_sessions table.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tmdbApi } from '@/services/tmdbApi';
import { useVideoProgress } from './useVideoProgress';

export interface ContinueWatchingItem {
  id: string;
  contentId: string;
  title: string;
  image?: string;
  progress: number;
  lastWatched: string;
  season?: number;
  episode?: number;
}

export const useContinueWatching = () => {
  const { user } = useAuth();
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getRecentlyWatched, clearProgress } = useVideoProgress();

  const fetchContinueWatching = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get recently watched from localStorage (working source)
      const recentProgress = getRecentlyWatched(8);

      // Fetch images and details from TMDB
      const continueItems = await Promise.all(
        recentProgress.map(async (progress) => {
          // Calculate progress percentage
          const progressPercent = progress.duration > 0 
            ? Math.round((progress.position / progress.duration) * 100)
            : 0;

          // Filter out completed items (95%+ watched)
          if (progressPercent >= 95) {
            return null;
          }

          // Try to get image from TMDB
          let image = '';
          let title = progress.title || 'Unknown Title';
          
          try {
            const details = await tmdbApi.getContentDetails(progress.contentId, progress.contentType);
            image = details?.image || '';
            title = details?.title || title;
          } catch {
            // Fallback - use stored data
          }

          return {
            id: `${progress.contentId}-${progress.season || ''}-${progress.episode || ''}`,
            contentId: progress.contentId,
            title,
            image,
            progress: progressPercent,
            lastWatched: new Date(progress.timestamp).toISOString(),
            season: progress.season,
            episode: progress.episode,
          };
        })
      );

      // Filter out nulls (completed items) and set state
      setContinueWatchingItems(continueItems.filter((item): item is ContinueWatchingItem => item !== null));
    } catch {
      setContinueWatchingItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, getRecentlyWatched]);

  useEffect(() => {
    fetchContinueWatching();
  }, [fetchContinueWatching]);

  const removeItem = useCallback(async (itemId: string) => {
    // Find the item to get content details for clearing progress
    const item = continueWatchingItems.find(i => i.id === itemId);
    if (item) {
      // Clear the progress from localStorage
      clearProgress(item.contentId, item.season, item.episode);
    }
    
    // Update local state
    setContinueWatchingItems(prev => prev.filter(item => item.id !== itemId));
  }, [continueWatchingItems, clearProgress]);

  return {
    continueWatchingItems,
    isLoading,
    refreshContinueWatching: fetchContinueWatching,
    removeItem
  };
};

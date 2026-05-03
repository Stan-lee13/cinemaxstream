/**
 * Continue Watching Hook
 *
 * Sources progress from localStorage (useVideoProgress) which is updated
 * via postMessage events from the embedded video providers.
 *
 * Improvements:
 *  - Uses saved poster/title first to avoid blocking on TMDB
 *  - Enforces a minimum 5% watched threshold (memory rule)
 *  - Filters out completed items (>=95%)
 *  - Falls back to TMDB only when local poster is missing
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/authHooks';
import { tmdbApi } from '@/services/tmdbApi';
import { useVideoProgress } from './useVideoProgress';

export interface ContinueWatchingItem {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  image?: string;
  progress: number;
  lastWatched: string;
  season?: number;
  episode?: number;
}

const MIN_PROGRESS_PERCENT = 5;
const MAX_PROGRESS_PERCENT = 95;

export const useContinueWatching = () => {
  const { user } = useAuth();
  const { getRecentlyWatched, clearProgress, allProgress } = useVideoProgress();
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stable list of recent progress entries; recompute when underlying progress changes
  const recentProgress = useMemo(() => getRecentlyWatched(8), [getRecentlyWatched, allProgress]);

  const fetchContinueWatching = useCallback(async () => {
    if (!user) {
      setContinueWatchingItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Build items immediately from local data so the UI is never blocked on TMDB
    const baseItems: ContinueWatchingItem[] = recentProgress
      .map((progress) => {
        const progressPercent = progress.duration > 0
          ? Math.round((progress.position / progress.duration) * 100)
          : 0;

        if (progressPercent < MIN_PROGRESS_PERCENT || progressPercent >= MAX_PROGRESS_PERCENT) {
          return null;
        }

        return {
          id: `${progress.contentId}-${progress.season ?? ''}-${progress.episode ?? ''}`,
          contentId: progress.contentId,
          contentType: progress.contentType || 'movie',
          title: progress.title || 'Continue Watching',
          image: progress.poster || '',
          progress: progressPercent,
          lastWatched: new Date(progress.timestamp).toISOString(),
          season: progress.season,
          episode: progress.episode,
        } as ContinueWatchingItem;
      })
      .filter((i): i is ContinueWatchingItem => i !== null);

    setContinueWatchingItems(baseItems);
    setIsLoading(false);

    // Hydrate missing posters/titles from TMDB in the background (non-blocking)
    const needsHydration = baseItems.filter((i) => !i.image || i.title === 'Continue Watching');
    if (needsHydration.length === 0) return;

    const hydrated = await Promise.all(
      needsHydration.map(async (item) => {
        try {
          const details = await tmdbApi.getContentDetails(item.contentId, item.contentType);
          return {
            ...item,
            image: item.image || details?.image || '',
            title: details?.title || item.title,
          };
        } catch {
          return item;
        }
      })
    );

    setContinueWatchingItems((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      hydrated.forEach((i) => map.set(i.id, i));
      return Array.from(map.values());
    });
  }, [user, recentProgress]);

  useEffect(() => {
    fetchContinueWatching();
  }, [fetchContinueWatching]);

  const removeItem = useCallback((itemId: string) => {
    const item = continueWatchingItems.find((i) => i.id === itemId);
    if (item) {
      clearProgress(item.contentId, item.season, item.episode);
    }
    setContinueWatchingItems((prev) => prev.filter((i) => i.id !== itemId));
  }, [continueWatchingItems, clearProgress]);

  return {
    continueWatchingItems,
    isLoading,
    refreshContinueWatching: fetchContinueWatching,
    removeItem,
  };
};

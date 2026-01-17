/**
 * Continue Watching Hook
 * 
 * Fetches and manages the user's partially watched content.
 * Data is persisted in Supabase watch_sessions table.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { tmdbApi } from '@/services/tmdbApi';

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

  const fetchContinueWatching = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get recent watch sessions with progress between 5% and 90%
      const { data: sessions, error } = await supabase
        .from('watch_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('total_watched_time', 300) // At least 5 minutes watched
        .order('session_start', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Filter and deduplicate by content_id (keep most recent)
      const seenContentIds = new Set<string>();
      const filteredSessions = (sessions || [])
        .filter(session => {
          if (seenContentIds.has(session.content_id)) return false;
          
          if (session.content_duration) {
            const totalWatched = session.total_watched_time || 0;
            const progress = (totalWatched / session.content_duration) * 100;
            if (progress < 5 || progress >= 90) return false;
          }
          
          seenContentIds.add(session.content_id);
          return true;
        })
        .slice(0, 8);

      // Fetch images for content from TMDB
      const continueItems: ContinueWatchingItem[] = await Promise.all(
        filteredSessions.map(async (session) => {
          const totalWatched = session.total_watched_time || 0;
          const progress = session.content_duration 
            ? Math.min((totalWatched / session.content_duration) * 100, 100)
            : 0;

          // Try to get image from TMDB
          let image = '';
          try {
            const details = await tmdbApi.getContentDetails(session.content_id, 'movie');
            image = details?.image || '';
          } catch {
            // Fallback - no image
          }

          return {
            id: session.id,
            contentId: session.content_id,
            title: session.content_title || 'Unknown Title',
            image,
            progress: Math.round(progress),
            lastWatched: session.session_start || '',
          };
        })
      );

      setContinueWatchingItems(continueItems);
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      setContinueWatchingItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContinueWatching();
  }, [fetchContinueWatching]);

  const removeItem = useCallback(async (itemId: string) => {
    setContinueWatchingItems(prev => prev.filter(item => item.id !== itemId));
    
    // Optionally mark as completed in database
    try {
      await supabase
        .from('watch_sessions')
        .update({ total_watched_time: 0 })
        .eq('id', itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }, []);

  return {
    continueWatchingItems,
    isLoading,
    refreshContinueWatching: fetchContinueWatching,
    removeItem
  };
};

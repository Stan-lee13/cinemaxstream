
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchContinueWatching = async () => {
      setIsLoading(true);
      try {
        // Get recent watch sessions with progress between 5% and 90%
        const { data: sessions, error } = await supabase
          .from('watch_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gt('total_watched_time', 300) // At least 5 minutes watched
          .order('session_start', { ascending: false })
          .limit(10);

        if (error) throw error;

        const continueItems: ContinueWatchingItem[] = (sessions || [])
          .filter(session => {
            if (!session.content_duration) return true;
            const progress = (session.total_watched_time / session.content_duration) * 100;
            return progress >= 5 && progress < 90; // Only show partially watched content
          })
          .map(session => {
            const progress = session.content_duration 
              ? Math.min((session.total_watched_time / session.content_duration) * 100, 100)
              : 0;

            return {
              id: session.id,
              contentId: session.content_id,
              title: session.content_title || 'Unknown Title',
              progress: Math.round(progress),
              lastWatched: session.session_start || '',
              // Season/episode info will be added based on content type
            };
          })
          .slice(0, 8); // Limit to 8 items

        setContinueWatchingItems(continueItems);
      } catch (error) {
        console.error('Error fetching continue watching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContinueWatching();
  }, [user]);

  return {
    continueWatchingItems,
    isLoading
  };
};

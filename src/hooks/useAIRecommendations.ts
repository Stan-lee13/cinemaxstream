
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIRecommendation {
  title: string;
  reason: string;
  genre: string;
  confidence: number;
}

export interface UserWatchData {
  title: string;
  genre?: string;
  completion_percent: number;
  watch_duration: number;
  favorited: boolean;
}

// Typed access to global error reporter to avoid 'any'
type ErrorReporter = { captureException: (err: Error, context?: string, severity?: string) => void };
const getErrorReporter = (): ErrorReporter | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { errorReporter?: ErrorReporter }).errorReporter;
};

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Top-level helpers moved into fetchRecommendations to avoid changing dependencies

  const isLoadingRef = useRef(isLoading);
  const lastFetchedRef = useRef<Date | null>(lastFetched);

  // keep refs in sync
  isLoadingRef.current = isLoading;
  lastFetchedRef.current = lastFetched;

  const fetchRecommendations = useCallback(async (force = false) => {
    if (!user || isLoadingRef.current) return;

    // helper: fetch user watch data
    const fetchUserWatchDataLocal = async (): Promise<UserWatchData[]> => {
      if (!user) return [];

      try {
        const watchResp = await supabase
          .from('watch_sessions')
          .select('content_id, content_title, total_watched_time, content_duration')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        const favResp = await supabase
          .from('user_favorites')
          .select('content_id')
          .eq('user_id', user.id);

        const watchHistory = (watchResp.data || []) as Array<{ content_id: string; content_title?: string; total_watched_time?: number; content_duration?: number }>;
        const favorites = (favResp.data || []) as Array<{ content_id: string }>;

        const favoriteIds = new Set(favorites.map(f => f.content_id));

        return watchHistory.map(item => ({
          title: item.content_title || 'Unknown',
          completion_percent: item.content_duration
            ? Math.min(((item.total_watched_time ?? 0) / item.content_duration) * 100, 100)
            : 0,
          watch_duration: item.total_watched_time ?? 0,
          favorited: favoriteIds.has(item.content_id),
          genre: 'Unknown'
        }));
      } catch (err) {
        const reporter = getErrorReporter();
        reporter?.captureException(err as Error, 'useAIRecommendations', 'medium');
        return [];
      }
    };

    // helper: call server function to generate recommendations
    const generateRecommendationsLocal = async (watchData: UserWatchData[]): Promise<AIRecommendation[]> => {
      try {
        const response = await supabase.functions.invoke('generate-ai-recommendations', {
          body: { watchData }
        });

        if (response.error) throw response.error;
        return response.data?.recommendations || [];
      } catch (err) {
        const reporter = getErrorReporter();
        reporter?.captureException(err as Error, 'useAIRecommendations', 'medium');
        return [];
      }
    };

    // Check if we need to refetch (every 4 hours)
    if (!force && lastFetchedRef.current && Date.now() - lastFetchedRef.current.getTime() < 4 * 60 * 60 * 1000) {
      return;
    }

    setIsLoading(true);

    try {
      const watchData = await fetchUserWatchDataLocal();

      if (watchData.length === 0) {
        setRecommendations([]);
        setLastFetched(new Date());
        return;
      }

      const aiRecommendations = await generateRecommendationsLocal(watchData);
      setRecommendations(aiRecommendations);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    lastFetched
  };
};

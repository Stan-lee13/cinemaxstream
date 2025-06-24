
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthState';

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

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchUserWatchData = async (): Promise<UserWatchData[]> => {
    if (!user) return [];

    try {
      // Get watch history
      const { data: watchHistory } = await supabase
        .from('watch_sessions')
        .select('content_title, total_watched_time, content_duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get favorites
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('content_id')
        .eq('user_id', user.id);

      const favoriteIds = new Set(favorites?.map(f => f.content_id) || []);

      return (watchHistory || []).map(item => ({
        title: item.content_title || 'Unknown',
        completion_percent: item.content_duration 
          ? Math.min((item.total_watched_time / item.content_duration) * 100, 100)
          : 0,
        watch_duration: item.total_watched_time || 0,
        favorited: favoriteIds.has(item.content_id),
        genre: 'Unknown' // We'll enhance this later with content data
      }));
    } catch (error) {
      console.error('Error fetching user watch data:', error);
      return [];
    }
  };

  const generateRecommendations = async (watchData: UserWatchData[]): Promise<AIRecommendation[]> => {
    try {
      const response = await supabase.functions.invoke('generate-ai-recommendations', {
        body: { watchData }
      });

      if (response.error) throw response.error;
      
      return response.data?.recommendations || [];
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  };

  const fetchRecommendations = async (force = false) => {
    if (!user || isLoading) return;
    
    // Check if we need to refetch (every 4 hours)
    if (!force && lastFetched && Date.now() - lastFetched.getTime() < 4 * 60 * 60 * 1000) {
      return;
    }

    setIsLoading(true);
    
    try {
      const watchData = await fetchUserWatchData();
      
      if (watchData.length === 0) {
        setRecommendations([]);
        return;
      }

      const aiRecommendations = await generateRecommendations(watchData);
      setRecommendations(aiRecommendations);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    lastFetched
  };
};

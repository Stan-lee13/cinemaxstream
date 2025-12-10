import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getContentDetails } from '@/services/tmdbApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseContentDetailReturn {
  content: any;
  isLoading: boolean;
  liked: boolean;
  toggleFavorite: () => void;
  relatedContent: any[];
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  showTrailer: boolean;
  setShowTrailer: (value: boolean) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (value: boolean) => void;
  activeProvider: string | null;
  setActiveProvider: (provider: string | null) => void;
  seasons: any[];
  currentSeason: number;
  currentEpisode: number | null;
  trailerUrl: string | null;
  isPremiumContent: boolean;
  canAccessPremium: boolean;
  availableProviders: string[];
  startWatching: () => void;
  handleEpisodeSelect: (episode: number) => void;
  loadEpisodesForSeason: (season: number) => Promise<void>;
  showSplashScreen: boolean;
  showNeonEffect: boolean;
  user: any;
}

export const useContentDetail = (
  contentId: string | undefined,
  contentTypeHint?: string
): UseContentDetailReturn => {
  const { user, isPremium } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<number | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isPremiumContent, setIsPremiumContent] = useState(false);
  const [canAccessPremium, setCanAccessPremium] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showNeonEffect, setShowNeonEffect] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!contentId) return;

    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await getContentDetails(contentId, contentTypeHint);
        
        if (isMountedRef.current) {
          setContent(data);
          setTrailerUrl((data as any)?.videos?.results?.[0]?.key || null);
          setAvailableProviders(['nkiri', 'proxy']);
          setCanAccessPremium(isPremium);
          
          // Check if user has liked this content
          if (user) {
            // supabase client in this repo uses strong generics; cast to any to avoid overload issues
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: faveData } = await (supabase as any)
              .from('user_favorites')
              .select('id')
              .eq('user_id', user.id)
              .eq('content_id', contentId)
              .maybeSingle();
            
            setLiked(!!faveData);
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          toast.error('Failed to load content');
          setContent(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadContent();
  }, [contentId, contentTypeHint, user, isPremium]);

  const toggleFavorite = useCallback(async () => {
    if (!user || !contentId) return;

    try {
      if (liked) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);
        setLiked(false);
        toast.success('Removed from favorites');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('user_favorites')
          .insert({
            user_id: user.id,
            content_id: contentId,
            content_type: contentTypeHint || 'movie'
          });
        setLiked(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  }, [user, contentId, liked, contentTypeHint]);

  const handleEpisodeSelect = useCallback((episode: number) => {
    setCurrentEpisode(episode);
  }, []);

  const loadEpisodesForSeason = useCallback(async (season: number) => {
    setCurrentSeason(season);
  }, []);

  const startWatching = useCallback(() => {
    setIsPlaying(true);
  }, []);

  return {
    content,
    isLoading,
    liked,
    toggleFavorite,
    relatedContent,
    isPlaying,
    setIsPlaying,
    showTrailer,
    setShowTrailer,
    showPremiumModal,
    setShowPremiumModal,
    activeProvider,
    setActiveProvider,
    seasons,
    currentSeason,
    currentEpisode,
    trailerUrl,
    isPremiumContent,
    canAccessPremium,
    availableProviders,
    startWatching,
    handleEpisodeSelect,
    loadEpisodesForSeason,
    showSplashScreen,
    showNeonEffect,
    user
  };
};

export default useContentDetail;

import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { tmdbApi } from "@/services/tmdbApi";
import { getTrailerUrl, getAvailableProviders } from "@/utils/videoUtils";
import { getDefaultRuntime } from "@/utils/contentUtils";
import { Season, Episode } from "@/types/content";
import type { Database } from '@/integrations/supabase/types';

type DB = Database;
type ContentRow = DB['public']['Tables']['content']['Row'];
type ContentCategoryRow = DB['public']['Tables']['content_categories']['Row'];

// Extend ContentRow with additional properties
interface ContentWithCategory extends ContentRow {
  content_categories?: ContentCategoryRow | null;
}

// Extend ContentRow with additional properties
export interface Content extends ContentRow {
  content_categories?: ContentCategoryRow | null;
  is_premium?: boolean | null;
  tmdb_id?: string | null;
}

export const useContentDetail = (contentId: string | undefined, contentTypeHint?: string) => {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_embed_ru');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number | undefined>();
  const [currentEpisode, setCurrentEpisode] = useState<number | undefined>();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [showNeonEffect, setShowNeonEffect] = useState(false);
  const { user, isAuthenticated, isPremium } = useAuth();
  const [tmdbId, setTmdbId] = useState<string | null>(null);

  const availableProviders = contentId ? getAvailableProviders(contentId, content?.content_type || 'movie') : [];
  const isPremiumContent = content?.is_premium || (content?.rating && parseFloat(String(content.rating)) > 8.0);
  const canAccessPremium = isPremium;
  
  // Check if content is in early access
  const isEarlyAccess = content?.early_access_until 
    ? new Date() < new Date(content.early_access_until)
    : false;

  // Fetch content details
  useEffect(() => {
    if (!contentId) return;
  window.scrollTo(0, 0);
  setIsLoading(true);
    const fetchContent = async () => {
      try {
        // Fetch content details with type assertion
        const contentResp = await supabase
          .from('content')
          .select('*, content_categories(*)')
          .eq('id', contentId)
          .single();
        const contentData = contentResp.data as ContentWithCategory | null;
        const contentError = contentResp.error;
        
        if (contentError) {
          // If the content is not in our database, fetch from TMDB
          // Use contentTypeHint if provided to ensure correct content type detection
          const tmdbContent = await tmdbApi.getContentDetails(contentId, contentTypeHint);
          if (tmdbContent) {
            setTmdbId(contentId); // contentId is the TMDB ID in this case
            setContent({
              id: tmdbContent.id,
              title: tmdbContent.title,
              description: tmdbContent.description || null,
              image_url: tmdbContent.image,
              category_id: null,
              content_type: tmdbContent.type || 'movie',
              year: tmdbContent.year,
              duration: tmdbContent.duration || getDefaultRuntime(tmdbContent.type || 'movie'),
              rating: tmdbContent.rating,
              featured: false,
              trending: true,
              popular: true,
              is_premium: parseFloat(tmdbContent.rating) > 8.0,
              content_categories: {
                id: '1',
                name: tmdbContent.category,
                slug: tmdbContent.category?.toLowerCase() || 'general',
                description: null,
                created_at: new Date().toISOString()
              } as ContentCategoryRow,
              tmdb_id: contentId, // Set TMDB ID
              is_trending_new: false,
              early_access_until: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
            // Try to get trailer URL
            try {
              const trailer = await getTrailerUrl(contentId, tmdbContent.type || 'movie');
              setTrailerUrl(trailer);
            } catch (e) {
            // Error fetching trailer - continue without trailer
            }
            
            // Fetch related content from TMDB
            const similar = await tmdbApi.getSimilarContent(contentId, tmdbContent.type || 'movie');
            setRelatedContent(similar.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description || null,
              image_url: item.image,
              category_id: null,
              content_type: item.type || 'movie',
              year: item.year,
              duration: item.duration || getDefaultRuntime(item.type || 'movie'),
              rating: item.rating,
              featured: false,
              trending: true,
              popular: true,
              is_premium: parseFloat(item.rating) > 8.0,
              content_categories: null,
              tmdb_id: item.id,
              is_trending_new: false,
              early_access_until: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })));
            
            // If it's a TV show, fetch seasons and episodes
            if (tmdbContent.type === 'series' || tmdbContent.type === 'anime') {
              try {
                const tvSeasons = await tmdbApi.getTvShowSeasons(contentId);
                if (tvSeasons.length > 0) {
                  // Fetch episodes for the first season
                  const firstSeasonEpisodes = await tmdbApi.getTvShowEpisodes(
                    contentId, 
                    tvSeasons[0].season_number
                  );
                  
                  // Update the first season's episodes
                  if (firstSeasonEpisodes.length > 0) {
                    tvSeasons[0].episodes = firstSeasonEpisodes;
                  }
                  
                  setSeasons(tvSeasons);
                } else {
                  setSeasons([]);
                }
              } catch (error) {
                setSeasons([]);
              }
            }
            
            setIsLoading(false);
            return;
          }
          
          throw contentError;
        }
        
        // Content found in database - try to get TMDB ID
        // For now, we'll assume the contentId parameter is the TMDB ID
        // In a real implementation, we would store the TMDB ID in the database
        setTmdbId(contentId);
        setContent({
          ...contentData,
          tmdb_id: contentId, // Assume contentId is the TMDB ID
          is_trending_new: contentData?.is_trending_new || false,
          early_access_until: contentData?.early_access_until || null
        } as Content);
        
        // Try to get trailer URL
        try {
          if (contentData) {
            const trailer = await getTrailerUrl(contentId, contentData.content_type || 'movie');
            setTrailerUrl(trailer);
          }
        } catch (e) {
          // Error fetching trailer - continue without trailer
        }
        
        // Check if user has liked this content
        if (isAuthenticated && user) {
          const favRes = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', contentId)
            .single();

          setLiked(!!favRes.data);
        }
        
        // Fetch related content from the same category
        if (contentData && contentData.category_id) {
          const relatedRes = await supabase
            .from('content')
            .select('*')
            .eq('category_id', contentData.category_id)
            .neq('id', contentId)
            .limit(10);

          setRelatedContent((relatedRes.data as ContentRow[] | null) || []);
        } else if (contentData) {
          // If no category ID, fetch related content from TMDB
          const similar = await tmdbApi.getSimilarContent(contentId, contentData.content_type);
          setRelatedContent(similar.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || null,
            image_url: item.image,
            category_id: null,
            content_type: item.type || 'movie',
            year: item.year,
            duration: item.duration || getDefaultRuntime(item.type || 'movie'),
            rating: item.rating,
            featured: false,
            trending: true,
            popular: true,
            is_premium: parseFloat(item.rating) > 8.0,
            content_categories: null,
            tmdb_id: item.id,
            is_trending_new: false,
            early_access_until: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })));
        }
        
        // If it's a TV show or anime, fetch seasons and episodes from TMDB
        if (contentData && (contentData.content_type === 'series' || contentData.content_type === 'anime')) {
          try {
            const tvSeasons = await tmdbApi.getTvShowSeasons(contentId);
            
            if (tvSeasons && tvSeasons.length > 0) {
              // Fetch episodes for the first season only initially
              const firstSeasonEpisodes = await tmdbApi.getTvShowEpisodes(
                contentId, 
                tvSeasons[0].season_number
              );
              
              tvSeasons[0].episodes = firstSeasonEpisodes || [];
              setSeasons(tvSeasons);
             } else {
               setSeasons([]);
             }
           } catch (error) {
             setSeasons([]);
           }
        }
      } catch (error) {
        // Error fetching content
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId, isAuthenticated, user, contentTypeHint]);

  // Handle early access gating
  const checkEarlyAccess = (setShowUpgradeModal: (show: boolean) => void, setUpgradeReason: (reason: 'streaming' | 'download') => void) => {
    if (isEarlyAccess && (!user || (user && !isPremium))) {
      setUpgradeReason('streaming');
      setShowUpgradeModal(true);
      return true;
    }
    return false;
  };

  // Handle favorite toggle
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add favorites");
      return;
    }
    
    if (!contentId || !user) return;
    
    try {
      if (liked) {
        // Remove from favorites
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);
        
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const favoriteData = {
          user_id: user.id,
          content_id: contentId
        };
        
        await supabase
          .from('user_favorites')
          .insert(favoriteData);
        
        toast.success("Added to favorites");
      }
      
      setLiked(!liked);
    } catch (error) {
      toast.error("Error updating favorites");
      // Error updating favorites
    }
  };

  // Start watching
  const startWatching = () => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    // Show splash screen first
    setShowSplashScreen(true);
    
    // After splash screen completes
    setTimeout(() => {
      setShowSplashScreen(false);
      setIsPlaying(true);
      
      // Activate neon effect after a slight delay
      setTimeout(() => {
        setShowNeonEffect(true);
      }, 500);
    }, 3000);
  };
  
  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    // Update current season and episode first
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episodeNumber);
    
    // If already playing, just update the video (force re-render by toggling playing state)
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
      return;
    }
    
    // Show splash screen for first play
    setShowSplashScreen(true);
    
    setTimeout(() => {
      setShowSplashScreen(false);
      setIsPlaying(true);
      
      setTimeout(() => {
        setShowNeonEffect(true);
      }, 500);
    }, 3000);
  };

  // Load episodes for a season
  const loadEpisodesForSeason = async (seasonNumber: number) => {
    if (!contentId) return;
    
    try {
      const episodes = await tmdbApi.getTvShowEpisodes(contentId, seasonNumber);
      if (episodes && episodes.length > 0) {
        // Update the episodes of the selected season
        setSeasons(prev => prev.map(season => {
          if (season.season_number === seasonNumber) {
            return {
              ...season,
              episodes: episodes
            };
          }
          return season;
        }));
      }
    } catch (error) {
      // Error loading episodes - keeping existing episodes
      // Keep existing episodes if error
    }
  };

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
    setShowSplashScreen,
    showNeonEffect,
    setShowNeonEffect,
    user,
    tmdbId // Return TMDB ID
  };
};

export default useContentDetail;
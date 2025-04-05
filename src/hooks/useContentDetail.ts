
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuthState";
import { toast } from 'sonner';
import { tmdbApi } from "@/services/tmdbApi";
import { getTrailerUrl, hasPremiumAccess, getAvailableProviders } from "@/utils/videoUtils";
import { getDefaultRuntime } from "@/utils/contentUtils";

export const useContentDetail = (contentId: string | undefined) => {
  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_xyz');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number | undefined>();
  const [currentEpisode, setCurrentEpisode] = useState<number | undefined>();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const availableProviders = contentId ? getAvailableProviders(contentId, content?.content_type || 'movie') : [];
  const isPremiumContent = content?.is_premium || (content?.rating && parseFloat(content.rating) > 8.0);
  const canAccessPremium = hasPremiumAccess();

  // Fetch content details
  useEffect(() => {
    if (!contentId) return;
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setIsLoading(true);

    const fetchContent = async () => {
      try {
        // Fetch content details with type assertion
        const { data: contentData, error: contentError } = await (supabase
          .from('content') as any)
          .select('*, content_categories(*)')
          .eq('id', contentId)
          .single();
        
        if (contentError) {
          // If the content is not in our database, fetch from TMDB
          const tmdbContent = await tmdbApi.getContentDetails(contentId);
          if (tmdbContent) {
            setContent({
              id: tmdbContent.id,
              title: tmdbContent.title,
              description: tmdbContent.description,
              image_url: tmdbContent.image,
              image: tmdbContent.image,
              backdrop: tmdbContent.backdrop,
              category_id: null,
              content_type: tmdbContent.type || 'movie',
              year: tmdbContent.year,
              duration: tmdbContent.duration || getDefaultRuntime(tmdbContent.type || 'movie'),
              rating: tmdbContent.rating,
              featured: false,
              trending: true,
              popular: true,
              trailer_key: tmdbContent.trailer_key || contentId,
              is_premium: parseFloat(tmdbContent.rating) > 8.0,
              content_categories: {
                id: '1',
                name: tmdbContent.category,
                slug: tmdbContent.category?.toLowerCase() || 'general',
                description: null
              }
            });
            
            // Try to get trailer URL
            try {
              const trailer = await getTrailerUrl(contentId, tmdbContent.type || 'movie');
              setTrailerUrl(trailer);
            } catch (e) {
              console.error('Error fetching trailer:', e);
            }
            
            // Fetch related content from TMDB
            const similar = await tmdbApi.getSimilarContent(contentId, tmdbContent.type || 'movie');
            setRelatedContent(similar);
            
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
                  // Fallback to mock data if no seasons found
                  createMockSeasons(tmdbContent.title, tmdbContent.type);
                }
              } catch (error) {
                console.error("Error fetching TV details:", error);
                // Fallback to mock data
                createMockSeasons(tmdbContent.title, tmdbContent.type);
              }
            }
            
            setIsLoading(false);
            return;
          }
          
          throw contentError;
        }
        
        setContent(contentData);
        
        // Try to get trailer URL
        try {
          const trailer = await getTrailerUrl(contentId, contentData.content_type || 'movie');
          setTrailerUrl(trailer);
        } catch (e) {
          console.error('Error fetching trailer:', e);
        }
        
        // Check if user has liked this content
        if (isAuthenticated && user) {
          const { data: favoriteData } = await (supabase
            .from('user_favorites') as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', contentId)
            .single();
          
          setLiked(!!favoriteData);
        }
        
        // Fetch related content from the same category
        if (contentData.category_id) {
          const { data: relatedData } = await (supabase
            .from('content') as any)
            .select('*')
            .eq('category_id', contentData.category_id)
            .neq('id', contentId)
            .limit(10);
          
          setRelatedContent(relatedData || []);
        } else {
          // If no category ID, fetch related content from TMDB
          const similar = await tmdbApi.getSimilarContent(contentId, contentData.content_type);
          setRelatedContent(similar);
        }
        
        // If it's a TV show or anime, fetch seasons and episodes from TMDB
        if (contentData.content_type === 'series' || contentData.content_type === 'anime') {
          try {
            const tvSeasons = await tmdbApi.getTvShowSeasons(contentId);
            
            if (tvSeasons && tvSeasons.length > 0) {
              // For each season, fetch episodes
              const seasonsWithEpisodes = await Promise.all(
                tvSeasons.slice(0, 2).map(async (season) => {
                  const episodes = await tmdbApi.getTvShowEpisodes(
                    contentId, 
                    season.season_number
                  );
                  return {
                    ...season,
                    episodes: episodes || []
                  };
                })
              );
              
              setSeasons(seasonsWithEpisodes);
            } else {
              // Fallback to mock data if no seasons
              createMockSeasons(contentData.title, contentData.content_type);
            }
          } catch (error) {
            console.error("Error fetching TV details:", error);
            // Fallback to mock data
            createMockSeasons(contentData.title, contentData.content_type);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId, isAuthenticated, user]);

  // Helper function to create mock seasons and episodes
  const createMockSeasons = (title: string, contentType: string = 'series') => {
    // For anime, create different structure based on type
    const isAnime = contentType === 'anime';
    
    const seasonCount = isAnime ? 1 : 3;
    const episodesPerSeason = isAnime ? 12 : 10;
    const episodeDuration = isAnime ? "24 min" : "45 min";
    
    const mockSeasons: Season[] = Array.from({ length: seasonCount }, (_, i) => ({
      id: `season-${i+1}`,
      season_number: i+1,
      title: `Season ${i+1}`,
      episode_count: episodesPerSeason,
      episodes: Array.from({ length: episodesPerSeason }, (_, j) => ({
        id: `ep-${i+1}-${j+1}`,
        title: `Episode ${j+1}: ${isAnime ? `${title} - ${j+1}` : `${title} Part ${j+1}`}`,
        episode_number: j+1,
        season_number: i+1,
        description: `This is episode ${j+1} of season ${i+1} of ${title}`,
        duration: episodeDuration,
        air_date: new Date().toISOString()
      })),
      poster: content?.image_url || content?.image,
      air_date: new Date().toISOString()
    }));
    
    setSeasons(mockSeasons);
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
        await (supabase
          .from('user_favorites') as any)
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
        
        await (supabase
          .from('user_favorites') as any)
          .insert(favoriteData);
        
        toast.success("Added to favorites");
      }
      
      setLiked(!liked);
    } catch (error) {
      toast.error("Error updating favorites");
      console.error(error);
    }
  };

  // Start watching
  const startWatching = () => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    setIsPlaying(true);
  };
  
  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episodeNumber);
    setIsPlaying(true);
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
      console.error("Error loading episodes:", error);
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
    loadEpisodesForSeason
  };
};

export default useContentDetail;

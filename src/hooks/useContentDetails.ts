
import { useState, useEffect } from 'react';
import { tmdbApi } from '@/services/tmdbApi';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTrailerUrl } from "@/utils/videoUtils";
import { getDefaultRuntime } from "@/utils/contentUtils";
import { Season, Episode } from "@/types/content";

interface UseContentDetailsOptions {
  contentId: string | undefined;
  includeRelated?: boolean;
  includeSeasons?: boolean;
}

interface UseContentDetailsReturn {
  content: any | null;
  relatedContent: any[];
  seasons: Season[];
  isLoading: boolean;
  error: string | null;
  trailerUrl: string | null;
  liked: boolean;
  toggleFavorite: () => Promise<void>;
}

export const useContentDetails = ({ 
  contentId, 
  includeRelated = true,
  includeSeasons = true
}: UseContentDetailsOptions): UseContentDetailsReturn => {
  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  
  // Fetch content details
  useEffect(() => {
    if (!contentId) {
      setIsLoading(false);
      setError('No content ID provided');
      return;
    }
    
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from Supabase first
        const { data: contentData, error: contentError } = await (supabase
          .from('content') as any)
          .select('*, content_categories(*)')
          .eq('id', contentId)
          .single();
        
        if (contentError) {
          // If not in our database, fetch from TMDB
          const tmdbContent = await tmdbApi.getContentDetails(contentId);
          
          if (tmdbContent) {
            const formattedContent = {
              id: tmdbContent.id,
              title: tmdbContent.title,
              description: tmdbContent.description,
              image_url: tmdbContent.image,
              image: tmdbContent.image,
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
            };
            
            setContent(formattedContent);
            
            // Fetch related content if needed
            if (includeRelated) {
              const similar = await tmdbApi.getSimilarContent(contentId, tmdbContent.type || 'movie');
              setRelatedContent(similar);
            }
            
            // Fetch seasons if it's a series/anime and includeSeasons is true
            if (includeSeasons && (tmdbContent.type === 'series' || tmdbContent.type === 'anime')) {
              // Generate appropriate seasons and episodes based on content type
              const isAnime = tmdbContent.type === 'anime';
              const seasonCount = isAnime ? 1 : 3;
              const episodeCount = isAnime ? 12 : 10;
              const episodeDuration = isAnime ? "24 min" : "45 min";
              
              const placeholderSeasons: Season[] = Array.from({ length: seasonCount }, (_, i) => ({
                id: `season-${i+1}`,
                season_number: i+1,
                title: `Season ${i+1}`,
                episode_count: episodeCount,
                episodes: Array.from({ length: episodeCount }, (_, j) => ({
                  id: `ep-${i+1}-${j+1}`,
                  title: `Episode ${j+1}: ${tmdbContent.title} ${isAnime ? `Episode ${j+1}` : `Part ${j+1}`}`,
                  episode_number: j+1,
                  season_number: i+1,
                  description: `This is episode ${j+1} of season ${i+1} of ${tmdbContent.title}`,
                  duration: episodeDuration,
                  air_date: new Date().toISOString()
                })),
                poster: tmdbContent.image,
                air_date: new Date().toISOString()
              }));
              
              setSeasons(placeholderSeasons);
            }
            
            // Try to get trailer URL
            try {
              const trailer = await getTrailerUrl(contentId, tmdbContent.type || 'movie');
              setTrailerUrl(trailer);
            } catch (e) {
              console.error('Error fetching trailer:', e);
            }
          } else {
            setError('Content not found');
          }
        } else {
          // Content found in Supabase
          setContent(contentData);
          
          // Get trailer URL
          try {
            const trailer = await getTrailerUrl(contentId, contentData.content_type || 'movie');
            setTrailerUrl(trailer);
          } catch (e) {
            console.error('Error fetching trailer:', e);
          }
          
          // Fetch related content if needed
          if (includeRelated) {
            if (contentData.category_id) {
              const { data: relatedData } = await (supabase
                .from('content') as any)
                .select('*')
                .eq('category_id', contentData.category_id)
                .neq('id', contentId)
                .limit(10);
              
              setRelatedContent(relatedData || []);
            } else {
              // Fallback to TMDB for related content
              const similar = await tmdbApi.getSimilarContent(contentId, contentData.content_type);
              setRelatedContent(similar);
            }
          }
          
          // Fetch seasons if it's a series/anime and includeSeasons is true
          if (includeSeasons && (contentData.content_type === 'series' || contentData.content_type === 'anime')) {
            // Generate appropriate seasons and episodes based on content type
            const isAnime = contentData.content_type === 'anime';
            const seasonCount = isAnime ? 1 : 3;
            const episodeCount = isAnime ? 12 : 10;
            const episodeDuration = isAnime ? "24 min" : "45 min";
            
            const placeholderSeasons: Season[] = Array.from({ length: seasonCount }, (_, i) => ({
              id: `season-${i+1}`,
              season_number: i+1,
              title: `Season ${i+1}`,
              episode_count: episodeCount,
              episodes: Array.from({ length: episodeCount }, (_, j) => ({
                id: `ep-${i+1}-${j+1}`,
                title: `Episode ${j+1}: ${contentData.title} ${isAnime ? `Episode ${j+1}` : `Part ${j+1}`}`,
                episode_number: j+1,
                season_number: i+1,
                description: `This is episode ${j+1} of season ${i+1} of ${contentData.title}`,
                duration: episodeDuration,
                air_date: new Date().toISOString()
              })),
              poster: contentData.image_url,
              air_date: new Date().toISOString()
            }));
            
            setSeasons(placeholderSeasons);
          }
        }
        
        // Check if user has liked this content
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user?.id) {
          const { data: favoriteData } = await (supabase
            .from('user_favorites') as any)
            .select('*')
            .eq('user_id', session.session.user.id)
            .eq('content_id', contentId)
            .single();
          
          setLiked(!!favoriteData);
        }
      } catch (error) {
        console.error("Error fetching content details:", error);
        setError('Failed to load content details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId, includeRelated, includeSeasons]);
  
  // Handle favorite toggle
  const toggleFavorite = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast.error("Please sign in to add favorites");
        return;
      }
      
      if (!contentId) return;
      
      const userId = session.session.user.id;
      
      if (liked) {
        // Remove from favorites
        await (supabase
          .from('user_favorites') as any)
          .delete()
          .eq('user_id', userId)
          .eq('content_id', contentId);
        
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const favoriteData = {
          user_id: userId,
          content_id: contentId
        };
        
        await (supabase
          .from('user_favorites') as any)
          .insert(favoriteData);
        
        toast.success("Added to favorites");
      }
      
      setLiked(!liked);
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Error updating favorites");
    }
  };
  
  return {
    content,
    relatedContent,
    seasons,
    isLoading,
    error,
    trailerUrl,
    liked,
    toggleFavorite
  };
};

export default useContentDetails;

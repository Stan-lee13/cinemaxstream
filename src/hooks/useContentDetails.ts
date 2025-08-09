
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
            
            if (includeSeasons && (tmdbContent.type === 'series' || tmdbContent.type === 'anime')) {
              try {
                const tvSeasons = await tmdbApi.getTvShowSeasons(contentId);
                if (tvSeasons && tvSeasons.length > 0) {
                  const first = tvSeasons[0];
                  const episodes = await tmdbApi.getTvShowEpisodes(contentId, first.season_number);
                  if (episodes && episodes.length > 0) {
                    tvSeasons[0] = { ...first, episodes };
                  }
                  setSeasons(tvSeasons);
                } else {
                  setSeasons([]);
                }
              } catch (e) {
                setSeasons([]);
              }
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
          
          if (includeSeasons && (contentData.content_type === 'series' || contentData.content_type === 'anime')) {
            try {
              const tvSeasons = await tmdbApi.getTvShowSeasons(contentId);
              if (tvSeasons && tvSeasons.length > 0) {
                const first = tvSeasons[0];
                const episodes = await tmdbApi.getTvShowEpisodes(contentId, first.season_number);
                if (episodes && episodes.length > 0) {
                  tvSeasons[0] = { ...first, episodes };
                }
                setSeasons(tvSeasons);
              } else {
                setSeasons([]);
              }
            } catch (e) {
              setSeasons([]);
            }
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

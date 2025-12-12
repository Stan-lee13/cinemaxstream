
import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '@/services/tmdbApi';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTrailerUrl } from "@/utils/videoUtils";
import { getDefaultRuntime } from "@/utils/contentUtils";
import { Season, Episode, ContentItem } from "@/types/content";

// Minimal DB row type for 'content' table (matches supabase public.content)
interface DBContentRow {
  id: string;
  title: string;
  description: string | null;
  image_url?: string | null;
  image?: string | null;
  category_id?: string | null;
  content_type?: string | null;
  year?: string | null;
  duration?: string | null;
  rating?: string | null;
  featured?: boolean | null;
  trending?: boolean | null;
  popular?: boolean | null;
  trailer_key?: string | null;
  is_premium?: boolean | null;
  content_categories?: { id: string; name: string; slug?: string; description?: string | null } | null;
}

interface FavoriteRow {
  id?: string;
  user_id: string;
  content_id: string;
  created_at?: string;
}

interface UseContentDetailsOptions {
  contentId: string | undefined;
  includeRelated?: boolean;
  includeSeasons?: boolean;
}

interface UseContentDetailsReturn {
  content: ContentItem | DBContentRow | null;
  relatedContent: ContentItem[];
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
  const [content, setContent] = useState<ContentItem | DBContentRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
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
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*, content_categories(*)')
          .eq('id', contentId)
          .single() as { data: DBContentRow | null; error: unknown };
        
        if (contentError) {
          // If not in our database, fetch from TMDB
          const tmdbContent = await tmdbApi.getContentDetails(contentId);
          
          if (tmdbContent) {
            const formattedContent: ContentItem = {
              id: tmdbContent.id,
              title: tmdbContent.title,
              description: tmdbContent.description || '',
              image: tmdbContent.image,
              poster: tmdbContent.poster || undefined,
              backdrop: tmdbContent.backdrop || undefined,
              category: tmdbContent.category || 'General',
              type: tmdbContent.type || 'movie',
              year: tmdbContent.year || '',
              duration: tmdbContent.duration || getDefaultRuntime(tmdbContent.type || 'movie'),
              rating: tmdbContent.rating || '',
              trailer_key: tmdbContent.trailer_key || undefined,
              // description already set above
            };
            
            setContent(formattedContent);
            
            // Fetch related content if needed
            if (includeRelated) {
              const similar = await tmdbApi.getSimilarContent(contentId, tmdbContent.type || 'movie');
              setRelatedContent(similar || []);
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
            if (contentData) {
              setContent(contentData as DBContentRow);

              // Get trailer URL (helper accepts string | undefined)
              try {
                const trailer = await getTrailerUrl(contentId, (contentData.content_type ?? undefined) as string | undefined);
                setTrailerUrl(trailer);
              } catch (e) {
                console.error('Error fetching trailer:', e);
              }
            } else {
              setContent(null);
            }
          
          // Fetch related content if needed
          if (includeRelated) {
            if (contentData && contentData.category_id) {
              const { data: relatedData } = await supabase
                .from('content')
                .select('*')
                .eq('category_id', contentData.category_id)
                .neq('id', contentId)
                .limit(10) as { data: DBContentRow[] | null };

              setRelatedContent((relatedData || []).map(r => ({
                id: r.id,
                title: r.title,
                description: r.description || '',
                image: r.image || r.image_url || '',
                category: r.content_categories?.name || '',
                type: (r.content_type as string) || 'movie',
                year: r.year || '',
                duration: r.duration || '',
                rating: r.rating || '',
                trailer_key: r.trailer_key || undefined
              })));
            } else {
              // Fallback to TMDB for related content
              const fallbackType = contentData?.content_type ?? 'movie';
              const similar = await tmdbApi.getSimilarContent(contentId, fallbackType);
              setRelatedContent(similar || []);
            }
          }
          
          if (includeSeasons && contentData && (contentData.content_type === 'series' || contentData.content_type === 'anime')) {
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
          const { data: favoriteData } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', session.session.user.id)
            .eq('content_id', contentId)
            .single() as { data: FavoriteRow | null };
          
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
  const toggleFavorite = useCallback(async () => {
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
        await supabase
          .from('user_favorites')
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

        await supabase
          .from('user_favorites')
          .insert(favoriteData) as { data: FavoriteRow[] | null };

        toast.success("Added to favorites");
      }
      
      setLiked(prev => !prev);
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Error updating favorites");
    }
  }, [contentId, liked]);
  
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

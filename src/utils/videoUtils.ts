
/**
 * Utility functions for video streaming and downloads
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Map of content types to streaming endpoints
const STREAMING_ENDPOINTS = {
  movie: "https://api.themoviedb.org/3/movie",
  series: "https://api.themoviedb.org/3/tv",
  anime: "https://api.themoviedb.org/3/anime",
  sports: "https://api.themoviedb.org/3/sports"
};

// TMDB API Key
const TMDB_API_KEY = "4626200399b08f9d04b72348e3625f15";

// Map of quality options to download sizes (approximate)
export const QUALITY_OPTIONS = {
  '1080p': {
    label: 'Full HD (1080p)',
    size: '2.1 GB',
    quality: '1080p'
  },
  '720p': {
    label: 'HD (720p)',
    size: '1.3 GB',
    quality: '720p'
  },
  '480p': {
    label: 'SD (480p)',
    size: '720 MB',
    quality: '480p'
  }
};

// For demo purposes, we'll use sample videos
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
];

/**
 * Get streaming URL for content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param episodeId - Optional episode ID for series content
 */
export const getStreamingUrl = (contentId: string, contentType: string, episodeId?: string): string => {
  // For demo purposes, return a sample video URL
  const hash = hashCode(contentId + (episodeId || ""));
  const index = Math.abs(hash) % SAMPLE_VIDEOS.length;
  return SAMPLE_VIDEOS[index];
};

/**
 * Get download URL for content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param quality - The quality of the video (1080p, 720p, 480p)
 * @param episodeId - Optional episode ID for series content
 */
export const getDownloadUrl = (contentId: string, contentType: string, quality: string, episodeId?: string): string => {
  // For demo purposes, return the same streaming URL
  return getStreamingUrl(contentId, contentType, episodeId);
};

/**
 * Simple hash function to generate a number from a string
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Track streaming activity
 * @param contentId - The ID of the content
 * @param userId - The ID of the user
 * @param position - Current playback position in seconds
 * @param episodeId - Optional episode ID for series content
 */
export const trackStreamingActivity = async (
  contentId: string, 
  userId: string, 
  position: number,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    // Update or insert watch history
    const watchHistoryData = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      watch_position: position,
      last_watched: new Date().toISOString(),
      completed: false
    };
    
    const { error } = await supabase
      .from('user_watch_history')
      .upsert(watchHistoryData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (error) {
    console.error('Error tracking streaming activity:', error);
  }
};

/**
 * Mark content as complete
 * @param contentId - The ID of the content
 * @param userId - The ID of the user
 * @param episodeId - Optional episode ID for series content
 */
export const markContentAsComplete = async (
  contentId: string, 
  userId: string,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    // Using a more type-safe approach with explicitly defined object
    const completedData = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      completed: true,
      last_watched: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('user_watch_history')
      .upsert(completedData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
    if (error) {
      console.error('Error marking content as complete:', error);
    }
  } catch (error) {
    console.error('Error marking content as complete:', error);
  }
};

/**
 * Get anime content from TMDB API
 * @returns Promise with anime content
 */
export const getAnimeContent = async () => {
  try {
    // Use animation genre ID (16) to get anime-like content
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch anime content');
    }
    
    const data = await response.json();
    
    // Transform the data to match our app's format
    return data.results.map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      description: item.overview,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      year: new Date(item.first_air_date).getFullYear().toString(),
      rating: (item.vote_average / 2).toFixed(1),
      category: 'anime',
      type: 'anime'
    }));
  } catch (error) {
    console.error('Error fetching anime content:', error);
    toast.error('Failed to load anime content');
    return [];
  }
};

/**
 * Get personalized recommendations based on user watch history
 * @param userId - The ID of the user
 * @returns Promise with recommended content
 */
export const getPersonalizedRecommendations = async (userId: string) => {
  if (!userId) return [];
  
  try {
    // Get user's watch history
    const { data: watchHistory, error: historyError } = await supabase
      .from('user_watch_history')
      .select('content_id')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(5);
    
    if (historyError) {
      throw historyError;
    }
    
    // If no watch history, return empty array
    if (!watchHistory?.length) {
      return [];
    }
    
    // Get recommendations for the most recently watched content
    const contentId = watchHistory[0].content_id;
    
    // For demo purposes, we'll just fetch similar content from TMDB
    // In a real app, you'd want to use a more sophisticated recommendation algorithm
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${contentId}/similar?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    const data = await response.json();
    
    // Transform the data to match our app's format
    return data.results.map((item: any) => ({
      id: item.id.toString(),
      title: item.title || item.name,
      description: item.overview,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      year: new Date(item.release_date || item.first_air_date).getFullYear().toString(),
      rating: (item.vote_average / 2).toFixed(1),
      category: 'recommendation',
      type: item.title ? 'movie' : 'series'
    }));
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};

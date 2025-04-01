
/**
 * Utility functions for video streaming and downloads
 */

// Map of content types to streaming endpoints
const STREAMING_ENDPOINTS = {
  movie: "https://vidrsc.in/api/movies",
  series: "https://vidrsc.in/api/series",
  anime: "https://vidrsc.xyz/api/anime",
  sports: "https://vidrsc.xyz/api/sports"
};

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

/**
 * Get streaming URL for content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param episodeId - Optional episode ID for series content
 */
export const getStreamingUrl = (contentId: string, contentType: string, episodeId?: string): string => {
  const baseUrl = STREAMING_ENDPOINTS[contentType as keyof typeof STREAMING_ENDPOINTS] || STREAMING_ENDPOINTS.movie;
  
  if (contentType === 'series' && episodeId) {
    return `${baseUrl}/${contentId}/episodes/${episodeId}/stream`;
  }
  
  return `${baseUrl}/${contentId}/stream`;
};

/**
 * Get download URL for content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param quality - The quality of the video (1080p, 720p, 480p)
 * @param episodeId - Optional episode ID for series content
 */
export const getDownloadUrl = (contentId: string, contentType: string, quality: string, episodeId?: string): string => {
  const baseUrl = STREAMING_ENDPOINTS[contentType as keyof typeof STREAMING_ENDPOINTS] || STREAMING_ENDPOINTS.movie;
  
  if (contentType === 'series' && episodeId) {
    return `${baseUrl}/${contentId}/episodes/${episodeId}/download?quality=${quality}`;
  }
  
  return `${baseUrl}/${contentId}/download?quality=${quality}`;
};

/**
 * Track streaming activity
 * @param contentId - The ID of the content
 * @param userId - The ID of the user
 * @param position - Current playback position in seconds
 * @param episodeId - Optional episode ID for series content
 */
export const trackStreamingActivity = async (
  contentId: string, 
  userId: string | undefined, 
  position: number,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Update or insert watch history
    // Using a more type-safe approach with explicitly defined object
    const watchHistoryData: {
      user_id: string;
      content_id: string;
      episode_id: string | null;
      watch_position: number;
      last_watched: string;
      completed: boolean;
    } = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      watch_position: position,
      last_watched: new Date().toISOString(),
      completed: false
    };
    
    // Use type assertion for the Supabase query
    await (supabase
      .from('user_watch_history') as any)
      .upsert(watchHistoryData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
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
  userId: string | undefined,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Using a more type-safe approach with explicitly defined object
    const completedData: {
      user_id: string;
      content_id: string;
      episode_id: string | null;
      completed: boolean;
      last_watched: string;
    } = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      completed: true,
      last_watched: new Date().toISOString()
    };
    
    // Use type assertion for the Supabase query
    await (supabase
      .from('user_watch_history') as any)
      .upsert(completedData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
  } catch (error) {
    console.error('Error marking content as complete:', error);
  }
};


/**
 * Trailer provider utilities
 * Uses TMDb API to fetch official trailers from YouTube
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "4626200399b08f9d04b72348e3625f15";

/**
 * Get trailer URL from TMDb API
 * @param contentId - The TMDb ID of the content
 * @param contentType - Either 'movie' or 'tv'
 * @returns YouTube video ID (not the full URL)
 */
export const getTrailerUrlImpl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  try {
    // Determine the correct endpoint based on content type
    const endpoint = contentType === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_BASE_URL}/${endpoint}/${contentId}/videos?api_key=${TMDB_API_KEY}`;
    
    console.log(`Fetching trailer for ${contentType} ID: ${contentId}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`TMDb API request failed with status: ${response.status}`);
      throw new Error(`TMDb API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn(`No trailers found for ${contentType} ID: ${contentId}`);
      // Return fallback trailer
      return 'dQw4w9WgXcQ';
    }
    
    // Look for official trailers from YouTube
    const youtubeTrailers = data.results.filter((video: any) => 
      video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
    
    if (youtubeTrailers.length > 0) {
      // Prefer official trailers over teasers
      const officialTrailer = youtubeTrailers.find((video: any) => video.type === 'Trailer');
      const selectedTrailer = officialTrailer || youtubeTrailers[0];
      
      console.log(`Found trailer: ${selectedTrailer.name} (${selectedTrailer.key})`);
      return selectedTrailer.key;
    }
    
    // If no YouTube trailers, look for any YouTube videos
    const youtubeVideos = data.results.filter((video: any) => video.site === 'YouTube');
    
    if (youtubeVideos.length > 0) {
      console.log(`Found YouTube video: ${youtubeVideos[0].name} (${youtubeVideos[0].key})`);
      return youtubeVideos[0].key;
    }
    
    // If no videos found, use fallback
    console.warn(`No YouTube videos found for ${contentType} ID: ${contentId}, using fallback`);
    return 'dQw4w9WgXcQ';
    
  } catch (error) {
    console.error("Error fetching trailer from TMDb:", error);
    
    // Try with alternative content type if the first attempt fails
    if (contentType === 'movie') {
      console.log("Retrying with 'tv' endpoint...");
      try {
        return await getTrailerUrlImpl(contentId, 'tv');
      } catch (retryError) {
        console.error("Retry with 'tv' also failed:", retryError);
      }
    } else if (contentType === 'tv' || contentType === 'series') {
      console.log("Retrying with 'movie' endpoint...");
      try {
        return await getTrailerUrlImpl(contentId, 'movie');
      } catch (retryError) {
        console.error("Retry with 'movie' also failed:", retryError);
      }
    }
    
    // Final fallback
    return 'dQw4w9WgXcQ';
  }
};

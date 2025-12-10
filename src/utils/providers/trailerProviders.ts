
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
type VideoResult = {
  id?: string;
  key?: string;
  site?: string;
  type?: string;
};

export const getTrailerUrlImpl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  try {
    // Determine the correct endpoint based on content type
    // Normalize content types: anime/series -> tv, movie -> movie
    const endpoint = (contentType === 'movie' || contentType === 'documentary') ? 'movie' : 'tv';
    const url = `${TMDB_BASE_URL}/${endpoint}/${encodeURIComponent(contentId)}/videos?api_key=${TMDB_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Don't return empty string immediately, just throw to try alternative
      throw new Error(`TMDb API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      // No trailers found
      return '';
    }
    
    // Look for official trailers from YouTube
    const results: VideoResult[] = Array.isArray(data.results) ? data.results : [];

    const youtubeTrailers = results.filter((video) =>
      video.site === 'YouTube' &&
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
    
    if (youtubeTrailers.length > 0) {
      // Prefer official trailers over teasers
      const officialTrailer = youtubeTrailers.find((video) => video.type === 'Trailer');
      const selectedTrailer = officialTrailer || youtubeTrailers[0];

      return selectedTrailer?.key || '';
    }
    
    // If no YouTube trailers, look for any YouTube videos
    const youtubeVideos = results.filter((video) => video.site === 'YouTube');

    if (youtubeVideos.length > 0) {
      return youtubeVideos[0].key || '';
    }
    
    // If no videos found, return empty string
    return '';
    
  } catch (error) {
    // No trailer available
    return '';
  }
};


/**
 * Utility functions for handling URLs and image paths
 */

/**
 * Get image URL with proper fallback
 */
export const getImageUrl = (path: string | null | undefined, type: 'poster' | 'backdrop' = 'poster'): string => {
  if (!path) {
    return type === 'poster' 
      ? 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=500&h=750&fit=crop&crop=face' 
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=675&fit=crop&crop=center';
  }
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // TMDB image path format
  if (path.startsWith('/')) {
    const size = type === 'poster' ? 'w500' : 'original';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
  
  // Default fallback
  return path;
};

/**
 * Normalize content type
 */
export const normalizeContentType = (type: string): string => {
  type = type.toLowerCase();
  
  if (type === 'movie' || type === 'film') {
    return 'movie';
  } 
  else if (type === 'tv' || type === 'show' || type === 'series') {
    return 'series';
  }
  else if (type === 'anime') {
    return 'anime';
  }
  
  return type;
};

/**
 * Get streaming provider icon
 */
export const getProviderIcon = (providerId: string): string => {
  switch (providerId) {
    case 'netflix':
      return '/icons/netflix.png';
    case 'prime_video':
      return '/icons/prime.png';
    case 'disney_plus':
      return '/icons/disney.png';
    case 'hbo_max':
      return '/icons/hbo.png';
    case 'hulu':
      return '/icons/hulu.png';
    case 'aniwatch':
      return '/icons/aniwatch.png';
    case 'fmovies':
      return '/icons/fmovies.png';
    default:
      return '/icons/play.png';
  }
};

/**
 * Format watch time from seconds to MM:SS
 */
export const formatWatchTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * Format minutes to hours and minutes (1h 30m)
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return 'Unknown';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

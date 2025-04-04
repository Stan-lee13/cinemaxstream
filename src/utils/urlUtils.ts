
/**
 * Utility functions for handling URLs and content IDs
 */

// Extract content ID from URL
export const extractContentIdFromUrl = (url: string): string | null => {
  // Tries to extract content ID from various URL formats
  const patterns = [
    /\/content\/([^/]+)/, // /content/12345
    /movie\/([^/]+)/,     // /movie/12345
    /series\/([^/]+)/,    // /series/12345
    /\?id=([^&]+)/        // ?id=12345
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Generate consistent content URL
export const generateContentUrl = (id: string): string => {
  return `/content/${id}`;
};

// Get correct image URL with fallback
export const getImageUrl = (path: string | undefined | null, size: 'poster' | 'backdrop' = 'poster'): string => {
  if (!path) {
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // Get appropriate TMDB image size
  const baseUrl = 'https://image.tmdb.org/t/p/';
  const imageSize = size === 'poster' ? 'w500' : 'original';
  
  // Handle paths that already include the base URL
  if (path.includes('tmdb') && path.includes('/t/p/')) {
    return path;
  }
  
  // Handle paths that start with slash
  if (path.startsWith('/')) {
    return `${baseUrl}${imageSize}${path}`;
  }
  
  // Handle other paths
  return `${baseUrl}${imageSize}/${path}`;
};

// Ensure consistent content type naming
export const normalizeContentType = (type: string | undefined): string => {
  if (!type) return 'movie';
  
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('tv') || typeLower.includes('series') || typeLower === 'show') {
    return 'series';
  } else if (typeLower.includes('anime')) {
    return 'anime';
  } else {
    return 'movie';
  }
};

// Format duration in minutes to human readable format
export const formatDuration = (minutes: number | string | undefined): string => {
  if (!minutes) return 'N/A';
  
  const mins = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  
  if (isNaN(mins)) return 'N/A';
  
  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  }
  
  return `${mins}m`;
};

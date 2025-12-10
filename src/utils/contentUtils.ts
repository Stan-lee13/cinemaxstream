/**
 * Content utility functions
 */

import type { ContentItem } from '@/types/content';

// Production streaming providers - only the three verified providers
export const streamingProviders = [
  { id: 'vidsrc_su', name: 'VidSrc SU', contentType: 'all' },
  { id: 'vidsrc_xyz', name: 'VidSrc XYZ', contentType: 'all' },
  { id: 'vidsrc_vip', name: 'VidSrc VIP', contentType: 'all' }
];

// Download providers - empty as per requirement (streaming only)
export const downloadProviders: { id: string; name: string; contentType: string }[] = [];

// Premium content configuration
const premiumContentConfig = {
  // High-demand recent releases
  premiumIds: ['1124620', '634649', '505642', '843794', '872585'],
  
  // Content released in the last 6 months
  recentReleaseThreshold: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months in milliseconds
  
  // High-rated content (8.0+ on TMDB)
  highRatingThreshold: 8.0
};

/**
 * Check if content is premium based on multiple criteria
 */
export const isPremiumContent = (contentId: string, releaseDate?: string, rating?: number): boolean => {
  // Check if it's in the premium list
  if (premiumContentConfig.premiumIds.includes(contentId)) {
    return true;
  }
  
  // Check if it's a recent high-demand release
  if (releaseDate) {
    const releaseTime = new Date(releaseDate).getTime();
    const now = Date.now();
    
    if (now - releaseTime < premiumContentConfig.recentReleaseThreshold) {
      return true;
    }
  }
  
  // Check if it's high-rated content
  if (rating && rating >= premiumContentConfig.highRatingThreshold) {
    return true;
  }
  
  return false;
};

/**
 * Get available streaming providers for content
 */
export const getAvailableProviders = (contentId: string, contentType: string = 'movie') => {
  // All providers support all content types in our configuration
  return streamingProviders.filter(provider => 
    provider.contentType === 'all' || provider.contentType === contentType
  );
};

/**
 * Get best provider based on content type and availability
 */
export const getBestProviderForContentType = (contentType: string): string => {
  // Prioritize providers based on content type
  switch (contentType) {
    case 'anime':
      return 'vidsrc_xyz'; // Often better for anime
    case 'series':
      return 'vidsrc_su'; // Excellent TV show support
    case 'movie':
    default:
      return 'vidsrc_su'; // Default for movies
  }
};

/**
 * Get appropriate runtime for content type
 */
export const getDefaultRuntime = (contentType: string): string => {
  const runtimes: Record<string, string> = {
    'movie': '120 min',
    'series': '45 min',
    'anime': '24 min',
    'documentary': '90 min',
    'sport': '180 min',
    'short': '15 min'
  };
  
  return runtimes[contentType] || '60 min';
};

/**
 * Get runtime for specific content based on type and category
 */
export const getContentRuntime = (contentType: string, category?: string): string => {
  // First check specific categories
  if (category?.toLowerCase().includes('anime')) {
    return '24 min';
  }
  
  if (category?.toLowerCase().includes('documentary')) {
    return '90 min';
  }
  
  if (category?.toLowerCase().includes('sport')) {
    return '180 min';
  }
  
  // Then check content type
  return getDefaultRuntime(contentType);
};

/**
 * Get personalized recommendations based on user preferences
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<ContentItem[]> => {
  try {
    // This would integrate with AI recommendation system
    // For now, return empty array - will be populated by AI utils
    return [];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

/**
 * Get content quality based on provider and content type
 */
export const getContentQuality = (providerId: string, contentType: string): string[] => {
  const qualityMap: Record<string, string[]> = {
    'vidsrc_su': ['1080p', '720p', '480p'],
    'vidsrc_xyz': ['1080p', '720p', '480p'],
    'vidsrc_vip': ['1080p', '720p', '480p']
  };
  
  return qualityMap[providerId] || ['720p', '480p'];
};

/**
 * Check if provider supports download for content type
 */
export const providerSupportsDownload = (providerId: string, contentType: string): boolean => {
  // Currently, no providers support direct download
  // Downloads are handled through the smart download system
  return false;
};

/**
 * Get estimated file size for content
 */
export const getEstimatedFileSize = (contentType: string, quality: string, duration?: string): string => {
  const durationMinutes = duration ? parseInt(duration.replace(/[^\d]/g, '')) : 
    contentType === 'movie' ? 120 : 45;
  
  const sizePerMinute: Record<string, number> = {
    '1080p': 25, // MB per minute
    '720p': 15,
    '480p': 10,
    '360p': 6
  };
  
  const totalMB = (sizePerMinute[quality] || 15) * durationMinutes;
  
  if (totalMB > 1024) {
    return `${(totalMB / 1024).toFixed(1)} GB`;
  }
  
  return `${totalMB} MB`;
};

/**
 * Content utility functions
 * Uses obfuscated source system - sources displayed as Source 1-5 only
 */

import type { ContentItem } from '@/types/content';

// Production streaming sources - displayed as "Source 1-5" to users
// Internal mapping is handled in providerUtils.ts
export const streamingProviders = [
  { id: 'source_1', name: 'Source 1', contentType: 'all', isDefault: true },
  { id: 'source_2', name: 'Source 2', contentType: 'all' },
  { id: 'source_3', name: 'Source 3', contentType: 'all' },
  { id: 'source_4', name: 'Source 4', contentType: 'all' },
  { id: 'source_5', name: 'Source 5', contentType: 'all' }
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
 * Get available streaming sources for content
 */
export const getAvailableProviders = (contentId: string, contentType: string = 'movie') => {
  // All sources support all content types
  return streamingProviders.filter(provider => 
    provider.contentType === 'all' || provider.contentType === contentType
  );
};

/**
 * Get best source based on content type
 */
export const getBestProviderForContentType = (contentType: string): string => {
  // Default to Source 1
  return 'source_1';
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
    return [];
  }
};

/**
 * Get content quality based on source and content type
 */
export const getContentQuality = (sourceId: string, contentType: string): string[] => {
  // All sources support the same quality options
  return ['1080p', '720p', '480p'];
};

/**
 * Check if source supports download for content type
 */
export const providerSupportsDownload = (sourceId: string, contentType: string): boolean => {
  // Currently, no sources support direct download
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

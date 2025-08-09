/**
 * Content utility functions
 */

// Mock data for streaming services - only keeping the three requested providers
export const streamingProviders = [
  { id: 'vidsrc_su', name: 'VidSrc SU', contentType: 'all' },
  { id: 'vidsrc_xyz', name: 'VidSrc XYZ', contentType: 'all' },
  { id: 'vidsrc_vip', name: 'VidSrc VIP', contentType: 'all' }
];

// Download providers - keeping empty for now since user only wants streaming
export const downloadProviders: any[] = [];

// Mock premium content check
const premiumContentIds = ['1124620', '634649', '505642', '843794', '872585'];

/**
 * Check if content is premium
 */
export const isPremiumContent = (contentId: string): boolean => {
  return premiumContentIds.includes(contentId);
};

/**
 * Get available streaming providers for content
 */
export const getAvailableProviders = (contentId: string, contentType: string = 'movie') => {
  // Filter providers based on content type
  return streamingProviders.filter(provider => 
    provider.contentType === 'all' || provider.contentType === contentType
  );
};

/**
 * Get best provider based on content type
 */
export const getBestProviderForContentType = (contentType: string): string => {
  // Default to vidsrc.su for all content types
  return 'vidsrc_su';
};

/**
 * Get appropriate runtime for content type
 */
export const getDefaultRuntime = (contentType: string): string => {
  switch (contentType) {
    case 'movie':
      return '120 min';
    case 'series':
      return '45 min';
    case 'anime':
      return '24 min';
    case 'documentary':
      return '60 min';
    case 'sports':
      return '90 min';
    default:
      return '30 min';
  }
};

/**
 * Get runtime for specific content based on type and category
 */
export const getContentRuntime = (contentType: string, category?: string): string => {
  // First check specific categories
  if (category?.toLowerCase().includes('anime')) {
    return '24 min';
  }
  
  // Then check content type
  switch (contentType) {
    case 'movie':
      return '120 min';
    case 'series':
      return '45 min';
    case 'anime':
      return '24 min';
    case 'documentary':
      return '60 min';
    case 'sports':
      return '90 min';
    default:
      return '30 min';
  }
};

/**
 * Get personalized recommendations based on watch history
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<any[]> => {
  // Placeholder for future ML-based recommendations integration
  return [];
};

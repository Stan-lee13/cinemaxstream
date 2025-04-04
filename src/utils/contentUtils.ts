
/**
 * Content utility functions
 */

// Mock data for streaming services
export const streamingProviders = [
  { id: 'netflix', name: 'Netflix', contentType: 'all' },
  { id: 'vidsrc_xyz', name: 'VidSrc', contentType: 'all' },
  { id: 'prime_video', name: 'Prime Video', contentType: 'all' },
  { id: 'disney_plus', name: 'Disney+', contentType: 'all' },
  { id: 'hbo_max', name: 'HBO Max', contentType: 'all' },
  { id: 'hulu', name: 'Hulu', contentType: 'series' },
  { id: 'aniwatch', name: 'AniWatch', contentType: 'anime' },
  { id: 'fmovies', name: 'FMovies', contentType: 'all' },
  { id: 'eztv', name: 'EZTV', contentType: 'series', isTorrent: true },
  { id: 'yts', name: 'YTS', contentType: 'movie', isTorrent: true }
];

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
  switch (contentType) {
    case 'series':
      return 'vidsrc_xyz';
    case 'anime':
      return 'aniwatch';
    default:
      return 'vidsrc_xyz';
  }
};

/**
 * Get personalized recommendations based on watch history
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<any[]> => {
  // This would typically call an API that uses the user's watch history
  console.log(`Getting recommendations for user ${userId}`);
  
  // Return empty array for now
  return [];
};


/**
 * Content utility functions
 */

// Mock data for streaming services
export const streamingProviders = [
  { id: 'vidsrc_xyz', name: 'VidSrc XYZ', contentType: 'all' },
  { id: 'vidsrc_pro', name: 'VidSrc Pro', contentType: 'all' },
  { id: 'vidsrc_wtf', name: 'VidSrc WTF', contentType: 'all' },
  { id: 'vidsrc_in', name: 'VidSrc.in', contentType: 'movie' },
  { id: 'vidsrc_pk', name: 'VidSrc.pk', contentType: 'all' },
  { id: 'vidsrc_co', name: 'VidSrc.co', contentType: 'all' },
  { id: 'embed_su', name: 'Embed.su', contentType: 'all' },
  { id: 'filemoon', name: 'FileMoon', contentType: 'all' },
  { id: 'streamtape', name: 'StreamTape', contentType: 'all' },
  { id: 'vidcloud', name: 'VidCloud', contentType: 'all' },
  { id: 'vidcloud_streaming', name: 'VidCloud.stream', contentType: 'all' },
  { id: 'filemoon_in', name: 'FileMoon.in', contentType: 'all' },
  { id: 'fzmovies_net', name: 'FZMovies.net', contentType: 'movie' },
  { id: 'brightcove', name: 'Brightcove', contentType: 'all' },
  { id: 'ooyala', name: 'Ooyala', contentType: 'all' },
  { id: 'wurl', name: 'Wurl', contentType: 'all' },
  { id: 'cinemull_cc', name: 'Cinemull', contentType: 'all' },
  { id: 'embedplay_me', name: 'EmbedPlay', contentType: 'all' },
  { id: 'netflix', name: 'Netflix', contentType: 'all' },
  { id: 'prime_video', name: 'Prime Video', contentType: 'all' },
  { id: 'disney_plus', name: 'Disney+', contentType: 'all' },
  { id: 'hbo_max', name: 'HBO Max', contentType: 'all' },
  { id: 'hulu', name: 'Hulu', contentType: 'series' },
  { id: 'aniwatch', name: 'AniWatch', contentType: 'anime' },
  { id: 'fmovies', name: 'FMovies', contentType: 'all' },
  { id: 'fmovies_net', name: 'FMovies.net', contentType: 'all' },
  { id: 'embed_rgshows', name: 'RGShows', contentType: 'all' },
  { id: 'godriveplayer', name: 'GDrivePlayer', contentType: 'all' },
  { id: 'sflix', name: 'SFlix', contentType: 'all' },
  { id: 'primewire_tf', name: 'PrimeWire', contentType: 'all' },
  { id: 'eztv', name: 'EZTV', contentType: 'series', isTorrent: true },
  { id: 'yts', name: 'YTS', contentType: 'movie', isTorrent: true }
];

// Download providers - separate from streaming
export const downloadProviders = [
  { id: 'filemoon', name: 'FileMoon', supportedQualities: ['4k', '1080p', '720p'] },
  { id: 'filemoon_in', name: 'FileMoon.in', supportedQualities: ['4k', '1080p', '720p'] },
  { id: 'streamtape', name: 'StreamTape', supportedQualities: ['1080p', '720p', '480p'] },
  { id: 'vidcloud', name: 'VidCloud', supportedQualities: ['1080p', '720p', '480p'] },
  { id: 'vidcloud_streaming', name: 'VidCloud.stream', supportedQualities: ['4k', '1080p', '720p', '480p'] }
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
    case 'movie':
      return 'vidsrc_in';
    case 'series':
      return 'vidsrc_xyz';
    case 'anime':
      return 'aniwatch';
    default:
      return 'vidsrc_xyz';
  }
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
  // This would typically call an API that uses the user's watch history
  console.log(`Getting recommendations for user ${userId}`);
  
  // Return empty array for now
  return [];
};

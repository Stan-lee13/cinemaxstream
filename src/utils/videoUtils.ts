/**
 * Re-export all utility functions from the split files
 * This maintains backward compatibility with existing imports
 */

export { hasPremiumAccess, isAdmin, generateSecurePassword } from './authUtils';
export { 
  isPremiumContent, 
  getAvailableProviders, 
  getBestProviderForContentType,
  getPersonalizedRecommendations,
  streamingProviders
} from './contentUtils';
export {
  QUALITY_OPTIONS,
  getStreamingUrlForSource as getStreamingUrl,
  getDownloadUrlImpl as getDownloadUrl,
  getTrailerUrlImpl as getTrailerUrl
} from './providers/providerUtils';
export { trackStreamingActivity, markContentAsComplete } from './trackingUtils';

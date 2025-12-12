
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
  getStreamingUrl,
  getDownloadUrl,
  getTrailerUrl,
  startRecording
} from './streamingUtils';
export { trackStreamingActivity, markContentAsComplete } from './trackingUtils';

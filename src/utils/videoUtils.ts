// Mock data for streaming services
const streamingProviders = [
  { id: 'netflix', name: 'Netflix', contentType: 'all' },
  { id: 'vidsrc_xyz', name: 'VidSrc', contentType: 'all' },
  { id: 'prime_video', name: 'Prime Video', contentType: 'all' },
  { id: 'disney_plus', name: 'Disney+', contentType: 'all' },
  { id: 'hbo_max', name: 'HBO Max', contentType: 'all' },
  { id: 'hulu', name: 'Hulu', contentType: 'series' }
];

// Mock premium content check
const premiumContentIds = ['1124620', '634649', '505642', '843794', '872585'];

// Quality options for downloads
export const QUALITY_OPTIONS = [
  { quality: '2160p', label: '4K Ultra HD', size: '~8-10 GB', premium: true },
  { quality: '1080p', label: 'Full HD', size: '~2-4 GB', premium: false },
  { quality: '720p', label: 'HD', size: '~800 MB-1.5 GB', premium: false },
  { quality: '480p', label: 'Standard Definition', size: '~400-700 MB', premium: false },
  { quality: '360p', label: 'Low Definition', size: '~250-350 MB', premium: false }
];

// Storage key for premium access
const PREMIUM_ACCESS_KEY = 'premium_access';
const VALID_PREMIUM_CODES = ['PREMIUM123', 'NETFLIX2025', 'CINEMAX2025'];

/**
 * Check if user has premium access
 */
export const hasPremiumAccess = (): boolean => {
  const premiumAccess = localStorage.getItem(PREMIUM_ACCESS_KEY);
  const guestAccess = localStorage.getItem('guest_access');
  return premiumAccess === 'true' || guestAccess === 'true';
};

/**
 * Validate and store premium code
 */
export const enterPremiumCode = (code: string): boolean => {
  if (VALID_PREMIUM_CODES.includes(code.toUpperCase())) {
    localStorage.setItem(PREMIUM_ACCESS_KEY, 'true');
    return true;
  }
  return false;
};

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
      return 'netflix';
    case 'anime':
      return 'hulu';
    default:
      return 'vidsrc_xyz';
  }
};

/**
 * Get streaming URL for content
 */
export const getStreamingUrl = (
  contentId: string,
  contentType: string = 'movie',
  provider: string = 'vidsrc_xyz',
  episodeId?: string,
  seasonNumber?: number,
  episodeNumber?: number
): string => {
  let baseUrl;
  
  switch (provider) {
    case 'vidsrc_xyz':
      baseUrl = `https://vidsrc.xyz/embed/`;
      break;
    case 'netflix':
      baseUrl = `https://example-netflix.com/watch/`;
      break;
    case 'prime_video':
      baseUrl = `https://example-primevideo.com/watch/`;
      break;
    case 'disney_plus':
      baseUrl = `https://example-disneyplus.com/watch/`;
      break;
    case 'hbo_max':
      baseUrl = `https://example-hbomax.com/watch/`;
      break;
    case 'hulu':
      baseUrl = `https://example-hulu.com/watch/`;
      break;
    default:
      baseUrl = `https://vidsrc.to/embed/`;
  }
  
  if (contentType === 'movie') {
    return `${baseUrl}movie/${contentId}`;
  } else {
    // For series or anime, include season and episode if available
    let url = `${baseUrl}${contentType}/${contentId}`;
    if (seasonNumber !== undefined && episodeNumber !== undefined) {
      url += `/season/${seasonNumber}/episode/${episodeNumber}`;
    }
    return url;
  }
};

/**
 * Get download URL for content
 */
export const getDownloadUrl = (
  contentId: string,
  quality: string = '720p',
  contentType: string = 'movie',
  episodeId?: string
): string => {
  const baseUrl = 'https://example-download.com/download/';
  if (contentType === 'movie') {
    return `${baseUrl}${contentType}/${contentId}/${quality}`;
  } else {
    return `${baseUrl}${contentType}/${contentId}/${episodeId || 'latest'}/${quality}`;
  }
};

/**
 * Track streaming activity
 */
export const trackStreamingActivity = (
  contentId: string,
  userId: string,
  currentTime: number,
  episodeId?: string
): void => {
  // In a real implementation, this would send data to a backend
  console.log(`Tracking activity: Content ID ${contentId}, User ID ${userId}, Time ${currentTime}, Episode ID ${episodeId || 'N/A'}`);
  
  // Store locally for history
  try {
    const historyKey = 'watch_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Find if this content already exists in history
    const existingIndex = history.findIndex((item: any) => 
      item.contentId === contentId && item.episodeId === episodeId
    );
    
    const timestamp = new Date().toISOString();
    
    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex].currentTime = currentTime;
      history[existingIndex].lastWatched = timestamp;
    } else {
      // Add new entry
      history.unshift({
        contentId,
        episodeId,
        currentTime,
        lastWatched: timestamp,
        userId
      });
    }
    
    // Keep only last 50 items
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving watch history:', error);
  }
};

/**
 * Mark content as complete
 */
export const markContentAsComplete = (
  contentId: string,
  userId: string,
  episodeId?: string
): void => {
  // In a real implementation, this would send data to a backend
  console.log(`Marking complete: Content ID ${contentId}, User ID ${userId}, Episode ID ${episodeId || 'N/A'}`);
  
  // Store completion status locally
  try {
    const completedKey = 'completed_content';
    const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
    
    const existingItem = completed.find((item: any) => 
      item.contentId === contentId && item.episodeId === episodeId
    );
    
    if (!existingItem) {
      completed.push({
        contentId,
        episodeId,
        userId,
        completedAt: new Date().toISOString()
      });
      
      localStorage.setItem(completedKey, JSON.stringify(completed));
    }
  } catch (error) {
    console.error('Error saving completion status:', error);
  }
};

/**
 * Get trailer URL
 */
export const getTrailerUrl = async (contentId: string, contentType: string = 'movie'): Promise<string | null> => {
  // This would typically fetch from an API
  // For now, return YouTube embed URLs based on content ID
  return `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`;
};

/**
 * Start screen recording
 */
export const startRecording = (
  videoElement: HTMLVideoElement,
  filename: string
): (() => void) => {
  // This is just a mock implementation
  // In a real app, you would use MediaRecorder API
  console.log('Screen recording started', videoElement, filename);
  
  // Return a function to stop recording
  return () => {
    console.log('Screen recording stopped');
    // Import toast from the component that needs it rather than importing here
  };
};

/**
 * Get personalized recommendations based on watch history
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<any[]> => {
  // This would typically call an API that uses the user's watch history
  // For now, return mock data
  console.log(`Getting recommendations for user ${userId}`);
  
  // Return empty array for now
  return [];
};

/**
 * Generate a secure password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  // Ensure at least one character of each type
  password += charset[Math.floor(Math.random() * 26)]; // lowercase
  password += charset[Math.floor(Math.random() * 26) + 26]; // uppercase
  password += charset[Math.floor(Math.random() * 10) + 52]; // number
  password += charset[Math.floor(Math.random() * (charset.length - 62)) + 62]; // special
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

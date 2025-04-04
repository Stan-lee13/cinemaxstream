
// Mock data for videos
const VIDEO_SOURCES = {
  movies: {
    "movie-1": "https://example.com/movie1.mp4",
    "movie-2": "https://example.com/movie2.mp4",
    "movie-3": "https://example.com/movie3.mp4"
  },
  series: {
    "series-1": {
      s1e1: "https://example.com/series1-s1e1.mp4",
      s1e2: "https://example.com/series1-s1e2.mp4"
    },
    "series-2": {
      s1e1: "https://example.com/series2-s1e1.mp4",
      s1e2: "https://example.com/series2-s1e2.mp4"
    }
  }
};

// List of streaming providers
const STREAMING_PROVIDERS = [
  { id: "vidsrc_xyz", name: "VidSrc", quality: "HD" },
  { id: "streamer_pro", name: "StreamerPro", quality: "Full HD" },
  { id: "media_nest", name: "MediaNest", quality: "4K", isPremium: true },
  { id: "cine_hub", name: "CineHub", quality: "HD" }
];

// Quality options for downloads
export const QUALITY_OPTIONS = [
  { quality: "480p", label: "SD (480p)", size: "400MB" },
  { quality: "720p", label: "HD (720p)", size: "800MB" },
  { quality: "1080p", label: "Full HD (1080p)", size: "1.5GB", premium: true },
  { quality: "4k", label: "4K Ultra HD", size: "4GB", premium: true }
];

// Check if user has premium access
export const hasPremiumAccess = (): boolean => {
  // In a real app, this would check user subscription status
  const hasPremium = localStorage.getItem('guest_access') === 'true' || 
                     localStorage.getItem('premium_access') === 'true';
  return hasPremium;
};

// Generate a mock trailer URL based on content ID
export const getTrailerUrl = (contentId: string, contentType: string = 'movie'): string => {
  return `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1`;
};

// Generate download URLs based on content ID and quality
export const getDownloadUrl = (contentId: string, quality: string): string => {
  return `https://example.com/download/${contentId}_${quality}.mp4`;
};

// Enter a premium code to get premium access
export const enterPremiumCode = (code: string): boolean => {
  if (code === "PREMIUM123" || code === "NETFLIX2025" || code === "CINEMAX2025") {
    localStorage.setItem('premium_access', 'true');
    return true;
  }
  return false;
};

// Get personalized recommendations based on user viewing history
export const getPersonalizedRecommendations = (category?: string) => {
  // In a real app, this would use an algorithm to suggest content
  return [
    { id: "1", title: "Inception", posterPath: "/placeholder.svg", type: "movie" },
    { id: "2", title: "Stranger Things", posterPath: "/placeholder.svg", type: "series" },
    { id: "3", title: "The Matrix", posterPath: "/placeholder.svg", type: "movie" },
    { id: "4", title: "Breaking Bad", posterPath: "/placeholder.svg", type: "series" },
  ];
};

// Get video source URL
export const getVideoSource = (contentId: string, episodeId?: string): string => {
  if (contentId.startsWith('movie-')) {
    // Check if the content exists in the movies object
    if (VIDEO_SOURCES.movies && VIDEO_SOURCES.movies[contentId as keyof typeof VIDEO_SOURCES.movies]) {
      return VIDEO_SOURCES.movies[contentId as keyof typeof VIDEO_SOURCES.movies];
    }
  } else if (contentId.startsWith('series-') && episodeId) {
    // Check if the content exists in the series object
    if (VIDEO_SOURCES.series && VIDEO_SOURCES.series[contentId as keyof typeof VIDEO_SOURCES.series]) {
      const series = VIDEO_SOURCES.series[contentId as keyof typeof VIDEO_SOURCES.series];
      if (series && episodeId in series) {
        return series[episodeId as keyof typeof series];
      }
    }
  }
  
  // Return a default video if the content is not found
  return "https://example.com/default.mp4";
};

// Generate a secure random password for reset
export const generateSecurePassword = (length: number = 12): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
  let password = "";
  
  // Ensure we have at least one of each type of character
  password += charset.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // lowercase
  password += charset.substring(26, 52).charAt(Math.floor(Math.random() * 26)); // uppercase
  password += charset.substring(52, 62).charAt(Math.floor(Math.random() * 10)); // digit
  password += charset.substring(62).charAt(Math.floor(Math.random() * (charset.length - 62))); // special
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Track user streaming activity
export const trackStreamingActivity = (
  contentId: string, 
  userId: string, 
  timePosition: number,
  episodeId?: string
): void => {
  console.log(`Tracking: User ${userId} watched ${contentId} at position ${timePosition}s${episodeId ? `, episode ${episodeId}` : ''}`);
  
  // In a real app, this would send data to analytics or a database
  const historyItem = {
    contentId,
    userId,
    timePosition,
    episodeId,
    timestamp: new Date().toISOString()
  };
  
  // Store in localStorage for demo purposes
  const history = JSON.parse(localStorage.getItem('watch_history') || '[]');
  history.push(historyItem);
  localStorage.setItem('watch_history', JSON.stringify(history));
};

// Mark content as completed
export const markContentAsComplete = (
  contentId: string, 
  userId: string,
  episodeId?: string
): void => {
  console.log(`Marking as complete: User ${userId} finished ${contentId}${episodeId ? `, episode ${episodeId}` : ''}`);
  
  // In a real app, this would update the user's profile in a database
  const completedItems = JSON.parse(localStorage.getItem('completed_content') || '[]');
  completedItems.push({
    contentId,
    userId,
    episodeId,
    completedAt: new Date().toISOString()
  });
  localStorage.setItem('completed_content', JSON.stringify(completedItems));
};

// Start screen recording
export const startRecording = (
  videoElement: HTMLVideoElement, 
  fileName: string = 'screen-recording'
): (() => void) => {
  console.log('Starting screen recording');
  
  // This is a mock implementation
  // In a real app, this would use MediaRecorder API
  const stopRecordingFn = () => {
    console.log('Recording stopped');
    toast('Recording saved as ' + fileName + '.mp4');
  };
  
  // Mock toast function
  const toast = (message: string) => {
    console.log('TOAST:', message);
    // In a real app, this would show a toast notification
  };
  
  return stopRecordingFn;
};

// Get available streaming providers for content
export const getAvailableProviders = (
  contentId: string, 
  contentType: string
): Array<{ id: string; name: string; quality: string; isPremium?: boolean }> => {
  // In a real app, this would check which providers have this content
  return STREAMING_PROVIDERS;
};

// Get the best streaming provider for content type
export const getBestProviderForContentType = (
  contentType: string
): string => {
  // In a real app, this would determine the best provider based on content type
  if (contentType === 'movie') {
    return 'vidsrc_xyz';
  } else if (contentType === 'series') {
    return 'streamer_pro';
  } else if (contentType === 'anime') {
    return 'media_nest';
  }
  
  return 'vidsrc_xyz'; // default
};

// Get streaming URL for content
export const getStreamingUrl = (
  contentId: string,
  contentType: string,
  provider: string,
  episodeId?: string,
  seasonNumber?: number,
  episodeNumber?: number
): string => {
  // In a real app, this would generate a proper streaming URL
  let baseUrl = 'https://example.com/stream/';
  
  if (provider === 'vidsrc_xyz') {
    baseUrl = 'https://vidsrc.example.com/embed/';
  } else if (provider === 'streamer_pro') {
    baseUrl = 'https://streamerpro.example.com/watch/';
  } else if (provider === 'media_nest') {
    baseUrl = 'https://medianest.example.com/play/';
  } else if (provider === 'cine_hub') {
    baseUrl = 'https://cinehub.example.com/stream/';
  }
  
  if (contentType === 'movie') {
    return `${baseUrl}${contentId}`;
  } else if (episodeId) {
    return `${baseUrl}${contentId}/${episodeId}`;
  } else if (seasonNumber && episodeNumber) {
    return `${baseUrl}${contentId}/s${seasonNumber}e${episodeNumber}`;
  }
  
  return `${baseUrl}${contentId}/default`;
};


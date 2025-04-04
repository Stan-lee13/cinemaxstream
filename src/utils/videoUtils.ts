
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
export const getTrailerUrl = (contentId: string): string => {
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

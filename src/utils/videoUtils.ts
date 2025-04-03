/**
 * Utility functions for video streaming and downloads
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Map of content types to streaming endpoints
const STREAMING_ENDPOINTS = {
  movie: "https://api.themoviedb.org/3/movie",
  series: "https://api.themoviedb.org/3/tv",
  anime: "https://api.themoviedb.org/3/anime",
  sports: "https://api.themoviedb.org/3/sports"
};

// Video source providers
const VIDEO_PROVIDERS = {
  vidsrc_in: "https://vidsrc.in/embed/",
  vidsrc_xyz: "https://vidsrc.xyz/embed/",
  vidsrc_to: "https://vidsrc.to/embed/",
  fmovies_net: "https://fmovies.net/movie/",
  fmovies_to: "https://fmovies.to/movie/",
  crackle: "https://crackle.com/watch/"
};

// Provider content type preferences (optimization for best source per content type)
const PROVIDER_PREFERENCES = {
  movie: ['vidsrc_in', 'vidsrc_to', 'fmovies_net', 'fmovies_to', 'crackle'],
  series: ['vidsrc_xyz', 'vidsrc_to', 'fmovies_net', 'fmovies_to'],
  anime: ['vidsrc_xyz', 'vidsrc_in', 'vidsrc_to', 'fmovies_net'],
  sports: ['vidsrc_xyz', 'vidsrc_in', 'crackle']
};

// TMDB API Key
const TMDB_API_KEY = "4626200399b08f9d04b72348e3625f15";

// Download sources
const DOWNLOAD_SOURCES = {
  filepursuite: "https://filepursuite.com/search/",
  archive: "https://archive.org/search?query=",
  bittorrent: "https://btdig.com/search?q="
};

// Map of quality options to download sizes (approximate)
export const QUALITY_OPTIONS = {
  '1080p': {
    label: 'Full HD (1080p)',
    size: '2.1 GB',
    quality: '1080p'
  },
  '720p': {
    label: 'HD (720p)',
    size: '1.3 GB',
    quality: '720p'
  },
  '480p': {
    label: 'SD (480p)',
    size: '720 MB',
    quality: '480p'
  }
};

// For demo purposes, we'll use sample videos
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
];

/**
 * Get streaming URL for content from a specific provider
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param provider - The streaming provider to use
 * @param episodeId - Optional episode ID for series content
 * @param seasonNumber - Optional season number for series content
 * @param episodeNumber - Optional episode number for series content
 */
export const getStreamingUrl = (
  contentId: string, 
  contentType: string, 
  provider: keyof typeof VIDEO_PROVIDERS = 'vidsrc_xyz',
  episodeId?: string,
  seasonNumber?: number,
  episodeNumber?: number
): string => {
  // Select optimal provider based on content type if none specified
  if (!provider) {
    const providers = PROVIDER_PREFERENCES[contentType as keyof typeof PROVIDER_PREFERENCES] || PROVIDER_PREFERENCES.movie;
    provider = providers[0] as keyof typeof VIDEO_PROVIDERS;
  }
  
  // For actual implementation with external providers
  const providerUrl = VIDEO_PROVIDERS[provider];
  
  if (contentType === 'movie') {
    return `${providerUrl}movie/${contentId}`;
  } else if (contentType === 'series' || contentType === 'anime') {
    if (seasonNumber && episodeNumber) {
      return `${providerUrl}tv/${contentId}/${seasonNumber}/${episodeNumber}`;
    }
    return `${providerUrl}tv/${contentId}`;
  }
  
  // Fallback to sample videos for demo
  const hash = hashCode(contentId + (episodeId || ""));
  const index = Math.abs(hash) % SAMPLE_VIDEOS.length;
  return SAMPLE_VIDEOS[index];
};

/**
 * Get best streaming provider for content type
 * @param contentType - The type of content
 */
export const getBestProviderForContentType = (contentType: string): keyof typeof VIDEO_PROVIDERS => {
  const providers = PROVIDER_PREFERENCES[contentType as keyof typeof PROVIDER_PREFERENCES] || PROVIDER_PREFERENCES.movie;
  return providers[0] as keyof typeof VIDEO_PROVIDERS;
};

/**
 * Get all available streaming providers for the content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 */
export const getAvailableProviders = (contentId: string, contentType: string): Array<{id: keyof typeof VIDEO_PROVIDERS, name: string, contentType?: 'movies' | 'series' | 'all'}> => {
  return [
    { id: 'vidsrc_in', name: 'VidSrc.in', contentType: 'movies' },
    { id: 'vidsrc_xyz', name: 'VidSrc.xyz', contentType: 'series' },
    { id: 'vidsrc_to', name: 'VidSrc.to', contentType: 'all' },
    { id: 'fmovies_net', name: 'FMovies.net', contentType: 'all' },
    { id: 'fmovies_to', name: 'FMovies.to', contentType: 'all' },
    { id: 'crackle', name: 'Crackle', contentType: 'all' }
  ];
};

/**
 * Get download URL for content
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 * @param quality - The quality of the video (1080p, 720p, 480p)
 * @param episodeId - Optional episode ID for series content
 */
export const getDownloadUrl = (contentId: string, contentType: string, quality: string, episodeId?: string): string => {
  // Determine the best download source
  const title = `${contentId} ${contentType} ${quality}`;
  const source = DOWNLOAD_SOURCES.filepursuite;
  return `${source}${encodeURIComponent(title)}`;
};

/**
 * Get YouTube trailer URL for movie or show
 * @param contentId - The ID of the content
 * @param contentType - The type of content (movie, series, anime, sports)
 */
export const getTrailerUrl = async (contentId: string, contentType: string): Promise<string> => {
  try {
    const type = contentType === 'series' || contentType === 'anime' ? 'tv' : 'movie';
    const url = `https://api.themoviedb.org/3/${type}/${contentId}/videos?api_key=${TMDB_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch trailer');
    }
    
    const data = await response.json();
    const trailer = data.results.find((video: any) => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailer) {
      return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`;
    }
    
    // If no trailer found, try a teaser or any other official video
    const teaser = data.results.find((video: any) => 
      video.site === 'YouTube'
    );
    
    if (teaser) {
      return `https://www.youtube.com/embed/${teaser.key}?autoplay=1&modestbranding=1&rel=0`;
    }
    
    throw new Error('No trailer found');
  } catch (error) {
    console.error('Error fetching trailer:', error);
    // Return placeholder trailer
    return `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&modestbranding=1&rel=0`;
  }
};

/**
 * Simple hash function to generate a number from a string
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Initialize FFMPEG for recording
 */
export const initFFmpeg = async () => {
  try {
    // In a real implementation, load FFMPEG here
    console.log('FFMPEG initialized for recording');
    return true;
  } catch (error) {
    console.error('Error initializing FFMPEG:', error);
    return false;
  }
};

/**
 * Start recording a video stream
 * @param videoElement - The video element to record
 * @param filename - The filename for the recording
 * @returns A function to stop recording
 */
export const startRecording = (videoElement: HTMLVideoElement, filename: string) => {
  if (!videoElement) {
    toast.error('Video element not found');
    return () => {};
  }
  
  console.log(`Started recording ${filename}`);
  toast.success(`Recording started: ${filename}`);
  
  // In a real implementation, use MediaRecorder API or FFMPEG
  // to record the video stream
  
  const stopRecording = () => {
    console.log(`Stopped recording ${filename}`);
    toast.success(`Recording saved: ${filename}`);
    
    // In a real implementation, stop recording and save the file
    // For demo, just generate a download link
    const a = document.createElement('a');
    a.href = videoElement.src;
    a.download = `${filename}.mp4`;
    a.click();
  };
  
  return stopRecording;
};

/**
 * Track streaming activity
 * @param contentId - The ID of the content
 * @param userId - The ID of the user
 * @param position - Current playback position in seconds
 * @param episodeId - Optional episode ID for series content
 */
export const trackStreamingActivity = async (
  contentId: string, 
  userId: string, 
  position: number,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    // Update or insert watch history
    const watchHistoryData = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      watch_position: position,
      last_watched: new Date().toISOString(),
      completed: false
    };
    
    const { error } = await supabase
      .from('user_watch_history')
      .upsert(watchHistoryData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (error) {
    console.error('Error tracking streaming activity:', error);
  }
};

/**
 * Mark content as complete
 * @param contentId - The ID of the content
 * @param userId - The ID of the user
 * @param episodeId - Optional episode ID for series content
 */
export const markContentAsComplete = async (
  contentId: string, 
  userId: string,
  episodeId?: string
) => {
  if (!userId) return;
  
  try {
    // Using a more type-safe approach with explicitly defined object
    const completedData = {
      user_id: userId,
      content_id: contentId,
      episode_id: episodeId || null,
      completed: true,
      last_watched: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('user_watch_history')
      .upsert(completedData, {
        onConflict: 'user_id,content_id,episode_id'
      });
      
    if (error) {
      console.error('Error marking content as complete:', error);
    }
  } catch (error) {
    console.error('Error marking content as complete:', error);
  }
};

/**
 * Enter premium code to unlock premium content
 * @param code - The premium unlock code
 * @param userId - The user ID
 * @returns boolean indicating success
 */
export const enterPremiumCode = (code: string, userId: string): boolean => {
  const SECRET_CODE = "08066960860";
  
  if (code === SECRET_CODE) {
    // In a real implementation, we would update the user's profile in the database
    // For now, we'll just store it in localStorage
    localStorage.setItem('premium_access', 'true');
    toast.success("Premium access granted!");
    return true;
  }
  
  toast.error("Invalid premium code");
  return false;
};

/**
 * Check if user has premium access
 */
export const hasPremiumAccess = (): boolean => {
  return localStorage.getItem('premium_access') === 'true' || localStorage.getItem('guest_access') === 'true';
};

/**
 * Get anime content from TMDB API
 * @returns Promise with anime content
 */
export const getAnimeContent = async () => {
  try {
    // Use animation genre ID (16) to get anime-like content
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch anime content');
    }
    
    const data = await response.json();
    
    // Transform the data to match our app's format
    return data.results.map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      description: item.overview,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      year: new Date(item.first_air_date).getFullYear().toString(),
      rating: (item.vote_average / 2).toFixed(1),
      category: 'anime',
      type: 'anime'
    }));
  } catch (error) {
    console.error('Error fetching anime content:', error);
    toast.error('Failed to load anime content');
    return [];
  }
};

/**
 * Get personalized recommendations based on user watch history
 * @param userId - The ID of the user
 * @returns Promise with recommended content
 */
export const getPersonalizedRecommendations = async (userId: string) => {
  if (!userId) return [];
  
  try {
    // Get user's watch history
    const { data: watchHistory, error: historyError } = await supabase
      .from('user_watch_history')
      .select('content_id')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(5);
    
    if (historyError) {
      throw historyError;
    }
    
    // If no watch history, return empty array
    if (!watchHistory?.length) {
      return [];
    }
    
    // Get recommendations for the most recently watched content
    const contentId = watchHistory[0].content_id;
    
    // For demo purposes, we'll just fetch similar content from TMDB
    // In a real app, you'd want to use a more sophisticated recommendation algorithm
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${contentId}/similar?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    const data = await response.json();
    
    // Transform the data to match our app's format
    return data.results.map((item: any) => ({
      id: item.id.toString(),
      title: item.title || item.name,
      description: item.overview,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      year: new Date(item.release_date || item.first_air_date).getFullYear().toString(),
      rating: (item.vote_average / 2).toFixed(1),
      category: 'recommendation',
      type: item.title ? 'movie' : 'series'
    }));
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};

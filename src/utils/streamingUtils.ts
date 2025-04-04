
/**
 * Streaming related utility functions
 */
import { hasPremiumAccess } from './authUtils';

// Quality options for downloads
export const QUALITY_OPTIONS = [
  { quality: '2160p', label: '4K Ultra HD', size: '~8-10 GB', premium: true },
  { quality: '1080p', label: 'Full HD', size: '~2-4 GB', premium: false },
  { quality: '720p', label: 'HD', size: '~800 MB-1.5 GB', premium: false },
  { quality: '480p', label: 'Standard Definition', size: '~400-700 MB', premium: false },
  { quality: '360p', label: 'Low Definition', size: '~250-350 MB', premium: false }
];

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
    case 'aniwatch':
      baseUrl = `https://aniwatch.to/watch/`;
      break;
    case 'fmovies':
      baseUrl = `https://fmovies.to/watch/`;
      break;
    case 'eztv':
      return `magnet:?xt=urn:btih:${contentId}&dn=${contentType}`;
    case 'yts':
      return `magnet:?xt=urn:btih:${contentId}&dn=movie`;
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
  episodeId?: string,
  provider: string = 'vidsrc_xyz'
): string => {
  let baseUrl;
  
  switch (provider) {
    case 'vidsrc_xyz':
      baseUrl = 'https://vidsrc.xyz/download/';
      break;
    case 'fmovies':
      baseUrl = 'https://fmovies.to/download/';
      break;
    case 'eztv':
      return `magnet:?xt=urn:btih:${contentId}&dn=${contentType}`;
    case 'yts':
      return `magnet:?xt=urn:btih:${contentId}&dn=movie&quality=${quality}`;
    default:
      baseUrl = 'https://example-download.com/download/';
  }
  
  if (contentType === 'movie') {
    return `${baseUrl}${contentType}/${contentId}/${quality}`;
  } else {
    return `${baseUrl}${contentType}/${contentId}/${episodeId || 'latest'}/${quality}`;
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
  };
};

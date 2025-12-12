/**
 * Streaming utility functions
 */

// Define quality options for streaming and downloading
export const QUALITY_OPTIONS = [
  { value: "4k", label: "4K (2160p)" },
  { value: "1080p", label: "Full HD (1080p)" },
  { value: "720p", label: "HD (720p)" },
  { value: "480p", label: "SD (480p)" },
  { value: "360p", label: "Low (360p)" }
];

// Define source types for different providers
export enum SourceType {
  DIRECT = 'direct',  // Direct video URL (mp4, etc)
  IFRAME = 'iframe',  // Embed via iframe
  HLS = 'hls',        // HLS streaming (.m3u8)
  DASH = 'dash'       // DASH streaming (.mpd)
}

// Define provider configuration type
export interface ProviderConfig {
  type: SourceType;
  supportsFullHD?: boolean;
  isPremium?: boolean;
  contentTypes: string[];
  supportsDownload?: boolean;
}

// Provider configuration - updated with 5 new providers
export const providerConfigs: Record<string, ProviderConfig> = {
  vidsrc_me: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  vidsrcme_ru: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  vidsrc_embed_ru: { 
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  vidsrc_embed_su: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  },
  vidrock_net: {
    type: SourceType.IFRAME,
    supportsFullHD: true,
    contentTypes: ['movie', 'series', 'anime']
  }
};

// Import the provider functions from separate modules
import {
  getStreamingUrlForProvider,
  isIframeSourceImpl
} from './providers/providerUtils';

import { getDownloadUrlImpl } from './providers/downloadProviders';
import { getTrailerUrlImpl } from './providers/trailerProviders';
import type { ProviderOptions } from './providers/providerUtils';

export type StreamingOptions = ProviderOptions;

/**
 * Get streaming URL for the content
 */
export const getStreamingUrl = (contentId: string, provider: string = 'vidsrc_embed_ru', options: StreamingOptions = {}): string => {
  return getStreamingUrlForProvider(contentId, provider, options);
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSource = (provider: string): boolean => {
  return isIframeSourceImpl(provider);
};

/**
 * Get download URL for the content
 */
export const getDownloadUrl = (contentId: string, quality: string = '1080p'): string => {
  return getDownloadUrlImpl(contentId, quality);
};

/**
 * Get trailer URL from YouTube API
 */
export const getTrailerUrl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  return getTrailerUrlImpl(contentId, contentType);
};

/**
 * Start recording for live content
 */
export const startRecording = async (options = {}): Promise<MediaStream | null> => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      return stream;
    } else {
      throw new Error('Screen recording not supported');
    }
  } catch (error) {
    // Production error handling - no console.error
    return null;
  }
};

/**
 * Get a list of all available streaming services
 */
export const getAllStreamingServices = () => {
  return Object.entries(providerConfigs).map(([id, config]) => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    isPremium: config.isPremium || false,
    supportsDownload: config.supportsDownload || false,
    contentTypes: config.contentTypes || ['movie'],
    supportsFullHD: config.supportsFullHD !== undefined ? config.supportsFullHD : false
  }));
};

/**
 * Generate correct runtime for content based on content type
 */
export const getContentRuntime = (contentType: string, episodeNumber?: number): string => {
  // Default runtimes based on content type
  const defaultRuntimes: Record<string, number> = {
    'movie': 120, // 2 hours average
    'series': 45, // 45 minutes average
    'anime': 24,  // 24 minutes average
  };
  
  const minutes = defaultRuntimes[contentType] || 90;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};

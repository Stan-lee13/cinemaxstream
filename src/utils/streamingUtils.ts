/**
 * Streaming utility functions
 * DEPRECATED: Use src/utils/providers/providerUtils.ts instead
 */

import {
  getStreamingUrlForSource,
  getSourceFromProvider,
  QUALITY_OPTIONS as CONSOLIDATED_QUALITY_OPTIONS,
  getAllStreamingServices as getConsolidatedServices
} from './providers/providerUtils';

import { getDownloadUrlImpl } from './providers/downloadProviders';
import { getTrailerUrlImpl } from './providers/trailerProviders';
import type { ProviderOptions } from './providers/providerUtils';

export const QUALITY_OPTIONS = CONSOLIDATED_QUALITY_OPTIONS;

export enum SourceType {
  DIRECT = 'direct',
  IFRAME = 'iframe',
  HLS = 'hls',
  DASH = 'dash'
}

export type StreamingOptions = ProviderOptions;

/**
 * Get streaming URL for the content
 */
export const getStreamingUrl = (contentId: string, provider: string = 'source_1', options: StreamingOptions = {}): string => {
  const sourceNum = getSourceFromProvider(provider);
  return getStreamingUrlForSource(contentId, sourceNum, options);
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSource = (): boolean => true;

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
export const startRecording = async (): Promise<MediaStream | null> => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Get a list of all available streaming services
 */
export const getAllStreamingServices = () => {
  return getConsolidatedServices();
};

/**
 * Generate correct runtime for content based on content type
 */
export const getContentRuntime = (contentType: string): string => {
  const defaultRuntimes: Record<string, number> = {
    'movie': 120,
    'series': 45,
    'anime': 24,
  };
  
  const minutes = defaultRuntimes[contentType] || 90;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};

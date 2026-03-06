/**
 * Streaming utility compatibility layer
 * Delegates to provider registry in utils/providers/providerUtils.ts
 */

export const QUALITY_OPTIONS = [
  { value: '4k', label: '4K (2160p)' },
  { value: '1080p', label: 'Full HD (1080p)' },
  { value: '720p', label: 'HD (720p)' },
  { value: '480p', label: 'SD (480p)' },
  { value: '360p', label: 'Low (360p)' },
];

import {
  getStreamingUrlForProvider,
  isIframeSourceImpl,
  getAllSourceConfigs,
  type ProviderOptions,
} from './providers/providerUtils';
import { getDownloadUrlImpl } from './providers/downloadProviders';
import { getTrailerUrlImpl } from './providers/trailerProviders';

export type StreamingOptions = ProviderOptions;

export const getStreamingUrl = (
  contentId: string,
  provider: string = 'videasy',
  options: StreamingOptions = {}
): string => getStreamingUrlForProvider(contentId, provider, options);

export const isIframeSource = (): boolean => isIframeSourceImpl();

export const getDownloadUrl = (contentId: string, quality: string = '1080p'): string => {
  return getDownloadUrlImpl(contentId, quality);
};

export const getTrailerUrl = async (contentId: string, contentType: string = 'movie'): Promise<string> => {
  return getTrailerUrlImpl(contentId, contentType);
};

export const startRecording = async (): Promise<MediaStream | null> => {
  try {
    if (navigator.mediaDevices?.getDisplayMedia) {
      return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    }
    return null;
  } catch {
    return null;
  }
};

export const getAllStreamingServices = () => {
  const configs = getAllSourceConfigs();
  return Object.entries(configs).map(([source, cfg]) => ({
    id: cfg.key,
    source: Number(source),
    name: cfg.label,
    isPremium: cfg.isPremium,
    supportsDownload: false,
    contentTypes: ['movie', 'series', 'anime', 'documentary'],
    supportsFullHD: true,
  }));
};

export const getContentRuntime = (contentType: string, episodeNumber?: number): string => {
  const defaultRuntimes: Record<string, number> = {
    movie: 120,
    series: 45,
    anime: 24,
  };

  const minutes = defaultRuntimes[contentType] || (episodeNumber ? 45 : 90);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

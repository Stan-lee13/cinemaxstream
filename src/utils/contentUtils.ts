/**
 * Content utility functions
 */

import type { ContentItem } from '@/types/content';

export const streamingProviders = [
  { id: 'videasy', name: 'Videasy', contentType: 'all', isDefault: true },
  { id: 'vidnest', name: 'Vidnest', contentType: 'all' },
  { id: 'vidrock', name: 'Vidrock', contentType: 'all' },
  { id: 'vidlink', name: 'Vidlink', contentType: 'all' },
];

export const downloadProviders: { id: string; name: string; contentType: string }[] = [];

const premiumContentConfig = {
  premiumIds: ['1124620', '634649', '505642', '843794', '872585'],
  recentReleaseThreshold: 6 * 30 * 24 * 60 * 60 * 1000,
  highRatingThreshold: 8.0,
};

export const isPremiumContent = (contentId: string, releaseDate?: string, rating?: number): boolean => {
  if (premiumContentConfig.premiumIds.includes(contentId)) return true;

  if (releaseDate) {
    const releaseTime = new Date(releaseDate).getTime();
    if (Date.now() - releaseTime < premiumContentConfig.recentReleaseThreshold) return true;
  }

  if (rating && rating >= premiumContentConfig.highRatingThreshold) return true;
  return false;
};

export const getAvailableProviders = (_contentId: string, contentType: string = 'movie') => {
  return streamingProviders.filter((provider) =>
    provider.contentType === 'all' || provider.contentType === contentType
  );
};

export const getBestProviderForContentType = (_contentType: string): string => 'videasy';

export const getDefaultRuntime = (contentType: string): string => {
  const runtimes: Record<string, string> = {
    movie: '120 min',
    series: '45 min',
    anime: '24 min',
    documentary: '90 min',
    sport: '180 min',
    short: '15 min',
  };
  return runtimes[contentType] || '60 min';
};

export const getContentRuntime = (contentType: string, category?: string): string => {
  if (category?.toLowerCase().includes('anime')) return '24 min';
  if (category?.toLowerCase().includes('documentary')) return '90 min';
  if (category?.toLowerCase().includes('sport')) return '180 min';
  return getDefaultRuntime(contentType);
};

export const getPersonalizedRecommendations = async (_userId: string): Promise<ContentItem[]> => [];

export const getContentQuality = (_sourceId: string, _contentType: string): string[] => ['1080p', '720p', '480p'];

export const providerSupportsDownload = (_sourceId: string, _contentType: string): boolean => false;

export const getEstimatedFileSize = (contentType: string, quality: string, duration?: string): string => {
  const durationMinutes = duration
    ? parseInt(duration.replace(/[^\d]/g, ''), 10)
    : contentType === 'movie'
      ? 120
      : 45;

  const sizePerMinute: Record<string, number> = {
    '1080p': 25,
    '720p': 15,
    '480p': 10,
    '360p': 6,
  };

  const totalMB = (sizePerMinute[quality] || 15) * durationMinutes;
  return totalMB > 1024 ? `${(totalMB / 1024).toFixed(1)} GB` : `${totalMB} MB`;
};

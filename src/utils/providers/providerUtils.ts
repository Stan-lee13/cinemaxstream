import { videasyProvider } from './adapters/videasyProvider';
import { vidnestProvider } from './adapters/vidnestProvider';
import { vidrockProvider } from './adapters/vidrockProvider';
import { vidlinkProvider } from './adapters/vidlinkProvider';
import type { ProviderAdapter, ProviderOptions } from './adapters/types';

/**
 * Provider utilities — 4 streaming sources
 * Server 1: Vidrock (vidrock.net)
 * Server 2: Vidnest (vidnest.fun)
 * Server 3: Videasy (player.videasy.net)
 * Server 4: Vidlink (vidlink.pro)
 */

export type { ProviderOptions } from './adapters/types';

export interface SourceConfig {
  key: string;
  label: string;
  domain: string;
  isPremium: boolean;
  headers?: Record<string, string>;
  referrer?: string;
}

const SOURCE_CONFIGS: Record<number, SourceConfig> = {
  1: {
    key: 'vidrock',
    label: 'Vidrock',
    domain: 'vidrock.net',
    isPremium: true,
    referrer: 'https://vidrock.net',
    headers: { 'Referer': 'https://vidrock.net' },
  },
  2: {
    key: 'vidnest',
    label: 'Vidnest',
    domain: 'vidnest.fun',
    isPremium: false,
    referrer: 'https://vidnest.fun',
    headers: { 'Referer': 'https://vidnest.fun' },
  },
  3: {
    key: 'videasy',
    label: 'Videasy',
    domain: 'player.videasy.net',
    isPremium: false,
    referrer: 'https://player.videasy.net',
    headers: { 'Referer': 'https://player.videasy.net' },
  },
  4: {
    key: 'vidlink',
    label: 'Vidlink',
    domain: 'vidlink.pro',
    isPremium: false,
    referrer: 'https://vidlink.pro',
    headers: { 'Referer': 'https://vidlink.pro' },
  },
};

const DEFAULT_SOURCE = 1;
const PREMIUM_DEFAULT_SOURCE = 1;

// ── Helpers ────────────────────────────────────────────────────────

export const getSourceConfig = (sourceNumber: number): SourceConfig =>
  SOURCE_CONFIGS[sourceNumber] || SOURCE_CONFIGS[DEFAULT_SOURCE];

export const getAllSourceConfigs = (): Record<number, SourceConfig> => SOURCE_CONFIGS;

export const getSourceNumber = (providerId: string): number => {
  const normalized = providerId.toLowerCase().trim();
  if (normalized.startsWith('source_')) {
    const sourceNum = parseInt(normalized.replace('source_', ''), 10);
    if (SOURCE_CONFIGS[sourceNum]) return sourceNum;
  }
  const entry = Object.entries(SOURCE_CONFIGS).find(([, c]) => c.key === normalized);
  return entry ? parseInt(entry[0], 10) : DEFAULT_SOURCE;
};

export const getProviderFromSource = (sourceNumber: number): string =>
  (SOURCE_CONFIGS[sourceNumber] || SOURCE_CONFIGS[DEFAULT_SOURCE]).key;

export const getAvailableSources = (): number[] => [1, 2, 3, 4];

export const getDefaultSource = (isPremium = false): number =>
  isPremium ? PREMIUM_DEFAULT_SOURCE : DEFAULT_SOURCE;

const normalizeContentType = (type?: string) => (type ?? 'movie').toLowerCase();
const isMovieContent = (type?: string) => {
  const n = normalizeContentType(type);
  return n === 'movie' || n === 'documentary';
};

const clamp = (v?: number | null, fallback = 1) =>
  typeof v === 'number' && !Number.isNaN(v) && v >= 1 ? Math.floor(v) : fallback;

export const getSourceConfig = (sourceNumber: number): SourceConfig => {
  const adapter = SOURCE_REGISTRY[sourceNumber] || SOURCE_REGISTRY[DEFAULT_SOURCE];
  return {
    key: adapter.key,
    label: adapter.label,
    domain: adapter.domain,
    isPremium: adapter.isPremium,
    referrer: adapter.referrer,
    headers: { Referer: adapter.referrer },
  };
};

export const getAllSourceConfigs = (): Record<number, SourceConfig> =>
  Object.fromEntries(Object.entries(SOURCE_REGISTRY).map(([source, adapter]) => [
    Number(source),
    {
      key: adapter.key,
      label: adapter.label,
      domain: adapter.domain,
      isPremium: adapter.isPremium,
      referrer: adapter.referrer,
      headers: { Referer: adapter.referrer },
    },
  ]));

export const getSourceNumber = (providerId: string): number => {
  const normalized = providerId.toLowerCase().trim();

  if (normalized.startsWith('source_')) {
    const sourceNum = parseInt(normalized.replace('source_', ''), 10);
    if (SOURCE_REGISTRY[sourceNum]) return sourceNum;
  }

  const byKey = Object.entries(SOURCE_REGISTRY).find(([, adapter]) => adapter.key === normalized);
  if (byKey) return parseInt(byKey[0], 10);

  return DEFAULT_SOURCE;
};

export const getProviderFromSource = (sourceNumber: number): string =>
  (SOURCE_REGISTRY[sourceNumber] || SOURCE_REGISTRY[DEFAULT_SOURCE]).key;

export const getAvailableSources = (): number[] => [1, 2, 3, 4];

export const getDefaultSource = (isPremium = false): number =>
  isPremium ? PREMIUM_DEFAULT_SOURCE : DEFAULT_SOURCE;

export const getStreamingUrlForSource = (
  contentId: string,
  sourceNumber: number = DEFAULT_SOURCE,
  options: ProviderOptions = {}
): string => {
  const adapter = SOURCE_REGISTRY[sourceNumber] || SOURCE_REGISTRY[DEFAULT_SOURCE];
  const season = clamp(options.season);
  const episode = clamp(options.episodeNum);

  if (isMovieContent(options.contentType)) {
    return adapter.getMovieEmbedUrl(contentId, options);
  }

  return adapter.getTVEmbedUrl(contentId, season, episode, options);
};

/** @deprecated Use getStreamingUrlForSource */
export const getStreamingUrlForProvider = (
  contentId: string,
  provider: string = 'videasy',
  options: ProviderOptions = {}
): string => getStreamingUrlForSource(contentId, getSourceNumber(provider), options);

export const isVidRockSource = (sourceNumber: number): boolean => sourceNumber === 3;

export const isIframeSourceImpl = (): boolean => true;

export const getSourceLabel = (sourceNumber: number): string => {
  const adapter = SOURCE_REGISTRY[sourceNumber];
  return adapter ? adapter.label : `Source ${sourceNumber}`;
};

export const getSourceReferrer = (sourceNumber: number): string => {
  const adapter = SOURCE_REGISTRY[sourceNumber];
  return adapter?.referrer || '';
};

export const probeProviderHealth = async (sourceNumber: number, tmdbId = '299534') => {
  const adapter = SOURCE_REGISTRY[sourceNumber] || SOURCE_REGISTRY[DEFAULT_SOURCE];
  return adapter.probeHealth(tmdbId);
};

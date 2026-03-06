/**
 * Provider utilities — 4 streaming sources
 * Source 1: Videasy (player.videasy.net)
 * Source 2: Vidnest (vidnest.fun) — ad-free plays
 * Source 3: Vidrock (vidrock.net) — premium
 * Source 4: Vidlink (vidlink.pro)
 *
 * SECURITY: Provider domains are never exposed to the client UI
 */

export type ProviderOptions = {
  autoplay?: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary' | string;
  season?: number | null;
  episodeNum?: number | null;
  progress?: number; // resume position in seconds
  color?: string; // hex accent color without #
};

// ── Source map ──────────────────────────────────────────────────────
export interface SourceConfig {
  key: string;
  label: string;        // user-facing label
  domain: string;
  isPremium: boolean;
  headers?: Record<string, string>;
  referrer?: string;
}

const SOURCE_CONFIGS: Record<number, SourceConfig> = {
  1: {
    key: 'videasy',
    label: 'Videasy',
    domain: 'player.videasy.net',
    isPremium: false,
    referrer: 'https://player.videasy.net',
    headers: { 'Referer': 'https://player.videasy.net' },
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
    key: 'vidrock',
    label: 'Vidrock',
    domain: 'vidrock.net',
    isPremium: true,
    referrer: 'https://vidrock.net',
    headers: { 'Referer': 'https://vidrock.net' },
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
const PREMIUM_DEFAULT_SOURCE = 3;

// ── Helpers ────────────────────────────────────────────────────────

export const getSourceConfig = (sourceNumber: number): SourceConfig =>
  SOURCE_CONFIGS[sourceNumber] || SOURCE_CONFIGS[DEFAULT_SOURCE];

export const getAllSourceConfigs = (): Record<number, SourceConfig> => SOURCE_CONFIGS;

export const getSourceNumber = (providerId: string): number => {
  const entry = Object.entries(SOURCE_CONFIGS).find(([, c]) => c.key === providerId);
  return entry ? parseInt(entry[0]) : DEFAULT_SOURCE;
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

// ── URL builders ───────────────────────────────────────────────────

const buildEmbedUrl = (sourceNumber: number, tmdbId: string, opts: ProviderOptions): string => {
  const cfg = SOURCE_CONFIGS[sourceNumber];
  if (!cfg) return '';
  const { domain, key } = cfg;
  const season = clamp(opts.season);
  const episode = clamp(opts.episodeNum);
  const isMovie = isMovieContent(opts.contentType);

  // Build query params
  const params = new URLSearchParams();

  if (key === 'videasy') {
    // Videasy supports color, progress, nextEpisode, autoplayNextEpisode, episodeSelector
    if (opts.color) params.set('color', opts.color);
    if (opts.progress && opts.progress > 0) params.set('progress', String(Math.floor(opts.progress)));
    if (!isMovie) {
      params.set('nextEpisode', 'true');
      params.set('autoplayNextEpisode', 'true');
    }
    const qs = params.toString();
    if (isMovie) return `https://${domain}/movie/${tmdbId}${qs ? '?' + qs : ''}`;
    return `https://${domain}/tv/${tmdbId}/${season}/${episode}${qs ? '?' + qs : ''}`;
  }

  if (key === 'vidnest') {
    // Vidnest supports startAt, server
    if (opts.progress && opts.progress > 0) params.set('startAt', String(Math.floor(opts.progress)));
    const qs = params.toString();
    if (isMovie) return `https://${domain}/movie/${tmdbId}${qs ? '?' + qs : ''}`;
    return `https://${domain}/tv/${tmdbId}/${season}/${episode}${qs ? '?' + qs : ''}`;
  }

  if (key === 'vidrock') {
    if (isMovie) return `https://${domain}/movie/${tmdbId}`;
    return `https://${domain}/tv/${tmdbId}/${season}/${episode}`;
  }

  if (key === 'vidlink') {
    if (isMovie) return `https://${domain}/movie/${tmdbId}`;
    return `https://${domain}/tv/${tmdbId}/${season}/${episode}`;
  }

  // Fallback
  if (isMovie) return `https://${domain}/movie/${tmdbId}`;
  return `https://${domain}/tv/${tmdbId}/${season}/${episode}`;
};

export const getStreamingUrlForSource = (
  contentId: string,
  sourceNumber: number = DEFAULT_SOURCE,
  options: ProviderOptions = {}
): string => buildEmbedUrl(sourceNumber, contentId, options);

/** @deprecated Use getStreamingUrlForSource */
export const getStreamingUrlForProvider = (
  contentId: string,
  provider: string = 'videasy',
  options: ProviderOptions = {}
): string => getStreamingUrlForSource(contentId, getSourceNumber(provider), options);

export const isVidRockSource = (sourceNumber: number): boolean => sourceNumber === 3;

export const isIframeSourceImpl = (): boolean => true;

export const getSourceLabel = (sourceNumber: number): string => {
  const cfg = SOURCE_CONFIGS[sourceNumber];
  return cfg ? cfg.label : `Source ${sourceNumber}`;
};

/**
 * Get the referrer policy value for a given source
 */
export const getSourceReferrer = (sourceNumber: number): string => {
  const cfg = SOURCE_CONFIGS[sourceNumber];
  return cfg?.referrer || '';
};

/**
 * Provider utilities — 4 streaming sources
 * Server 1: Vidrock (vidrock.net)
 * Server 2: Vidnest (vidnest.fun)
 * Server 3: Videasy (player.videasy.net)
 * Server 4: Vidlink (vidlink.pro)
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
    key: 'vidrock',
    label: 'Source 1',
    domain: 'vidrock.net',
    isPremium: true,
    referrer: 'https://vidrock.net',
    headers: { 'Referer': 'https://vidrock.net' },
  },
  2: {
    key: 'vidnest',
    label: 'Source 2',
    domain: 'vidnest.fun',
    isPremium: false,
    referrer: 'https://vidnest.fun',
    headers: { 'Referer': 'https://vidnest.fun' },
  },
  3: {
    key: 'videasy',
    label: 'Source 3',
    domain: 'player.videasy.net',
    isPremium: false,
    referrer: 'https://player.videasy.net',
    headers: { 'Referer': 'https://player.videasy.net' },
  },
  4: {
    key: 'vidlink',
    label: 'Source 4',
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

/**
 * Quality options for streaming and downloading
 */
export const QUALITY_OPTIONS = [
  { value: "4k", label: "4K (2160p)" },
  { value: "1080p", label: "Full HD (1080p)" },
  { value: "720p", label: "HD (720p)" },
  { value: "480p", label: "SD (480p)" },
  { value: "360p", label: "Low (360p)" }
];

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

export const isVidRockSource = (sourceNumber: number): boolean => sourceNumber === 1;

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

/**
 * Get the internal source number from a user-facing provider ID
 */
export const getSourceFromProvider = (providerId: string): number => {
  if (providerId.startsWith('source_')) {
    const num = parseInt(providerId.replace('source_', ''), 10);
    if (SOURCE_CONFIGS[num]) return num;
  }
  // Map legacy IDs to new system
  const mapping: Record<string, number> = {
    'vidsrc_me': 1,
    'vidsrcme_ru': 2,
    'vidsrc_embed_ru': 3,
    'vidsrc_embed_su': 4,
    'vidrock_net': 1
  };
  return mapping[providerId] || DEFAULT_SOURCE;
};

/**
 * Get all available sources formatted for UI selectors
 */
export const getAllStreamingServices = () => {
  return Object.entries(SOURCE_CONFIGS).map(([id, config]) => ({
    id: `source_${id}`,
    name: config.label,
    isPremium: config.isPremium,
    domain: config.domain,
    key: config.key
  }));
};

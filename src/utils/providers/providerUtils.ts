/**
 * Provider utilities with source obfuscation
 * Users see "Source 1-5" only - never actual provider names/URLs
 * 
 * SECURITY: Provider domains are never exposed to the client UI
 */

export type ProviderOptions = {
  autoplay?: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary' | string;
  season?: number | null;
  episodeNum?: number | null;
};

// Internal source mapping - NEVER expose provider names to UI
// Source 1-5 map to these internal providers
const INTERNAL_SOURCES: Record<number, string> = {
  1: 'vidsrc_embed_ru',
  2: 'vidsrc_embed_su',
  3: 'vidsrcme_su',
  4: 'vsrc_su',
  5: 'vidrock_net'
};

// Provider domain mapping - INTERNAL ONLY
const PROVIDER_DOMAINS: Record<string, string> = {
  vidsrc_embed_ru: 'vidsrc-embed.ru',
  vidsrc_embed_su: 'vidsrc-embed.su',
  vidsrcme_su: 'vidsrcme.su',
  vsrc_su: 'vsrc.su',
  vidrock_net: 'vidrock.net'
};

const DEFAULT_SOURCE = 1;
const PREMIUM_DEFAULT_SOURCE = 5; // VidRock for premium users

/**
 * Get source number from provider ID (for display)
 */
export const getSourceNumber = (providerId: string): number => {
  const entry = Object.entries(INTERNAL_SOURCES).find(([, id]) => id === providerId);
  return entry ? parseInt(entry[0]) : DEFAULT_SOURCE;
};

/**
 * Get provider ID from source number (internal use)
 */
export const getProviderFromSource = (sourceNumber: number): string => {
  return INTERNAL_SOURCES[sourceNumber] || INTERNAL_SOURCES[DEFAULT_SOURCE];
};

/**
 * Get all available sources (for UI display)
 */
export const getAvailableSources = (): number[] => {
  return Object.keys(INTERNAL_SOURCES).map(Number).sort();
};

/**
 * Get default source for user tier
 */
export const getDefaultSource = (isPremium: boolean = false): number => {
  return isPremium ? PREMIUM_DEFAULT_SOURCE : DEFAULT_SOURCE;
};

const normalizeContentType = (type?: string) => (type ?? 'movie').toLowerCase();

const isMovieContent = (type?: string) => {
  const normalized = normalizeContentType(type);
  return normalized === 'movie' || normalized === 'documentary';
};

const clampEpisodeInfo = (value?: number | null, fallback = 1) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
};

/**
 * Build embed URL for provider
 * Uses TMDB ID format: /embed/movie/tmdb/{id} or /embed/tv/tmdb/{id}/{season}/{episode}
 */
const buildEmbedUrl = (providerId: string, tmdbId: string, opts: ProviderOptions): string => {
  const domain = PROVIDER_DOMAINS[providerId] || PROVIDER_DOMAINS.vidsrc_embed_ru;
  const season = clampEpisodeInfo(opts.season, 1);
  const episode = clampEpisodeInfo(opts.episodeNum, 1);
  
  if (isMovieContent(opts.contentType)) {
    return `https://${domain}/embed/movie/tmdb/${tmdbId}`;
  }
  return `https://${domain}/embed/tv/tmdb/${tmdbId}/${season}/${episode}`;
};

/**
 * Get streaming URL for a specific source number
 * @param contentId - TMDB content ID
 * @param sourceNumber - Source number (1-5)
 * @param options - Provider options
 */
export const getStreamingUrlForSource = (
  contentId: string,
  sourceNumber: number = DEFAULT_SOURCE,
  options: ProviderOptions = {}
): string => {
  const providerId = getProviderFromSource(sourceNumber);
  return buildEmbedUrl(providerId, contentId, options);
};

/**
 * Legacy function - get streaming URL by provider ID
 * @deprecated Use getStreamingUrlForSource instead
 */
export const getStreamingUrlForProvider = (
  contentId: string,
  provider: string = 'vidsrc_embed_ru',
  options: ProviderOptions = {}
): string => {
  const sourceNumber = getSourceNumber(provider);
  return getStreamingUrlForSource(contentId, sourceNumber, options);
};

/**
 * Check if provider is VidRock (for special features)
 */
export const isVidRockSource = (sourceNumber: number): boolean => {
  return sourceNumber === 5;
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSourceImpl = (): boolean => {
  // All our providers use iframe embedding
  return true;
};

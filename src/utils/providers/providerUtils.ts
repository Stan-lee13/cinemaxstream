/**
 * Provider utilities with source obfuscation
 * Users see "Source 1-3" only - never actual provider names/URLs
 * 
 * RESTRUCTURED: Exactly 3 sources as required
 * - Source 1: AutoEmbed (primary)
 * - Source 2: VidSrc (previously Source 3)
 * - Source 3: VidRock (previously Source 5)
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
// Source 1-3 map to these internal providers
const INTERNAL_SOURCES: Record<number, string> = {
  1: 'autoembed',    // Primary - AutoEmbed
  2: 'vidsrc_vip',   // VidSrc VIP (previously Source 3)
  3: 'vidrock_net'   // VidRock (previously Source 5)
};

// Provider domain mapping - INTERNAL ONLY
const PROVIDER_DOMAINS: Record<string, string> = {
  autoembed: 'player.autoembed.cc',
  vidsrc_vip: 'vidsrc.vip',
  vidrock_net: 'vidrock.net'
};

const DEFAULT_SOURCE = 1;
const PREMIUM_DEFAULT_SOURCE = 3; // VidRock for premium users

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
 * EXACTLY 3 sources as required
 */
export const getAvailableSources = (): number[] => {
  return [1, 2, 3]; // Only 3 sources
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
 * Handles specific URL patterns for each provider
 */
const buildEmbedUrl = (providerId: string, tmdbId: string, opts: ProviderOptions): string => {
  const domain = PROVIDER_DOMAINS[providerId];
  if (!domain) return '';

  const season = clampEpisodeInfo(opts.season, 1);
  const episode = clampEpisodeInfo(opts.episodeNum, 1);
  const isMovie = isMovieContent(opts.contentType);

  // AutoEmbed - Primary source
  if (providerId === 'autoembed') {
    if (isMovie) {
      return `https://${domain}/embed/movie/${tmdbId}`;
    }
    return `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  // VidSrc VIP
  if (providerId === 'vidsrc_vip') {
    if (isMovie) {
      return `https://${domain}/embed/movie/${tmdbId}`;
    }
    return `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  // VidRock has a unique structure for movies
  if (providerId === 'vidrock_net') {
    if (isMovie) {
      return `https://${domain}/embed/${tmdbId}`;
    }
    return `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  // Fallback standard vidsrc structure
  if (isMovie) {
    return `https://${domain}/embed/movie/${tmdbId}`;
  }
  return `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}`;
};

/**
 * Get streaming URL for a specific source number
 * @param contentId - TMDB content ID
 * @param sourceNumber - Source number (1-3)
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
  provider: string = 'autoembed',
  options: ProviderOptions = {}
): string => {
  const sourceNumber = getSourceNumber(provider);
  return getStreamingUrlForSource(contentId, sourceNumber, options);
};

/**
 * Check if provider is VidRock (for special features)
 */
export const isVidRockSource = (sourceNumber: number): boolean => {
  return sourceNumber === 3;
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSourceImpl = (): boolean => {
  // All our providers use iframe embedding
  return true;
};

/**
 * Get source label for display
 */
export const getSourceLabel = (sourceNumber: number): string => {
  return `Source ${sourceNumber}`;
};

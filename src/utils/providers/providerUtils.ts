
export type ProviderOptions = {
  autoplay?: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary' | string;
  season?: number | null;
  episodeNum?: number | null;
};

type ProviderEndpoint = {
  movie: (tmdbId: string) => string;
  series: (tmdbId: string, season: number, episode: number) => string;
};

const FALLBACK_PROVIDER = 'vidsrc_embed_ru';

const PROVIDER_ENDPOINTS: Record<string, ProviderEndpoint> = {
  vidsrc_me: {
    movie: (id) => `https://vidsrc.me/embed/movie/${id}`,
    series: (id, season, episode) => `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`
  },
  vidsrcme_ru: {
    movie: (id) => `https://vidsrcme.ru/embed/movie/${id}`,
    series: (id, season, episode) => `https://vidsrcme.ru/embed/tv/${id}/${season}/${episode}`
  },
  vidsrc_embed_ru: {
    movie: (id) => `https://vidsrc-embed.ru/embed/movie/${id}`,
    series: (id, season, episode) => `https://vidsrc-embed.ru/embed/tv/${id}/${season}/${episode}`
  },
  vidsrc_embed_su: {
    movie: (id) => `https://vidsrc-embed.su/embed/movie/${id}`,
    series: (id, season, episode) => `https://vidsrc-embed.su/embed/tv/${id}/${season}/${episode}`
  },
  vidrock_net: {
    movie: (id) => `https://vidrock.net/embed/${id}`,
    series: (id, season, episode) => `https://vidrock.net/embed/tv/${id}/${season}/${episode}`
  }
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

const buildEmbedUrl = (providerId: string, tmdbId: string, opts: ProviderOptions): string => {
  const provider = PROVIDER_ENDPOINTS[providerId] ?? PROVIDER_ENDPOINTS[FALLBACK_PROVIDER];
  const season = clampEpisodeInfo(opts.season, 1);
  const episode = clampEpisodeInfo(opts.episodeNum, 1);
  
  if (isMovieContent(opts.contentType)) {
    return provider.movie(tmdbId);
  }
  return provider.series(tmdbId, season, episode);
};

export const getStreamingUrlForProvider = (
  contentId: string,
  provider: string = FALLBACK_PROVIDER,
  options: ProviderOptions = {}
): string => {
  const validProvider = PROVIDER_ENDPOINTS[provider] ? provider : FALLBACK_PROVIDER;
  return buildEmbedUrl(validProvider, contentId, options);
};

/**
 * Determine if a provider requires iframe embedding
 */
export const isIframeSourceImpl = (provider: string): boolean => {
  // All our providers use iframe embedding
  return true;
};

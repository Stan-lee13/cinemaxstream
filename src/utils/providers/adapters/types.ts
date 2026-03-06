export type ProviderOptions = {
  autoplay?: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary' | string;
  season?: number | null;
  episodeNum?: number | null;
  progress?: number;
  color?: string;
};

export interface ProviderAdapter {
  key: string;
  label: string;
  domain: string;
  isPremium: boolean;
  referrer: string;
  getMovieEmbedUrl: (tmdbId: string, opts?: ProviderOptions) => string;
  getTVEmbedUrl: (tmdbId: string, season: number, episode: number, opts?: ProviderOptions) => string;
  probeHealth: (tmdbId?: string) => Promise<{ healthy: boolean; latency: number }>;
}

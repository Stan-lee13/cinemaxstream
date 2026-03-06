import type { ProviderAdapter } from './types';
import { clampInt, probeProviderUrl } from './common';

const DOMAIN = 'vidrock.net';

const getMovieEmbedUrl = (tmdbId: string) => `https://${DOMAIN}/movie/${tmdbId}`;

const getTVEmbedUrl = (tmdbId: string, season: number, episode: number) => {
  const s = clampInt(season);
  const e = clampInt(episode);
  return `https://${DOMAIN}/tv/${tmdbId}/${s}/${e}`;
};

export const vidrockProvider = {
  key: 'vidrock',
  label: 'Vidrock',
  domain: DOMAIN,
  isPremium: true,
  referrer: `https://${DOMAIN}`,
  getMovieEmbedUrl,
  getTVEmbedUrl,
  probeHealth: async (tmdbId = '299534') => probeProviderUrl(getMovieEmbedUrl(tmdbId)),
} satisfies ProviderAdapter;

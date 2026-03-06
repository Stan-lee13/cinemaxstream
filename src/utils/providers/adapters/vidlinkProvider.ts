import type { ProviderAdapter } from './types';
import { clampInt, probeProviderUrl } from './common';

const DOMAIN = 'vidlink.pro';

const getMovieEmbedUrl = (tmdbId: string) => `https://${DOMAIN}/movie/${tmdbId}`;

const getTVEmbedUrl = (tmdbId: string, season: number, episode: number) => {
  const s = clampInt(season);
  const e = clampInt(episode);
  return `https://${DOMAIN}/tv/${tmdbId}/${s}/${e}`;
};

export const vidlinkProvider = {
  key: 'vidlink',
  label: 'Vidlink',
  domain: DOMAIN,
  isPremium: false,
  referrer: `https://${DOMAIN}`,
  getMovieEmbedUrl,
  getTVEmbedUrl,
  probeHealth: async (tmdbId = '299534') => probeProviderUrl(getMovieEmbedUrl(tmdbId)),
} satisfies ProviderAdapter;

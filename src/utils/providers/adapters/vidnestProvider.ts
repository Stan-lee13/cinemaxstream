import type { ProviderAdapter, ProviderOptions } from './types';
import { clampInt, probeProviderUrl } from './common';

const DOMAIN = 'vidnest.fun';

const getMovieEmbedUrl = (tmdbId: string, opts: ProviderOptions = {}) => {
  const params = new URLSearchParams();
  if (opts.progress && opts.progress > 0) params.set('startAt', String(Math.floor(opts.progress)));
  const qs = params.toString();
  return `https://${DOMAIN}/movie/${tmdbId}${qs ? `?${qs}` : ''}`;
};

const getTVEmbedUrl = (tmdbId: string, season: number, episode: number, opts: ProviderOptions = {}) => {
  const s = clampInt(season);
  const e = clampInt(episode);
  const params = new URLSearchParams();
  if (opts.progress && opts.progress > 0) params.set('startAt', String(Math.floor(opts.progress)));
  const qs = params.toString();
  return `https://${DOMAIN}/tv/${tmdbId}/${s}/${e}${qs ? `?${qs}` : ''}`;
};

export const vidnestProvider: ProviderAdapter = {
  key: 'vidnest',
  label: 'Vidnest',
  domain: DOMAIN,
  isPremium: false,
  referrer: `https://${DOMAIN}`,
  getMovieEmbedUrl,
  getTVEmbedUrl,
  probeHealth: async (tmdbId = '299534') => probeProviderUrl(getMovieEmbedUrl(tmdbId)),
};

/**
 * Utility functions for handling URLs and image paths
 *
 * Image CDN: All TMDB and external poster/backdrop URLs are routed through
 * wsrv.nl — a free, Cloudflare-backed image proxy that returns optimized
 * WebP at the requested width. The CDNImage component falls back to the
 * original URL if wsrv.nl ever fails.
 */

const CDN_BASE = 'https://wsrv.nl/';

const SIZE_MAP = {
  thumb: 200,
  poster: 500,
  backdrop: 1280,
} as const;

type ImageKind = 'poster' | 'backdrop' | 'thumb';

/**
 * Wrap an absolute http(s) URL in the wsrv.nl CDN with width + quality + WebP output.
 */
export const cdnize = (absoluteUrl: string, kind: ImageKind = 'poster'): string => {
  if (!absoluteUrl || !absoluteUrl.startsWith('http')) return absoluteUrl;
  // Avoid double-wrapping
  if (absoluteUrl.startsWith(CDN_BASE)) return absoluteUrl;
  const w = SIZE_MAP[kind] ?? SIZE_MAP.poster;
  const params = new URLSearchParams({
    url: absoluteUrl.replace(/^https?:\/\//, ''),
    w: String(w),
    output: 'webp',
    q: '82',
  });
  return `${CDN_BASE}?${params.toString()}`;
};

/**
 * Get image URL with proper fallback. Routes through CDN when possible.
 */
export const getImageUrl = (path: string | null | undefined, type: ImageKind = 'poster'): string => {
  if (!path) {
    return type === 'poster' || type === 'thumb'
      ? 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=500&h=750&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=675&fit=crop&crop=center';
  }

  // TMDB image path format
  if (path.startsWith('/')) {
    const size = type === 'backdrop' ? 'original' : 'w500';
    return cdnize(`https://image.tmdb.org/t/p/${size}${path}`, type);
  }

  // Already a full URL — route through CDN
  if (path.startsWith('http')) {
    return cdnize(path, type);
  }

  return path;
};

/**
 * Normalize content type
 */
export const normalizeContentType = (type: string): string => {
  type = type.toLowerCase();
  if (type === 'movie' || type === 'film') return 'movie';
  if (type === 'tv' || type === 'show' || type === 'series') return 'series';
  if (type === 'anime') return 'anime';
  return type;
};

export const getProviderIcon = (providerId: string): string => {
  switch (providerId) {
    case 'netflix': return '/icons/netflix.png';
    case 'prime_video': return '/icons/prime.png';
    case 'disney_plus': return '/icons/disney.png';
    case 'hbo_max': return '/icons/hbo.png';
    case 'hulu': return '/icons/hulu.png';
    case 'aniwatch': return '/icons/aniwatch.png';
    case 'fmovies': return '/icons/fmovies.png';
    default: return '/icons/play.png';
  }
};

export const formatWatchTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const formatDuration = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

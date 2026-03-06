/**
 * Preload Engine
 * Silently preloads metadata and provider handshakes
 * to reduce first-play buffering time.
 */

import { getAvailableSources, getStreamingUrlForSource, type ProviderOptions } from './providerUtils';
import { cacheSet, cacheGet } from './metadataCache';

const PRELOAD_KEY_PREFIX = 'preload_';
const preloadedUrls = new Set<string>();

/**
 * Preload provider handshake (DNS + connection warmup)
 * Uses <link rel="preconnect"> and invisible fetch
 */
export const preloadProviderHandshake = (sourceNumber: number): void => {
  const sources = [sourceNumber];
  sources.forEach(s => {
    const config = { 1: 'vidrock.net', 2: 'vidnest.fun', 3: 'player.videasy.net', 4: 'vidlink.pro' };
    const domain = config[s as keyof typeof config];
    if (!domain) return;

    // Add preconnect link
    const existing = document.querySelector(`link[href="https://${domain}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // DNS prefetch fallback
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = `https://${domain}`;
      document.head.appendChild(dnsLink);
    }
  });
};

/**
 * Preload all provider handshakes
 */
export const preloadAllHandshakes = (): void => {
  getAvailableSources().forEach(preloadProviderHandshake);
};

/**
 * Preload content metadata from TMDB (stores in cache)
 */
export const preloadMetadata = async (
  contentId: string,
  contentType: string = 'movie'
): Promise<void> => {
  const cacheKey = `${PRELOAD_KEY_PREFIX}${contentType}_${contentId}`;
  if (cacheGet(cacheKey)) return; // Already preloaded

  try {
    // Import dynamically to avoid circular deps
    const { tmdbApi } = await import('@/services/tmdbApi');
    const details = await tmdbApi.getContentDetails(contentId, contentType);
    if (details) {
      cacheSet(cacheKey, details, 30 * 60 * 1000); // 30 min TTL
    }
  } catch {
    // Non-critical
  }
};

/**
 * Preload streaming URL (warm up the iframe URL without rendering)
 */
export const preloadStreamUrl = (
  contentId: string,
  sourceNumber: number,
  options: ProviderOptions = {}
): void => {
  const url = getStreamingUrlForSource(contentId, sourceNumber, options);
  if (preloadedUrls.has(url)) return;
  preloadedUrls.add(url);

  // Use prefetch link for the URL
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
};

/**
 * Preload everything for a content item (metadata + handshakes + URL)
 */
export const preloadContent = async (
  contentId: string,
  contentType: string = 'movie',
  preferredSource: number = 1
): Promise<void> => {
  // Run in parallel
  await Promise.allSettled([
    preloadMetadata(contentId, contentType),
    new Promise<void>(resolve => {
      preloadProviderHandshake(preferredSource);
      preloadStreamUrl(contentId, preferredSource, { contentType });
      resolve();
    }),
  ]);
};

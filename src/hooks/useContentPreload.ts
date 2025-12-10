import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdbApi';
import { mediaCache, MediaCacheConfig } from '@/utils/mediaCache';

// Small local hook to detect if an element is in view using IntersectionObserver
export const useIsInView = (
  ref: React.RefObject<Element>,
  options: { root?: Element | null; rootMargin?: string; threshold?: number } = {}
) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInView(entry.isIntersecting && (entry.intersectionRatio ?? 0) >= (options.threshold ?? 0));
        }
      },
      { root: options.root || null, rootMargin: options.rootMargin || '0px', threshold: options.threshold ?? 0 }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [ref, options.root, options.rootMargin, options.threshold]);

  return isInView;
};

interface PreloadOptions {
  prefetchMetadata?: boolean;
  prefetchImages?: boolean;
  prefetchVideo?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

const defaultConfig: MediaCacheConfig = {
  maxSize: 500, // 500MB
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  priority: 'medium',
};

export const useContentPreload = (
  contentId: string,
  options: PreloadOptions = {},
  active = true
) => {
  const queryClient = useQueryClient();
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortController = useRef<AbortController | null>(null);

  // stable option flags to avoid deep-equality issues in dependency arrays
  const prefetchMetadata = !!options.prefetchMetadata;
  const prefetchImages = !!options.prefetchImages;
  const priority = options.priority || 'medium';

  const preloadMetadata = useCallback(async () => {
    if (!prefetchMetadata) return;

    try {
      // Prefetch content details if available
      if (typeof tmdbApi.getContentDetails === 'function') {
        await queryClient.prefetchQuery({ queryKey: ['content', contentId], queryFn: () => tmdbApi.getContentDetails(contentId) });
      }

      if (typeof tmdbApi.getFeaturedContent === 'function') {
        await queryClient.prefetchQuery({ queryKey: ['related-content', contentId], queryFn: () => Promise.resolve([]) });
      }
    } catch (error) {
      console.error('Failed to preload metadata:', error);
    }
  }, [contentId, prefetchMetadata, queryClient]);

  const preloadImages = useCallback(async () => {
    if (!prefetchImages) return;

    try {
      if (typeof tmdbApi.getContentDetails !== 'function') return;
      const content = (await tmdbApi.getContentDetails(contentId)) as { poster?: string; poster_path?: string; posterPath?: string; backdrop?: string; backdrop_path?: string; backdropPath?: string } | null | undefined;

      const imagesToPreload = [
        content?.poster || content?.poster_path || content?.posterPath,
        content?.backdrop || content?.backdrop_path || content?.backdropPath,
      ].filter(Boolean) as string[];

      await Promise.all(
        imagesToPreload.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          await mediaCache.cacheMedia(url, blob, {
            ...defaultConfig,
            priority,
          });
        })
      );
    } catch (error) {
      console.error('Failed to preload images:', error);
    }
  }, [contentId, prefetchImages, priority]);

  // Video preloading is disabled: TMDB service wrapper does not expose a stable video URL getter.
  // If a future API method (e.g. tmdbApi.getVideoUrl) is added, we can implement streaming prefetch here.

  const cancelPreloading = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const preloadContent = async () => {
      await Promise.all([preloadMetadata(), preloadImages()]);
    };

    preloadContent();

    return () => {
      cancelPreloading();
    };
    // Intentionally list primitive flags to avoid deep compare
  }, [contentId, active, prefetchMetadata, prefetchImages, priority, preloadMetadata, preloadImages, cancelPreloading]);

  return {
    isPreloading,
    progress,
    cancelPreloading,
  };
};

export const useInViewPreload = (
  ref: React.RefObject<Element>,
  contentId: string,
  options: PreloadOptions & { threshold?: number } = {}
) => {
  const isInView = useIsInView(ref, { threshold: options.threshold ?? 0.5, rootMargin: '100px' });

  // Call hook at top level and control activation via the `active` flag
  useContentPreload(contentId, options, isInView);

  return isInView;
};
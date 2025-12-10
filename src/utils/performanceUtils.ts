/**
 * Performance monitoring and optimization utilities
 */

import { analytics } from './analytics';

// Performance metrics storage
const performanceMetrics = {
  pageLoadTime: 0,
  domContentLoaded: 0,
  firstContentfulPaint: 0,
  largestContentfulPaint: 0,
  firstInputDelay: 0,
  cumulativeLayoutShift: 0
};

// Debounce function for search and input optimization
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args as unknown as Parameters<T>), wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args as unknown as Parameters<T>);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading for images
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Setup performance monitoring for Core Web Vitals
 */
// Local small interfaces to avoid `any` casts
type LCPEntry = PerformanceEntry & { element?: { tagName?: string }; };
type FIDEntry = PerformanceEntry & { processingStart?: number };
type CLSEntry = PerformanceEntry & { hadRecentInput?: boolean; value?: number };

export const setupPerformanceMonitoring = () => {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  // Monitor Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1] as PerformanceEntry | undefined;
      if (!lcp) return;
      performanceMetrics.largestContentfulPaint = (lcp as PerformanceEntry & { startTime?: number }).startTime ?? 0;
      
      // Try to safely access element.tagName if present
      const lcpTyped = lcp as LCPEntry | undefined;
      const elementTag = lcpTyped && lcpTyped.element && typeof lcpTyped.element.tagName === 'string' ? lcpTyped.element.tagName : undefined;

      const startTime = lcpTyped?.startTime ?? 0;
      analytics.trackPerformance('LCP', startTime, {
        element: elementTag,
        threshold: startTime > 2500 ? 'poor' : startTime > 1200 ? 'needs-improvement' : 'good'
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Browser doesn't support LCP
  }

  // Monitor First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const entryTyped = entry as FIDEntry;
        const processingStart = entryTyped.processingStart;
        if (typeof processingStart === 'number') {
          const fid = processingStart - entry.startTime;
          performanceMetrics.firstInputDelay = fid;

          analytics.trackPerformance('FID', fid, {
            threshold: fid > 300 ? 'poor' : fid > 100 ? 'needs-improvement' : 'good'
          });
        }
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // Browser doesn't support FID
  }

  // Monitor Cumulative Layout Shift
  try {
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const entryTyped = entry as CLSEntry;
        const hadRecentInput = entryTyped.hadRecentInput;
        const value = entryTyped.value;
        if (!hadRecentInput && typeof value === 'number') {
          clsScore += value;
        }
      });
      
      performanceMetrics.cumulativeLayoutShift = clsScore;
      
      analytics.trackPerformance('CLS', clsScore, {
        threshold: clsScore > 0.25 ? 'poor' : clsScore > 0.1 ? 'needs-improvement' : 'good'
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Browser doesn't support CLS
  }

  // Monitor page load performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    performanceMetrics.pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
    performanceMetrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
    
    analytics.trackPerformance('Page Load Time', performanceMetrics.pageLoadTime);
    analytics.trackPerformance('DOM Content Loaded', performanceMetrics.domContentLoaded);
    analytics.trackPerformance('TTFB', perfData.responseStart - perfData.fetchStart);
  });

  // Page visibility API for performance optimization
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      optimizeVideoMemory();
    } else {
      resumeVideos();
    }
  });

  // Cleanup on beforeunload
  window.addEventListener('beforeunload', cleanupResources);
  
  // Regular cleanup every 5 minutes
  setInterval(cleanupResources, 5 * 60 * 1000);
};

// Memory optimization for video elements
export const optimizeVideoMemory = () => {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.paused && document.hidden) {
      video.pause();
      video.setAttribute('data-was-playing', 'true');
    }
  });
};

// Resume videos when page becomes visible
export const resumeVideos = () => {
  const videos = document.querySelectorAll('video[data-was-playing="true"]');
  videos.forEach(video => {
    const videoElement = video as HTMLVideoElement;
    videoElement.play();
    videoElement.removeAttribute('data-was-playing');
  });
};

/**
 * Clean up resources to prevent memory leaks
 */
export const cleanupResources = () => {
  // Clean up video elements
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.dataset.active) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  });

  // Clean up iframe elements that are not visible
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const rect = iframe.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isVisible && !iframe.dataset.persistent) {
      iframe.src = 'about:blank';
    }
  });

  // Clean up image loading
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 500 && rect.bottom > -500;
    
    if (!isVisible) {
      img.removeAttribute('src');
    }
  });

  // Clear old caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('old-') || cacheName.includes('temp-')) {
          caches.delete(cacheName);
        }
      });
    });
  }

  // Trigger garbage collection if available
  if (window.gc) {
    window.gc();
  }
};

/**
 * Optimize images for current network conditions
 */
export const optimizeImageLoading = () => {
  if ('connection' in navigator) {
  const connection = (navigator as unknown) as { connection?: { effectiveType?: string } };

  if (connection && connection.connection && (connection.connection.effectiveType === '2g' || connection.connection.effectiveType === 'slow-2g')) {
      // Use lower quality images for slow connections
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src.includes('w500')) {
          img.src = img.src.replace('w500', 'w200');
        }
      });
    }
  }
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = () => {
  return { ...performanceMetrics };
};

/**
 * Monitor resource loading
 */
export const monitorResourceLoading = () => {
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Track large resources
        if (resource.transferSize > 1000000) { // > 1MB
          analytics.trackEvent('large_resource_loaded', {
            name: resource.name,
            size: resource.transferSize,
            duration: resource.duration
          });
        }
        
        // Track slow resources
        if (resource.duration > 5000) { // > 5 seconds
          analytics.trackEvent('slow_resource_loaded', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize
          });
        }
      });
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Browser doesn't support resource timing
    }
  }
};
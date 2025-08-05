/**
 * Performance utilities for optimizing app performance
 */

// Debounce function for search and input optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
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

// Clean up unused resources
export const cleanupResources = () => {
  // Remove unused video sources
  const inactiveVideos = document.querySelectorAll('video:not([data-active])');
  inactiveVideos.forEach(video => {
    const videoElement = video as HTMLVideoElement;
    if (videoElement.src) {
      videoElement.src = '';
      videoElement.load();
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
};

// Setup performance monitoring
export const setupPerformanceMonitoring = () => {
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
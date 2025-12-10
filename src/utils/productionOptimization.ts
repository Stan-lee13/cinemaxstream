/**
 * Production optimization utilities
 */

// Performance monitoring
export const initPerformanceMonitoring = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Monitor largest contentful paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];

      // Log LCP metric if > 2.5s (poor threshold)
      if (lcp && lcp.startTime > 2500) {
        try {
          // Lazy import analytics to avoid circular deps
          import('./analytics').then(({ analytics }) => {
            analytics.trackPerformance('LCP', lcp.startTime, { threshold: lcp.startTime > 2500 ? 'poor' : lcp.startTime > 1200 ? 'needs-improvement' : 'good' });
          }).catch(() => {});
        } catch (e) {
          // no-op
        }
      }
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor cumulative layout shift
    const clsObserver = new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        for (const entry of list.getEntries()) {
          // entries may be LayoutShift entries; narrow the type safely
          const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!e.hadRecentInput) {
            cumulativeScore += e.value ?? 0;
          }
        }
      
      // Log CLS metric if > 0.1 (poor threshold)
      if (cumulativeScore > 0.1) {
        try {
          import('./analytics').then(({ analytics }) => {
            analytics.trackPerformance('CLS', cumulativeScore, { threshold: cumulativeScore > 0.25 ? 'poor' : cumulativeScore > 0.1 ? 'needs-improvement' : 'good' });
          }).catch(() => {});
        } catch (e) {
          // no-op
        }
      }
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

// Resource optimization
export const optimizeResources = () => {
  // Preload critical resources
  const criticalResources = [
    '/sw.js',
    // Add other critical resources
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 'fetch';
    document.head.appendChild(link);
  });
};

// Memory management
export const optimizeMemory = () => {
  // Clear inactive video elements
  const inactiveVideos = document.querySelectorAll('video:not([data-active])');
  inactiveVideos.forEach(video => {
    const videoElement = video as HTMLVideoElement;
    if (videoElement.src) {
      videoElement.src = '';
      videoElement.load();
    }
  });
  
  // Clear unused image caches periodically
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

// Network optimization
export const optimizeNetwork = () => {
  // Implement connection-aware loading
  if ('connection' in navigator) {
    // NetworkInformation is not available on all browsers; use a safe typed access
    type NetworkInfo = { effectiveType?: string; saveData?: boolean };
    const connection = (navigator as unknown as { connection?: NetworkInfo }).connection;

    // Reduce quality for slow connections
    if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      document.documentElement.setAttribute('data-connection', 'slow');
    }

    // Enable save-data mode
    if (connection?.saveData) {
      document.documentElement.setAttribute('data-save-data', 'true');
    }
  }
};

// Initialize all optimizations
export const initProductionOptimizations = () => {
  if (import.meta.env.PROD) {
    initPerformanceMonitoring();
    optimizeResources();
    
    // Run memory optimization every 5 minutes
    setInterval(optimizeMemory, 5 * 60 * 1000);
    
    // Run network optimization on load
    optimizeNetwork();
    
    // Import and setup performance monitoring from separate module
    import('./performanceUtils').then(({ setupPerformanceMonitoring }) => {
      setupPerformanceMonitoring();
    });
  }
};
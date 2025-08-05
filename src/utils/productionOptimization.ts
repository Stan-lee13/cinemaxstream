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
      if (lcp.startTime > 2500) {
        // In production, send to analytics
        void 0; // Replace with actual analytics call
      }
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor cumulative layout shift
    const clsObserver = new PerformanceObserver((list) => {
      let cumulativeScore = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeScore += (entry as any).value;
        }
      }
      
      // Log CLS metric if > 0.1 (poor threshold)
      if (cumulativeScore > 0.1) {
        // In production, send to analytics
        void 0; // Replace with actual analytics call
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
    const connection = (navigator as any).connection;
    
    // Reduce quality for slow connections
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      document.documentElement.setAttribute('data-connection', 'slow');
    }
    
    // Enable save-data mode
    if (connection.saveData) {
      document.documentElement.setAttribute('data-save-data', 'true');
    }
  }
};

// Initialize all optimizations
export const initProductionOptimizations = () => {
  if (process.env.NODE_ENV === 'production') {
    initPerformanceMonitoring();
    optimizeResources();
    
    // Run memory optimization every 5 minutes
    setInterval(optimizeMemory, 5 * 60 * 1000);
    
    // Run network optimization on load
    optimizeNetwork();
  }
};
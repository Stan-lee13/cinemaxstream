/**
 * Production optimizations hook
 */

import { useEffect, useCallback } from 'react';
import { getConfig } from '@/utils/productionConfig';
import { analytics } from '@/utils/analytics';
import { contentCache } from '@/utils/cacheManager';
import { cleanupResources } from '@/utils/performanceUtils';

export const useProductionOptimizations = () => {
  const config = getConfig();

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    const criticalPaths = [
      '/sw.js',
      '/manifest.json'
    ];

    criticalPaths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
    });
  }, []);

  // Setup performance monitoring
  const setupPerformanceMonitoring = useCallback(() => {
    if (!config.enablePerformanceMonitoring) {
      return;
    }

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1] as PerformanceEntry;
        
        analytics.trackPerformance('LCP', lcp.startTime, {
          element: (lcp as any).element?.tagName
        });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Browser doesn't support this metric
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          analytics.trackPerformance('FID', (entry as any).processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Browser doesn't support this metric
      }

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        });
        
        analytics.trackPerformance('CLS', clsScore);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support this metric
      }
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      analytics.trackPerformance('Page Load Time', perfData.loadEventEnd - perfData.fetchStart);
      analytics.trackPerformance('DOM Content Loaded', perfData.domContentLoadedEventEnd - perfData.fetchStart);
      analytics.trackPerformance('First Byte', perfData.responseStart - perfData.fetchStart);
    });
  }, [config.enablePerformanceMonitoring]);

  // Setup memory management
  const setupMemoryManagement = useCallback(() => {
    // Clean up resources on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cleanupResources();
        
        // Pause non-critical operations
        contentCache.invalidatePattern(/^temp_/);
      }
    });

    // Clean up before page unload
    window.addEventListener('beforeunload', () => {
      cleanupResources();
    });

    // Periodic cleanup
    const cleanupInterval = setInterval(() => {
      cleanupResources();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Setup network optimizations
  const setupNetworkOptimizations = useCallback(() => {
    // Connection-aware loading
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        // Adjust behavior based on connection type
        const isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
        
        if (isSlowConnection) {
          document.documentElement.setAttribute('data-connection', 'slow');
          
          // Reduce image quality for slow connections
          analytics.trackEvent('slow_connection_detected', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink
          });
        }
        
        // Enable data saver mode
        if (connection.saveData) {
          document.documentElement.setAttribute('data-save-data', 'true');
          
          analytics.trackEvent('data_saver_enabled');
        }
      }
    }
  }, []);

  // Setup intersection observer for lazy loading
  const setupIntersectionObserver = useCallback(() => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observe all images with data-src attribute
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));

      return () => {
        imageObserver.disconnect();
      };
    }
  }, []);

  // Setup service worker for caching
  const setupServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator && config.enablePerformanceMonitoring) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        analytics.trackEvent('service_worker_registered', {
          scope: registration.scope
        });
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          analytics.trackEvent('service_worker_update_found');
        });
        
      } catch (error) {
        analytics.trackError(error as Error, 'Service Worker');
      }
    }
  }, [config.enablePerformanceMonitoring]);

  useEffect(() => {
    // Only run optimizations in production
    if (process.env.NODE_ENV === 'production') {
      preloadCriticalResources();
      setupPerformanceMonitoring();
      setupNetworkOptimizations();
      setupServiceWorker();
      
      const memoryCleanup = setupMemoryManagement();
      const intersectionCleanup = setupIntersectionObserver();
      
      return () => {
        memoryCleanup?.();
        intersectionCleanup?.();
      };
    }
  }, [
    preloadCriticalResources,
    setupPerformanceMonitoring,
    setupMemoryManagement,
    setupNetworkOptimizations,
    setupIntersectionObserver,
    setupServiceWorker
  ]);

  return {
    preloadCriticalResources,
    setupPerformanceMonitoring,
    setupMemoryManagement,
    setupNetworkOptimizations,
    setupIntersectionObserver,
    setupServiceWorker
  };
};
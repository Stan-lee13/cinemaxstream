import { useEffect } from 'react';
import { toast } from 'sonner';
import { initProductionOptimizations } from '@/utils/productionOptimization';

const ProductionMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Monitor for uncaught errors
      const handleError = (event: ErrorEvent) => {
        // Log to external service in production
        const errorData = {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
        };
        
        // In production, send to error tracking service
        // For now, just prevent console pollution
        event.preventDefault();
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        // Handle unhandled promise rejections
        event.preventDefault();
        
        // In production, this would go to error tracking
        const errorData = {
          reason: event.reason,
          timestamp: new Date().toISOString(),
        };
      };

      // Performance monitoring
      const monitorPerformance = () => {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation.loadEventEnd - navigation.loadEventStart > 5000) {
            toast.error('Slow loading detected', {
              description: 'The app is loading slower than expected',
              duration: 3000,
            });
          }
        }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      // Monitor performance after page load
      setTimeout(monitorPerformance, 1000);
      
      // Initialize production optimizations
      initProductionOptimizations();

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return null;
};

export default ProductionMonitor;
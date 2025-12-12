/**
 * Production utilities for performance monitoring and error reporting
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  errorCount: number;
  userInteractions: number;
}

interface ErrorInfo {
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: unknown;
}

class ProductionMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    errorCount: 0,
    userInteractions: 0
  };

  private startTime = performance.now();

  constructor() {
    this.init();
  }

  private init() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now() - this.startTime;
      this.reportMetrics();
    });

    // Monitor errors
    window.addEventListener('error', (event: ErrorEvent) => {
  this.metrics.errorCount++;
  void this.reportError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  this.metrics.errorCount++;
  void this.reportError({
        message: 'Unhandled Promise Rejection',
        error: event.reason
      });
    });

    // Monitor user interactions
    ['click', 'touch', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.metrics.userInteractions++;
      }, { passive: true });
    });
  }

  private reportMetrics() {
    // In production, this would send metrics to analytics service
    // Production: Send metrics to monitoring service
    // Development: Log to console
    if (import.meta.env.DEV) {
      console.log('Performance Metrics:', this.metrics);
    }
  }

  private async reportError(errorInfo: ErrorInfo) {
    // In production, send errors to centralized error reporter if available
    try {
      // Dynamic import to avoid circular dependency at module load time
      const mod = await import('./errorReporting');
      const typed = mod as unknown as { errorReporter?: { captureException?: (e: Error, src?: string) => void } };
      const errorReporter = typed.errorReporter;
      if (errorReporter && typeof errorReporter.captureException === 'function') {
        const err = errorInfo.error instanceof Error ? errorInfo.error : new Error(errorInfo.message || 'Unknown error');
        errorReporter.captureException(err, 'ProductionMonitor');
        return;
      }
    } catch {
      // fall through to console
    }

    // Fallback logging
    if (import.meta.env.DEV) {
      console.error('Production Error:', errorInfo);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measureRenderTime(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
        // Production error handling - no console.log 
        if (import.meta.env.DEV) {
          console.log(`${componentName} render time: ${end - start}ms`);
        }
  }
}

// Initialize production monitor
export const productionMonitor = new ProductionMonitor();

export default ProductionMonitor;
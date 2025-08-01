/**
 * Production utilities for performance monitoring and error reporting
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  errorCount: number;
  userInteractions: number;
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
    window.addEventListener('error', (event) => {
      this.metrics.errorCount++;
      this.reportError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errorCount++;
      this.reportError({
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
    console.log('Performance Metrics:', this.metrics);
  }

  private reportError(errorInfo: any) {
    // In production, this would send errors to monitoring service
    console.error('Production Error:', errorInfo);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measureRenderTime(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`${componentName} render time: ${end - start}ms`);
  }
}

// Initialize production monitor
export const productionMonitor = new ProductionMonitor();

export default ProductionMonitor;
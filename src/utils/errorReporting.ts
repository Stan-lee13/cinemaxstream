/**
 * Production-grade error reporting and monitoring
 */

interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorReporter {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        component: 'Global',
        severity: 'high',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        component: 'Promise',
        severity: 'high',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Handle React errors (if using error boundary)
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.reportError({
        message: event.detail.error.message,
        stack: event.detail.error.stack,
        component: event.detail.component,
        severity: 'critical',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }) as EventListener);
  }

  reportError(error: Partial<ErrorReport>) {
    const fullError: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      component: error.component || 'Unknown',
      userId: this.getCurrentUserId(),
      timestamp: error.timestamp || Date.now(),
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      severity: error.severity || 'medium'
    };

    // Add to local storage
    this.errors.push(fullError);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    this.persistErrors();

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(fullError);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error reported:', fullError);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Get user ID from auth context if available
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private persistErrors() {
    try {
      localStorage.setItem('app-errors', JSON.stringify(this.errors.slice(-10)));
    } catch {
      // Storage quota exceeded or not available
    }
  }

  private async sendToMonitoringService(error: ErrorReport) {
    try {
      // In a real app, this would send to services like Sentry, LogRocket, etc.
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });
    } catch {
      // Fail silently - don't create additional errors
    }
  }

  getRecentErrors(count: number = 10): ErrorReport[] {
    return this.errors.slice(-count);
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('app-errors');
  }

  // Report custom errors from components
  captureException(error: Error, component?: string, severity: ErrorReport['severity'] = 'medium') {
    this.reportError({
      message: error.message,
      stack: error.stack,
      component,
      severity
    });
  }

  // Report custom messages
  captureMessage(message: string, component?: string, severity: ErrorReport['severity'] = 'low') {
    this.reportError({
      message,
      component,
      severity
    });
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// Export convenience functions
export const reportError = (error: Error, component?: string) => {
  errorReporter.captureException(error, component);
};

export const reportMessage = (message: string, component?: string) => {
  errorReporter.captureMessage(message, component);
};

export default errorReporter;

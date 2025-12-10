/**
 * Custom Error Monitoring Service
 * Production-ready error tracking and reporting
 */

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  url?: string;
  userAgent?: string;
}

export interface ErrorReport {
  message: string;
  severity: ErrorSeverity;
  error?: Error | unknown;
  context?: ErrorContext;
  stackTrace?: string;
  fingerprint?: string;
}

class ErrorMonitoringService {
  private errors: ErrorReport[] = [];
  private maxStoredErrors = 100;
  private isProduction = import.meta.env.PROD;

  /**
   * Capture an exception with context
   */
  captureException(
    error: Error | unknown,
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): void {
    const errorReport = this.createErrorReport(error, context, severity);

    // Store error
    this.storeError(errorReport);

    // Log to console in development
    if (!this.isProduction) {
      console.error('[Error Monitoring]', errorReport);
    }

    // Send to backend in production
    if (this.isProduction) {
      this.sendToBackend(errorReport);
    }
  }

  /**
   * Capture a message with context
   */
  captureMessage(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    context?: ErrorContext
  ): void {
    const errorReport: ErrorReport = {
      message,
      severity,
      context: this.enrichContext(context),
      fingerprint: this.generateFingerprint(message)
    };

    this.storeError(errorReport);

    if (!this.isProduction) {
      console.log(`[${severity.toUpperCase()}]`, message, context);
    }

    if (this.isProduction && severity !== ErrorSeverity.DEBUG) {
      this.sendToBackend(errorReport);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, userEmail?: string): void {
    if (typeof window !== 'undefined') {
      (window as any).__errorMonitoringUser = { userId, userEmail };
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (typeof window !== 'undefined') {
      delete (window as any).__errorMonitoringUser;
    }
  }

  /**
   * Get all stored errors (for admin panel)
   */
  getStoredErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    recent: ErrorReport[];
  } {
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: this.errors.length,
      bySeverity,
      recent: this.errors.slice(-10).reverse()
    };
  }

  /**
   * Create error report from error object
   */
  private createErrorReport(
    error: Error | unknown,
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): ErrorReport {
    const message = this.extractErrorMessage(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    return {
      message,
      severity,
      error,
      context: this.enrichContext(context),
      stackTrace,
      fingerprint: this.generateFingerprint(message, stackTrace)
    };
  }

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      const maybeMessage = (error as any).message;
      if (typeof maybeMessage === 'string') {
        return maybeMessage;
      }
    }
    return 'Unknown error occurred';
  }

  /**
   * Enrich context with automatic data
   */
  private enrichContext(context?: ErrorContext): ErrorContext {
    const userContext = typeof window !== 'undefined'
      ? (window as any).__errorMonitoringUser
      : undefined;

    return {
      ...context,
      userId: context?.userId || userContext?.userId,
      userEmail: context?.userEmail || userContext?.userEmail,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
  }

  /**
   * Generate fingerprint for error deduplication
   */
  private generateFingerprint(message: string, stackTrace?: string): string {
    const content = stackTrace
      ? `${message}:${stackTrace.split('\n')[0]}`
      : message;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Store error in memory
   */
  private storeError(errorReport: ErrorReport): void {
    this.errors.push(errorReport);

    // Keep only last N errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }
  }

  /**
   * Send error to backend
   */
  private async sendToBackend(errorReport: ErrorReport): Promise<void> {
    try {
      // In production, send to Supabase edge function or external service
      const response = await fetch('/api/error-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...errorReport,
          error: undefined, // Don't send error object, just message and stack
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        // Fallback: store in localStorage if backend fails
        this.storeInLocalStorage(errorReport);
      }
    } catch (err) {
      // Fallback: store in localStorage
      this.storeInLocalStorage(errorReport);
    }
  }

  /**
   * Store error in localStorage as fallback
   */
  private storeInLocalStorage(errorReport: ErrorReport): void {
    try {
      const stored = localStorage.getItem('error_reports') || '[]';
      const reports = JSON.parse(stored);
      reports.push({
        ...errorReport,
        error: undefined // Don't store error object
      });

      // Keep only last 50 errors
      if (reports.length > 50) {
        reports.shift();
      }

      localStorage.setItem('error_reports', JSON.stringify(reports));
    } catch (err) {
      // If localStorage fails, just ignore
    }
  }
}

// Export singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorMonitoring.captureException(event.error, {
      component: 'GlobalErrorHandler',
      action: 'unhandledError'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorMonitoring.captureException(event.reason, {
      component: 'GlobalErrorHandler',
      action: 'unhandledPromiseRejection'
    });
  });
}

// Convenience exports
export const captureException = errorMonitoring.captureException.bind(errorMonitoring);
export const captureMessage = errorMonitoring.captureMessage.bind(errorMonitoring);
export const setUserContext = errorMonitoring.setUserContext.bind(errorMonitoring);
export const clearUserContext = errorMonitoring.clearUserContext.bind(errorMonitoring);

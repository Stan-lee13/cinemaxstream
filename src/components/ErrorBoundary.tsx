import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorReporter {
  captureException: (error: Error, context?: string, severity?: ErrorSeverity) => void | Promise<void>;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to production error tracking service
    if (typeof window !== 'undefined') {
      const globalWindow = window as Window & { errorReporter?: ErrorReporter };
      if (globalWindow.errorReporter?.captureException) {
        // captureException may return a Promise in some implementations; use void to avoid unhandled promise
        void globalWindow.errorReporter.captureException(error, 'ErrorBoundary', 'critical');
      }
    }
    toast.error('An unexpected error occurred. Please refresh the page.');
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">An unexpected error occurred. Please try refreshing the page.</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
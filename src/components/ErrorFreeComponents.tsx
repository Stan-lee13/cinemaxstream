/**
 * Error-free wrapper components with proper error boundaries and fallbacks
 */
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to production error tracking service
    if (typeof window !== 'undefined') {
      const globalWindow = window as unknown as Window & { errorReporter?: { captureException?: (err: Error, context?: string, severity?: string) => void | Promise<void> } };
      if (globalWindow.errorReporter?.captureException) {
        void globalWindow.errorReporter.captureException(error, 'ComponentError', 'high');
      }
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show user-friendly toast
    toast.error('Something went wrong. Please refresh the page.');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe component wrapper for potentially problematic components
export const SafeComponent = ({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <ComponentErrorBoundary fallback={fallback}>
    {children}
  </ComponentErrorBoundary>
);

// Safe image component with error handling
export const SafeImage = ({
  src,
  alt,
  fallback = 'https://images.unsplash.com/photo-1489599767810-b49fa91cd65b?w=300&h=450&fit=crop&crop=center',
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
} & { [key: string]: unknown }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        {...props}
      />
    </div>
  );
};
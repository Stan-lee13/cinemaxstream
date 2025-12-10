
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { initResponsiveUtils } from './utils/responsiveUtils';
import { initProductionOptimizations } from './utils/productionOptimization';
import { initProductionReadiness } from './utils/productionReadiness';
import { errorReporter } from './utils/errorReporting';
import { getConfig } from './utils/productionConfig';

// Get production configuration
const config = getConfig();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: config.maxRetries,
      refetchOnWindowFocus: false,
      staleTime: config.cacheTimeout,
      gcTime: config.cacheTimeout * 2,
    },
    mutations: {
      retry: config.maxRetries,
    },
  },
});

// Initialize production systems
initProductionOptimizations();
initResponsiveUtils();
initProductionReadiness();

// Initialize error reporting
if (config.enableErrorReporting) {
  // Error reporter is auto-initialized in its constructor
  errorReporter.captureMessage('Application initialized', 'Main', 'low');
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        // Service worker registered successfully
      })
      .catch(() => {
        // Service worker registration failed - silently handle
      });
  });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

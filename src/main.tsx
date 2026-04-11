
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './hooks/themeProvider';
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

// Register service worker (skip in iframe/preview to avoid cache issues)
const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
const isPreviewHost = window.location.hostname.includes('id-preview--') || window.location.hostname.includes('lovableproject.com');

if ('serviceWorker' in navigator && !isInIframe && !isPreviewHost) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
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
        <ThemeProvider>
          <App />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

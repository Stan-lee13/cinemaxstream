
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { initResponsiveUtils } from './utils/responsiveUtils';
import { initProductionOptimizations } from './utils/productionOptimization';
import { initProductionReadiness } from './utils/productionReadiness';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize production optimizations and responsive utilities
initProductionOptimizations();
initResponsiveUtils();
initProductionReadiness();

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
  <React.StrictMode>
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
  </React.StrictMode>
);

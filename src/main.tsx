
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, requestNotificationPermission } from './utils/notificationUtils.ts';
import { Toaster } from 'sonner';

// Initialize service worker for notifications
registerServiceWorker()
  .then(() => {
    console.log('Service worker registered successfully');
    // Don't request permission automatically - let user manually enable it
  })
  .catch(error => {
    console.error('Failed to register service worker:', error);
  });

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  </React.StrictMode>
);

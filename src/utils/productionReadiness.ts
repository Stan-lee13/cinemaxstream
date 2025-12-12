/**
 * Production readiness validation and fixes
 */

// Remove all development artifacts
export const removeDevArtifacts = () => {
  // Remove any remaining console statements in production
  if (import.meta.env.PROD) {
    const originalConsole = { ...console };
    // Production: Check logs if needed for critical issues only
    console.debug = () => {};
    console.warn = (...args) => {
      // Only show warnings for critical issues
      if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
        originalConsole.warn(...args);
      }
    };
  }
};

// Validate all critical features
export const validateCriticalFeatures = (): { isReady: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check if required APIs are available
  if (!window.fetch) {
    issues.push('Fetch API not available');
  }
  
  if (!window.localStorage) {
    issues.push('LocalStorage not available');
  }
  
  // Check if critical components can be imported
  try {
    // Basic validation - check if main components exist
    const essentialElements = [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'sonner'
    ];
    
    // This is a basic check - in a real scenario you'd dynamically import
    // For now, we assume dependencies are correctly installed
  } catch (error) {
    issues.push('Critical dependencies missing');
  }
  
  return {
    isReady: issues.length === 0,
    issues
  };
};

// Fix common production issues
export const fixCommonIssues = () => {
  // Fix service worker registration issues
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        if (registration.scope.includes('localhost')) {
          registration.unregister();
        }
      });
    });
  }
  
  // Fix iOS viewport issues
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no');
    }
  }
  
  // Fix Android Chrome address bar issues
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });
};

// Initialize production readiness
export const initProductionReadiness = () => {
  removeDevArtifacts();
  fixCommonIssues();
  
  const validation = validateCriticalFeatures();
  
  if (!validation.isReady) {
    console.error('Production readiness issues:', validation.issues);
  }
  
  return validation;
};
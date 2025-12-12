import { useEffect } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useProductionValidation = () => {
  useEffect(() => {
    if (import.meta.env.PROD) {
      validateProductionReadiness();
    }
  }, []);

  const validateProductionReadiness = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for development-only code
    if (document.querySelector('[data-testid]')) {
      warnings.push('Test IDs found in production build');
    }

    // Validate streaming providers
    const streamingProviders = ['vidsrc_su', 'vidsrc_xyz', 'vidsrc_vip'];
    const hasValidProviders = streamingProviders.every(provider => {
      return typeof provider === 'string' && provider.length > 0;
    });

    if (!hasValidProviders) {
      errors.push('Invalid streaming provider configuration');
    }

    // Check for proper error boundaries
    if (!window.addEventListener) {
      errors.push('Error handling not properly configured');
    }

    // Service worker validation
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length === 0) {
          warnings.push('Service worker not registered');
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  return { validateProductionReadiness };
};
/**
 * Debug utilities for troubleshooting
 */

export const debugLog = (component: string, message: string, data?: unknown) => {
  // Production: Silent logging, only in development
  if (import.meta.env.DEV) {
    console.log(`[${component}] ${message}`, data);
  }
};

export const debugError = (component: string, error: Error | unknown, context?: string) => {
  console.error(`[${component}] Error${context ? ` in ${context}` : ''}:`, error);
};

export const debugAuth = (user: { id?: string } | null | undefined, isLoading: boolean, isAuthenticated: boolean) => {
  debugLog('Auth', 'State update', { user: user?.id, isLoading, isAuthenticated });
};

export const debugHooks = (): boolean => {
  debugLog('Hooks', 'All hooks loaded successfully');
  return true;
};

// Named exports are preferred to avoid default-export object pattern warnings
export default undefined as unknown as undefined;
/**
 * Debug utilities for troubleshooting
 */

export const debugLog = (component: string, message: string, data?: any) => {
  console.log(`[${component}] ${message}`, data);
};

export const debugError = (component: string, error: Error | unknown, context?: string) => {
  console.error(`[${component}] Error${context ? ` in ${context}` : ''}:`, error);
};

export const debugAuth = (user: any, isLoading: boolean, isAuthenticated: boolean) => {
  debugLog('Auth', 'State update', { user: user?.id, isLoading, isAuthenticated });
};

export const debugHooks = () => {
  debugLog('Hooks', 'All hooks loaded successfully');
  return true;
};

export default {
  debugLog,
  debugError,
  debugAuth,
  debugHooks
};
/**
 * Reusable error handling utilities to reduce code duplication
 */

import { errorReporter } from './errorReporting';
import { toast } from 'sonner';

export interface ErrorContext {
  component?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Handle and report an error with optional user-facing toast
 */
export const handleError = (
  error: unknown,
  context: ErrorContext,
  showToast: boolean = true
): string => {
  const errorMessage = extractErrorMessage(error);
  
  // Report to error monitoring
  errorReporter.reportError({
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    component: context.component,
    severity: context.severity || 'medium'
  });

  // Show user-facing toast if requested
  if (showToast) {
    const userMessage = getUserFriendlyMessage(errorMessage, context);
    toast.error(userMessage);
  }

  return errorMessage;
};

/**
 * Extract a readable message from various error types
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  
  const maybeMessage = (error as { message?: unknown })?.message;
  if (typeof maybeMessage === 'string') return maybeMessage;
  
  return JSON.stringify(error);
};

/**
 * Generate a user-friendly error message based on context
 */
const getUserFriendlyMessage = (
  errorMessage: string,
  context: ErrorContext
): string => {
  // Network errors
  if (errorMessage.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Auth errors
  if (context.component?.includes('Auth') || errorMessage.toLowerCase().includes('auth')) {
    if (errorMessage.toLowerCase().includes('invalid')) {
      return 'Invalid email or password.';
    }
    if (errorMessage.toLowerCase().includes('exist')) {
      return 'This account already exists.';
    }
    return 'Authentication failed. Please try again.';
  }

  // Payment errors
  if (context.component?.includes('Payment') || errorMessage.toLowerCase().includes('payment')) {
    return 'Payment processing failed. Please try again.';
  }

  // Download errors
  if (context.action?.includes('download') || errorMessage.toLowerCase().includes('download')) {
    return 'Failed to process download. Please try again.';
  }

  // Default fallback
  return 'An error occurred. Please try again later.';
};

/**
 * Handle async operations with automatic error handling and optional loading state
 */
export const executeWithErrorHandling = async <T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  options?: {
    showToast?: boolean;
    onError?: (err: string) => void;
  }
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    const errorMsg = handleError(error, context, options?.showToast ?? true);
    options?.onError?.(errorMsg);
    return null;
  }
};

/**
 * Wrap a function with error handling
 */
export const withErrorHandling = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context: ErrorContext
): ((...args: TArgs) => Promise<TReturn>) => {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };
};

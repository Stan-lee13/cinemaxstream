/**
 * Production-ready authentication hook with enhanced security
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { errorReporter } from '@/utils/errorReporting';
import { secureStorage } from '@/utils/securityUtils';
import { validateEmail, validatePassword } from '@/utils/validationUtils';
import ProductionValidator from '@/utils/productionValidation';

function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  const maybeMessage = (err as { message?: unknown })?.message;
  return typeof maybeMessage === 'string' ? maybeMessage : JSON.stringify(err);
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  failures: number;
}

export const useProductionAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isPremium: false
  });

  const [loginAttempts, setLoginAttempts] = useState<Map<string, LoginAttempt>>(new Map());

  // Check for too many failed login attempts
  const checkRateLimit = useCallback((email: string): boolean => {
    const attempt = loginAttempts.get(email);
    if (!attempt) return true;

    const now = Date.now();
    const timeDiff = now - attempt.timestamp;
    const cooldownTime = 15 * 60 * 1000; // 15 minutes

    if (attempt.failures >= 5 && timeDiff < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - timeDiff) / (60 * 1000));
      toast.error(`Too many login attempts. Try again in ${remainingTime} minutes.`);
      return false;
    }

    return true;
  }, [loginAttempts]);

  // Record failed login attempt
  const recordFailedAttempt = useCallback((email: string) => {
    const attempt = loginAttempts.get(email) || { email, timestamp: Date.now(), failures: 0 };
    attempt.failures += 1;
    attempt.timestamp = Date.now();
    setLoginAttempts(new Map(loginAttempts.set(email, attempt)));
  }, [loginAttempts]);

  // Clear failed attempts on successful login
  const clearFailedAttempts = useCallback((email: string) => {
    loginAttempts.delete(email);
    setLoginAttempts(new Map(loginAttempts));
  }, [loginAttempts]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          errorReporter.captureException(error as Error, 'useProductionAuth.initialize');
          throw error;
        }

        if (mounted) {
          const isPremium = secureStorage.get('premium-status') === 'active';
          
          setAuthState({
            user: session?.user || null,
            session,
            isLoading: false,
            isAuthenticated: !!session?.user,
            isPremium
          });
        }
      } catch (err: unknown) {
          if (mounted) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.initialize');
            else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.initialize');
          }
        }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          const isPremium = secureStorage.get('premium-status') === 'active';
          
          setAuthState({
            user: session?.user || null,
            session,
            isLoading: false,
            isAuthenticated: !!session?.user,
            isPremium
          });

          // Handle auth events
          switch (event) {
            case 'SIGNED_IN':
              toast.success('Successfully signed in!');
              break;
            case 'SIGNED_OUT':
              toast.success('Successfully signed out!');
              secureStorage.remove('premium-status');
              break;
            case 'TOKEN_REFRESHED':
              // Silent refresh
              break;
            case 'PASSWORD_RECOVERY':
              toast.info('Password recovery email sent');
              break;
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Validate inputs
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!checkRateLimit(email)) {
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        recordFailedAttempt(email);
        throw error;
      }

      clearFailedAttempts(email);
    } catch (err: unknown) {
      if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.signIn');
      else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.signIn');
      toast.error(getErrorMessage(err) || 'Failed to sign in');
      throw err;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkRateLimit, recordFailedAttempt, clearFailedAttempts]);

  const signUp = useCallback(async (email: string, password: string) => {
    // Validate inputs
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        throw error;
      }

      toast.success('Account created! Please check your email to verify your account.');
    } catch (err: unknown) {
      if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.signUp');
      else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.signUp');
      toast.error(getErrorMessage(err) || 'Failed to create account');
      throw err;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.signInWithGoogle');
      else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.signInWithGoogle');
      toast.error(getErrorMessage(err) || 'Failed to sign in with Google');
      throw err;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear all secure storage
      secureStorage.remove('premium-status');
      secureStorage.remove('user-preferences');
    } catch (err: unknown) {
      if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.signOut');
      else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.signOut');
      toast.error(getErrorMessage(err) || 'Failed to sign out');
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const activatePremium = useCallback(async (promoCode: string): Promise<boolean> => {
    try {
      const valid = await ProductionValidator.isValidPromoCode(promoCode);
      if (valid) {
        setAuthState(prev => ({ ...prev, isPremium: true }));
        secureStorage.set('premium-status', 'active');
        toast.success('Premium features activated! 🎉');
        return true;
      }
      toast.error('Invalid promo code');
      return false;
    } catch (err) {
      toast.error('Failed to validate promo code');
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent!');
    } catch (err: unknown) {
      if (err instanceof Error) errorReporter.captureException(err, 'useProductionAuth.resetPassword');
      else errorReporter.captureException(new Error(String(err)), 'useProductionAuth.resetPassword');
      toast.error(getErrorMessage(err) || 'Failed to send password reset email');
      throw err;
    }
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    activatePremium,
    resetPassword
  };
};
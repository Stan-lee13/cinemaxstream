import { useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logError } from '@/utils/productionLogger';
import { getErrorMessage as getErrorMsg } from '@/utils/errorHelpers';
import { AuthContext } from './authContextBase';
import { validatePremiumCode } from '@/utils/authUtils';
import { registerDevice } from '@/utils/providers/deviceTracker';
import { startHealthMonitor, stopHealthMonitor } from '@/utils/providers/streamHealthMonitor';
import { preloadAllHandshakes } from '@/utils/providers/preloadEngine';
import { startReleaseRadarEngine, stopReleaseRadarEngine } from '@/services/releaseRadarEngine';
import { startTorrentConversionWorker, stopTorrentConversionWorker } from '@/services/torrentConversionWorker';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Production error handling - capture for monitoring
          return;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          
          // Check blocked & premium status from database
          if (currentSession?.user) {
            checkBlockedStatus(currentSession.user.id);
            checkPremiumStatus(currentSession.user.id);
            registerDevice(currentSession.user.id);
            startHealthMonitor(currentSession.user.id);
            startReleaseRadarEngine();
            startTorrentConversionWorker();
            preloadAllHandshakes();
          }
        }
      } catch (err: unknown) {
        // Production error handling - capture for monitoring
        logError(getErrorMessage(err));
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Auth state changed
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          
          // Only show sign-in toast for actual sign-in events, not session restores
          if (event === 'SIGNED_IN' && currentSession?.user) {
            // Defer checks to avoid auth state change deadlock
            setTimeout(() => {
              checkBlockedStatus(currentSession.user.id);
              checkPremiumStatus(currentSession.user.id);
              registerDevice(currentSession.user.id);
              startHealthMonitor(currentSession.user.id);
              startReleaseRadarEngine();
              startTorrentConversionWorker();
              preloadAllHandshakes();
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
            setIsPremium(false);
            setIsBlocked(false);
            stopHealthMonitor();
            stopReleaseRadarEngine();
            stopTorrentConversionWorker();
          } else if (event === 'TOKEN_REFRESHED') {
            // Token refreshed
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is blocked
  const checkBlockedStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data) {
        setIsBlocked(true);
        // Sign them out
        await supabase.auth.signOut();
        toast.error('Your account has been suspended. Please contact support.');
      } else {
        setIsBlocked(false);
      }
    } catch {
      setIsBlocked(false);
    }
  };

  // Check premium status from database
  const checkPremiumStatus = async (userId: string) => {
    try {
      // Check user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'premium')
        .maybeSingle();
      
      if (roleData) {
        setIsPremium(true);
        return;
      }
      
      // Check subscription expiry
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_expires_at')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile?.subscription_expires_at) {
        const expiryDate = new Date(profile.subscription_expires_at);
        setIsPremium(expiryDate > new Date());
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      setIsPremium(false);
    }
  };

  const activatePremium = async (promoCode: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in first');
      return false;
    }
    
    try {
      const isValid = await validatePremiumCode(promoCode);
      
      if (!isValid) {
        toast.error('Invalid or expired promo code');
        return false;
      }

      setIsPremium(true);
      
      toast.success('Premium activated successfully!');
      return true;
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg || 'Error activating premium');
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      // Show success toast only on successful sign-in
      toast.success('Successfully signed in!');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      // Production error handling - no console.error
      toast.error(msg || 'Error signing in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      // Production error handling - no console.error
      toast.error(msg || 'Error signing in with Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully!');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      // Production error handling - no console.error
      toast.error(msg || 'Error creating account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Signed out successfully');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      // Production error handling - no console.error
      toast.error(msg || 'Error signing out');
    } finally {
      setIsLoading(false);
    }
  };

  function getErrorMessage(err: unknown): string {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    const maybeMessage = (err as { message?: unknown })?.message;
    return typeof maybeMessage === 'string' ? maybeMessage : JSON.stringify(err);
  }

  const value = {
    user: isBlocked ? null : user,
    session: isBlocked ? null : session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isAuthenticated: !!user && !isBlocked,
    
    isPremium,
    activatePremium,
    isBlocked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export useAuth hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logError } from '@/utils/productionLogger';
import { getErrorMessage } from '@/utils/errorHelpers';
import { AuthContext } from './authContextBase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

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
          
          // Check premium status from database
          if (currentSession?.user) {
            checkPremiumStatus(currentSession.user.id);
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
          
          if (event === 'SIGNED_IN') {
            toast.success('Successfully signed in!');
            if (currentSession?.user) {
              // Defer premium check to avoid auth state change deadlock
              setTimeout(() => checkPremiumStatus(currentSession.user.id), 0);
            }
          } else if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
            setIsPremium(false);
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
      // Validate promo code exists, is active, and hasn't reached max uses
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();
      
      if (promoError || !promoData) {
        toast.error('Invalid or inactive promo code');
        return false;
      }
      
      // Check max uses
      if (promoData.current_uses >= promoData.max_uses) {
        toast.error('This promo code has reached its usage limit');
        return false;
      }
      
      // Check expiry
      if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        toast.error('This promo code has expired');
        return false;
      }
      
      // Add/update user to premium role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'premium',
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (roleError) {
        logError(`Failed to grant premium role: ${roleError.message}`);
        toast.error('Failed to activate premium');
        return false;
      }
      
      // Update profile subscription expiry (30 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'premium',
          subscription_expires_at: expiryDate.toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) {
        logError(`Failed to update profile subscription: ${profileError.message}`);
        toast.error('Failed to activate premium');
        return false;
      }
      
      // Record usage in promo_code_usage table
      const { error: usageError } = await supabase
        .from('promo_code_usage')
        .insert({
          promo_code_id: promoData.id,
          user_id: user.id
        });
      
      if (usageError) {
        logError(`Failed to record promo code usage: ${usageError.message}`);
        // Don't fail the whole transaction, user got premium anyway
      }
      
      // Increment current_uses count
      const { error: updateCodeError } = await supabase
        .from('promo_codes')
        .update({ 
          current_uses: promoData.current_uses + 1
        })
        .eq('id', promoData.id);
      
      if (updateCodeError) {
        logError(`Failed to update promo code usage count: ${updateCodeError.message}`);
        // Don't fail the whole transaction, user got premium anyway
      }
      
      // Update local state
      setIsPremium(true);
      toast.success('Premium activated successfully! Enjoy unlimited access.');
      return true;
      
    } catch (error) {
      logError(`Promo code activation error: ${getErrorMessage(error)}`);
      toast.error('Error activating premium. Please try again.');
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
      
      toast.success('Signed in successfully');
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
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isAuthenticated: !!user,
    
    isPremium,
    activatePremium
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
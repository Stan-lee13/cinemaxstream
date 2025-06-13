
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandler';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  signInAsTestUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          const isGoogleSignInAttempt = sessionStorage.getItem('isGoogleSignIn') === 'true';
          // Check user details to confirm it's a Google sign-in,
          // user.app_metadata.provider might exist.
          if (isGoogleSignInAttempt && currentSession?.user?.app_metadata?.provider === 'google') {
            toast.success('Signed in with Google successfully!');
            sessionStorage.removeItem('isGoogleSignIn'); // Clean up the flag
          }
          // Note: Other sign-in methods (email/password, test user) have their own toasts.
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Signed in successfully');
    } catch (error) {
      handleError(error, 'Error signing in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsTestUser = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ 
        email: "stanleyvic13@gmail.com", 
        password: "Stanley123" 
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Signed in as test user successfully');
    } catch (error) {
      handleError(error, 'Error signing in as test user.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      sessionStorage.setItem('isGoogleSignIn', 'true'); // Set flag before redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        sessionStorage.removeItem('isGoogleSignIn'); // Clean up flag on immediate error
        throw error;
      }
      // If signInWithOAuth proceeds to redirect, isLoading will be effectively true until re-initialization.
      // If it doesn't redirect for some reason AND doesn't error, then finally block runs.
    } catch (error) {
      sessionStorage.removeItem('isGoogleSignIn'); // Clean up flag on error first
      handleError(error, 'Error signing in with Google. Please try again.');
      throw error; // Re-throw to allow further error handling if needed
    } finally {
      // For OAuth, isLoading is typically managed by page reload.
      // However, if an immediate error occurs BEFORE redirect, we need to reset it.
      // The catch block handles this by re-setting isLoading if error is thrown.
      // If there's no error and no redirect (very unlikely for OAuth), then this will run.
      // For Google OAuth, a successful call to signInWithOAuth means a redirect is happening,
      // so the setIsLoading(false) here might not be hit before the page unloads.
      // The main isLoading is reset by onAuthStateChange or getSession after redirect.
      // We only set it to false here if an error occurred and was caught.
      // The `throw error` will prevent this finally's setIsLoading(false) from running if an error occurs,
      // so we need to ensure it's set to false in the catch.
      // Let's ensure isLoading is false if an error occurs and is caught.
      // The existing catch block doesn't explicitly set it back to false, relying on the finally.
      // This should be: if an error occurs, it's caught, flag removed, toast shown, error rethrown.
      // The 'finally' block will then execute.
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created! Check your email for confirmation');
    } catch (error) {
      handleError(error, 'Error creating account. Please try again.');
      throw error;
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
    } catch (error) {
      handleError(error, 'Error signing out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isAuthenticated: !!user,
    signInAsTestUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;

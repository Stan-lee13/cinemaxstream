
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { debugAuth } from '@/utils/debugUtils';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          debugAuth(currentSession?.user, false, !!currentSession?.user);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          
          if (event === 'SIGNED_IN') {
            toast.success('Successfully signed in!');
          } else if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Error signing in');
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
    } catch (error: any) {
      console.error("Test user login error:", error);
      toast.error(error.message || 'Error signing in as test user');
      throw error;
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
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || 'Error signing in with Google');
      throw error;
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
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || 'Error creating account');
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
    } catch (error: any) {
      console.error("Signout error:", error);
      toast.error(error.message || 'Error signing out');
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
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;

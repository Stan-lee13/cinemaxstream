
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthForm = (initialMode: 'login' | 'signup' = 'login') => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };
  
  const handleEmailAuth = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        toast.success("Logged in successfully!");
        // Redirect to home/dashboard
        navigate('/');
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        if (error) {
          throw error;
        }
        
        // Check if email confirmation is required
        if (data.user && data.user.identities?.length === 0) {
          toast("Please check your email to confirm your account.");
        } else {
          toast.success("Account created successfully!");
          // Redirect to home/dashboard
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    mode,
    isLoading,
    toggleMode,
    handleEmailAuth,
    handleGoogleAuth,
  };
};

export default useAuthForm;

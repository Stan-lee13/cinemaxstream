
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { handleError } from '@/utils/errorHandler';

export const useAuthForm = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // For backward compatibility
  const isSignUp = mode === 'signup';
  const setIsSignUp = (value: boolean) => setMode(value ? 'signup' : 'login');

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleEmailAuth(email, password);
  };

  const handleEmailAuth = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Sign up successful! Please check your email to verify your account.');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error) {
      handleError(error, mode === 'signup' ? 'Sign up failed. Please try again.' : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      handleError(error, 'Google sign-in failed. Please try again.');
      // Ensure isLoading is set to false in case of Google Auth error,
      // as the finally block might not be present or run if error is rethrown.
      setIsLoading(false);
    }
  };
  
  const handleGuestAccess = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      toast.success('Logged in as guest');
      navigate('/');
    } catch (error) {
      handleError(error, 'Guest access failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fillTestAccount = () => {
    setEmail('test@example.com');
    setPassword('password123');
  };

  // Add handleGoogleSignIn alias for backward compatibility
  const handleGoogleSignIn = handleGoogleAuth;

  return {
    mode,
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isSignUp,
    setIsSignUp,
    toggleMode,
    handleSubmit,
    handleEmailAuth,
    handleGoogleAuth,
    handleGuestAccess,
    fillTestAccount,
    handleGoogleSignIn // Add this alias to fix the error
  };
};

export default useAuthForm;

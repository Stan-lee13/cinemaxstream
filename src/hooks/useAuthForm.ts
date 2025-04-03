
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthState";
import { toast } from "sonner";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created successfully! Please check your email for verification.");
        // Auto switch to sign in mode after successful signup
        setIsSignUp(false);
        // Pre-fill the email field
        // Don't clear the password to make it easier to sign in immediately
      } else {
        await signIn(email, password);
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Redirect happens automatically
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error(error.message || "Google authentication failed");
      setIsLoading(false);
    }
  };
  
  const handleGuestAccess = () => {
    localStorage.setItem('guest_access', 'true');
    toast.success("Logged in as guest. You have access to premium content.");
    navigate("/");
  };
  
  // Auto-fill the test account
  const fillTestAccount = () => {
    setEmail("stanleyvic13@gmail.com");
    setPassword("Stanley123");
    setIsSignUp(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    isSignUp,
    setIsSignUp,
    handleSubmit,
    handleGoogleSignIn,
    handleGuestAccess,
    fillTestAccount
  };
};

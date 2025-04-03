
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuthState";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, ArrowLeft, UserCog } from "lucide-react";
import BackButton from "@/components/BackButton";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 relative">
        <BackButton className="mb-6" />
        
        <div className="max-w-md mx-auto mt-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-400">
              {isSignUp 
                ? "Sign up to access all features and premium content" 
                : "Sign in to continue to your account"}
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              {!isSignUp && (
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm text-cinemax-500 hover:underline px-0 h-auto"
                    onClick={fillTestAccount}
                  >
                    Use Test Account
                  </Button>
                  <Link to="/reset-password" className="text-sm text-cinemax-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-cinemax-500 hover:bg-cinemax-600 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                ) : isSignUp ? (
                  <>
                    <UserPlus size={16} />
                    <span>Sign Up</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-4 grid gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                <span>Google</span>
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGuestAccess}
                className="gap-2"
              >
                <UserCog size={16} />
                <span>Continue as Guest</span>
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-cinemax-500 hover:underline"
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-cinemax-500 hover:underline"
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

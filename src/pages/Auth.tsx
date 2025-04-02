
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuthState";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Just for demo purposes - allow bypass login
  const handleBypassLogin = () => {
    toast.success("Accessing as guest user");
    localStorage.setItem('guest_access', 'true');
    navigate('/');
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // No navigation needed here as the OAuth flow will handle it
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="p-2" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to CinemaxStream</h1>
          <p className="text-gray-400 text-center mb-8">Sign in to access premium content</p>

          <div className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full py-6 text-base"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/70"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/70"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-cinemax-500 hover:bg-cinemax-600 py-6 text-base"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-gray-400 hover:text-white"
                onClick={handleBypassLogin}
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

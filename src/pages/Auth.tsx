
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthState";
import { useAuthForm } from "@/hooks/useAuthForm";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import AlternateLoginOptions from "@/components/auth/AlternateLoginOptions";
import AuthToggle from "@/components/auth/AuthToggle";
import BackButton from "@/components/BackButton";

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useAuthForm();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
            <EmailPasswordForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isLoading={isLoading}
              isSignUp={isSignUp}
              handleSubmit={handleSubmit}
              fillTestAccount={fillTestAccount}
            />
            
            <AlternateLoginOptions
              isLoading={isLoading}
              handleGoogleSignIn={handleGoogleSignIn}
              handleGuestAccess={handleGuestAccess}
            />
            
            <AuthToggle
              isSignUp={isSignUp}
              setIsSignUp={setIsSignUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

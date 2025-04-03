
import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/hooks/useAuthState";

interface EmailPasswordFormProps {
  isSignUp: boolean;
}

const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({ isSignUp }) => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    showPassword, 
    setShowPassword, 
    isLoading,
    handleSubmit,
    fillTestAccount
  } = useAuthForm();
  
  const { signInAsTestUser } = useAuth(); // Add this
  const navigate = useNavigate();

  return (
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
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          {!isSignUp && (
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="text-xs text-cinemax-400 hover:text-cinemax-300 focus:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={isSignUp ? "Create a password" : "Enter your password"}
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-cinemax-500 hover:bg-cinemax-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
        ) : isSignUp ? (
          "Create Account"
        ) : (
          "Sign In"
        )}
      </Button>
      
      {!isSignUp && (
        <div className="space-y-3">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => fillTestAccount()}
          >
            Use Test Account
          </Button>
          
          <Button 
            type="button" 
            variant="secondary" 
            className="w-full"
            onClick={() => signInAsTestUser()} // Add this button
          >
            Quick Login as Test User
          </Button>
        </div>
      )}
    </form>
  );
};

export default EmailPasswordForm;


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn } from "lucide-react";

interface EmailPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
  isSignUp: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  fillTestAccount: () => void;
}

const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  isSignUp,
  handleSubmit,
  fillTestAccount,
}) => {
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
  );
};

export default EmailPasswordForm;

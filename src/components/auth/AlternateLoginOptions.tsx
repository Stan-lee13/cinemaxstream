import React from "react";
import { Button } from "@/components/ui/button";
import { UserCog, Chrome } from "lucide-react";

interface AlternateLoginOptionsProps {
  isLoading: boolean;
  handleGoogleSignIn: () => Promise<void>;
  handleGuestAccess: () => void;
}

const AlternateLoginOptions: React.FC<AlternateLoginOptionsProps> = ({
  isLoading,
  handleGoogleSignIn,
  handleGuestAccess,
}) => {
  return (
    <>
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
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <Chrome className="h-4 w-4" />
          <span>Google</span>
        </Button>
        
        <Button 
          type="button" 
          onClick={handleGuestAccess}
          className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <UserCog className="h-4 w-4" />
          <span>Continue as Guest</span>
        </Button>
      </div>
    </>
  );
};

export default AlternateLoginOptions;
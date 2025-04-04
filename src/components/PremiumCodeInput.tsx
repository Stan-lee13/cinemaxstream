
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { enterPremiumCode, hasPremiumAccess } from "@/utils/videoUtils";
import { Loader2 } from "lucide-react";

interface PremiumCodeInputProps {
  onSuccess?: () => void;
}

const PremiumCodeInput = ({ onSuccess }: PremiumCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  
  useEffect(() => {
    // Check if user already has premium access
    const checkPremiumStatus = () => {
      const premium = hasPremiumAccess();
      setHasPremium(premium);
    };
    
    checkPremiumStatus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter a premium code");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const isValid = enterPremiumCode(code);
      
      if (isValid) {
        toast.success("Premium access granted!");
        setHasPremium(true);
        if (onSuccess) onSuccess();
      } else {
        toast.error("Invalid premium code. Please try again.");
      }
      
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (hasPremium) {
    return (
      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h3 className="text-lg font-bold text-green-400 mb-2">Premium Access Activated</h3>
        <p className="text-gray-300">You already have premium access. Enjoy all premium content!</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter premium code"
          className="bg-gray-800 border-gray-700 focus:border-cinemax-500"
          disabled={isSubmitting}
          autoComplete="off"
          autoFocus
        />
      </div>
      
      <Button 
        type="submit"
        className="bg-cinemax-500 hover:bg-cinemax-600 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Unlock Premium"
        )}
      </Button>
      
      <div className="text-center text-sm text-gray-400">
        <p>Valid codes: PREMIUM123, NETFLIX2025, CINEMAX2025</p>
      </div>
    </form>
  );
};

export default PremiumCodeInput;

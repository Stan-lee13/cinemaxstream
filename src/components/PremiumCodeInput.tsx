
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";

interface PremiumCodeInputProps {
  onSuccess?: () => void;
}

const PremiumCodeInput = ({ onSuccess }: PremiumCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) return;
      
      try {
        // Check user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'premium')
          .maybeSingle();
        
        if (roleData) {
          setHasPremium(true);
          return;
        }
        
        // Check subscription expiry
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_expires_at')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.subscription_expires_at) {
          const expiryDate = new Date(profile.subscription_expires_at);
          setHasPremium(expiryDate > new Date());
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    
    checkPremiumStatus();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter a premium code");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to activate premium");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In production, this should call an edge function that:
      // 1. Validates the code against encrypted database entries
      // 2. Checks if code is already used
      // 3. Has rate limiting to prevent brute force
      // 4. Logs all activation attempts for audit
      
      toast.error("Premium codes must be activated through the admin panel for security. Please contact support.");
      
    } catch (error) {
      toast.error("Failed to activate premium. Please contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (hasPremium) {
    return (
      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h3 className="text-lg font-bold text-green-400 mb-2">Premium Access Active</h3>
        <p className="text-gray-300">You have premium access. Enjoy unlimited streaming and downloads!</p>
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
          maxLength={50}
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
        <p>Contact support to get a premium code</p>
      </div>
    </form>
  );
};

export default PremiumCodeInput;


import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enterPremiumCode } from "@/utils/videoUtils";
import { Crown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumCodeInputProps {
  onSuccess?: () => void;
  userId: string;
}

const PremiumCodeInput = ({ onSuccess, userId }: PremiumCodeInputProps) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter a premium code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = enterPremiumCode(code, userId);
      
      if (success) {
        setIsSuccess(true);
        onSuccess?.();
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
      setCode('');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/30 to-yellow-600/10 border border-yellow-700/30">
      <div className="flex items-start gap-3 mb-4">
        <Crown size={24} className="text-yellow-500 shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-yellow-500">Premium Content Access</h3>
          <p className="text-gray-300 text-sm">
            Enter your premium code to unlock all premium content.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter premium code"
            className="bg-black/50 border-yellow-700/30 focus:border-yellow-500"
            disabled={isSubmitting || isSuccess}
          />
          
          <Button
            type="submit"
            className={`shrink-0 ${
              isSuccess 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? (
              "Verifying..."
            ) : isSuccess ? (
              <>
                <Check size={16} className="mr-1" />
                Success
              </>
            ) : (
              "Activate"
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Premium codes can be obtained from our partners or through special promotions.
        </p>
      </form>
    </div>
  );
};

export default PremiumCodeInput;

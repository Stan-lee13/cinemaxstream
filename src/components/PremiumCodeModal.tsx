
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enterPremiumCode } from "@/utils/videoUtils";
import { useAuth } from "@/hooks/useAuthState";

interface PremiumCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumCodeModal = ({ isOpen, onClose }: PremiumCodeModalProps) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = () => {
    if (!code.trim()) return;
    
    setIsSubmitting(true);
    const success = enterPremiumCode(code, user?.id || 'anonymous');
    
    if (success) {
      onClose();
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Premium Code</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-400 mb-4">
            Enter your premium code to unlock all premium content.
          </p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code here"
            className="bg-background border-gray-700"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-cinemax-500 hover:bg-cinemax-600"
            disabled={isSubmitting || !code.trim()}
          >
            {isSubmitting ? 'Verifying...' : 'Unlock Premium'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumCodeModal;

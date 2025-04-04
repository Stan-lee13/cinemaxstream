
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown } from "lucide-react";
import PremiumCodeInput from "./PremiumCodeInput";

interface PremiumCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumCodeModal = ({ isOpen, onClose }: PremiumCodeModalProps) => {
  const handleSuccess = () => {
    // Give a bit of time for the success message to be visible
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-cinemax-500/10 p-3 rounded-full border border-cinemax-500/20 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">Premium Access</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Enter a premium code to unlock all premium content
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <PremiumCodeInput onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumCodeModal;

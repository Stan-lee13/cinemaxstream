import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Play, Download, Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPromoModal } from '@/components/PremiumPromoModal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'streaming' | 'download';
  currentRole: 'free' | 'pro' | 'premium';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  reason, 
  currentRole 
}) => {
  const { isPremium } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Don't show modal if user already has premium
  if (isPremium) {
    return null;
  }

  const getUpgradeOptions = () => {
    if (currentRole === 'free') {
      return [
        {
          name: 'Pro',
          price: '$9.99/month',
          features: [
            '12 streams per day',
            '5 downloads per day',
            'HD quality',
            'Priority support'
          ],
          recommended: reason === 'streaming'
        },
        {
          name: 'Premium',
          price: '$19.99/month',
          features: [
            'Unlimited streams',
            'Unlimited downloads',
            '4K quality',
            'Offline viewing',
            'Premium content',
            'VIP support'
          ],
          recommended: reason === 'download'
        }
      ];
    } else {
      return [
        {
          name: 'Premium',
          price: '$19.99/month',
          features: [
            'Unlimited streams',
            'Unlimited downloads',
            '4K quality',
            'Offline viewing',
            'Premium content',
            'VIP support'
          ],
          recommended: true
        }
      ];
    }
  };

  const getMessage = () => {
    if (reason === 'streaming') {
      return currentRole === 'free' 
        ? "You've reached your daily streaming limit of 5 videos."
        : "You've reached your daily streaming limit of 12 videos.";
    } else {
      return currentRole === 'free'
        ? "Downloads are not available on the free plan."
        : "You've reached your daily download limit of 5 files.";
    }
  };

  const handleUpgrade = async (planName: string) => {
    setIsUpgrading(true);
    // TODO: Implement actual payment flow
    console.log(`Upgrading to ${planName}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUpgrading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-background via-background to-secondary/20 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {reason === 'streaming' ? (
              <div className="flex items-center justify-center gap-2">
                <Play className="text-cinemax-500" />
                Streaming Limit Reached
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Download className="text-green-500" />
                Download Upgrade Required
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-6">
          <p className="text-foreground">{getMessage()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upgrade your plan to continue enjoying unlimited entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getUpgradeOptions().map((plan) => (
            <div 
              key={plan.name}
              className={`relative border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                plan.recommended 
                  ? 'border-cinemax-500 bg-cinemax-500/5 shadow-cinemax-500/20' 
                  : 'border-border bg-secondary/30'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star size={12} />
                    Recommended
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === 'Premium' && <Crown className="text-yellow-500 mr-2" size={20} />}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>
                <div className="text-2xl font-bold text-cinemax-500">{plan.price}</div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full transition-all duration-200 ${
                  plan.recommended 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                onClick={() => handleUpgrade(plan.name)}
                disabled={isUpgrading}
              >
                {isUpgrading ? 'Processing...' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <PremiumPromoModal>
            <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground">
              Have a promo code? Click here to activate premium
            </Button>
          </PremiumPromoModal>
          
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
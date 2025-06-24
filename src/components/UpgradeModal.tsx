
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Play, Download, Star } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-white">
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
          <p className="text-gray-300">{getMessage()}</p>
          <p className="text-sm text-gray-400 mt-2">
            Upgrade your plan to continue enjoying unlimited entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getUpgradeOptions().map((plan) => (
            <div 
              key={plan.name}
              className={`relative border rounded-lg p-6 ${
                plan.recommended 
                  ? 'border-cinemax-500 bg-cinemax-500/5' 
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-cinemax-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star size={12} />
                    Recommended
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === 'Premium' && <Crown className="text-yellow-500 mr-2" size={20} />}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
                <div className="text-2xl font-bold text-cinemax-500">{plan.price}</div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-cinemax-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.recommended 
                    ? 'bg-cinemax-500 hover:bg-cinemax-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => {
                  // Handle upgrade logic here
                  console.log(`Upgrading to ${plan.name}`);
                  onClose();
                }}
              >
                Upgrade to {plan.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;

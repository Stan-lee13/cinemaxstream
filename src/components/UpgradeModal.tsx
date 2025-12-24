import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Play, Download, Star, Check, Zap, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPromoModal } from '@/components/PremiumPromoModal';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (isPremium) return null;

  const getUpgradeOptions = () => {
    const options = [
      {
        id: 'pro',
        name: 'Pro',
        price: '₦500',
        period: '/month',
        description: 'Perfect for casual viewing',
        features: [
          'Unlimited streaming',
          'Unlimited downloads',
          'HD quality',
          'Priority download queue',
          'Priority support'
        ],
        accent: 'gold',
        recommended: reason === 'streaming' && currentRole === 'free'
      }
    ];

    return options;
  };

  const handleUpgrade = async (planName: string) => {
    setIsUpgrading(true);
    try {
      const paymentUrl = import.meta.env.VITE_STRIPE_PAYMENT_URL
        || `https://billing.cinemax-stream.com/upgrade?plan=${planName.toLowerCase()}`;

      window.open(paymentUrl, '_blank');
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Upgrade failed', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none gap-0">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl">
          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[100px]" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col md:flex-row h-full">
            {/* Left Side: Dynamic Info */}
            <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cinemax-500/20 to-purple-500/20 border border-cinemax-500/30 text-cinemax-400 text-xs font-semibold uppercase tracking-wider mb-6">
                  <Zap size={12} className="fill-current" />
                  Upgrade Required
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  Unleash the full power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinemax-400 to-purple-400">Cinemax</span>
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {reason === 'streaming'
                    ? "You've hit your daily viewing limit. Unlock more with the Pro plan."
                    : "Downloads are exclusive to Pro members. Take your movies anywhere."}
                </p>
              </div>

              <div className="hidden md:block">
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  1,420 users upgraded today
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0a0a] bg-gray-800" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Plans */}
            <div className="w-full md:w-2/3 p-4 md:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {getUpgradeOptions().map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative group rounded-xl border-2 transition-all duration-300 ${plan.recommended
                        ? 'border-cinemax-500/50 bg-gradient-to-br from-cinemax-950/50 to-black'
                        : 'border-white/5 bg-white/5 hover:border-white/10'
                      }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-6">
                        <span className="bg-gradient-to-r from-cinemax-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-cinemax-500/20 flex items-center gap-1">
                          <Crown size={12} className="fill-current" />
                          RECOMMENDED
                        </span>
                      </div>
                    )}

                    <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-xl font-bold ${plan.accent === 'gold' ? 'text-white' : 'text-gray-200'}`}>
                            {plan.name}
                          </h3>
                          {plan.accent === 'gold' && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl md:text-3xl font-bold text-white">{plan.price}</span>
                          <span className="text-gray-500 text-sm">{plan.period}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                          {plan.features.slice(0, 4).map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                              <Check size={12} className={plan.accent === 'gold' ? 'text-amber-400' : 'text-cinemax-400'} />
                              {feature}
                            </div>
                          ))}
                          {plan.features.length > 4 && (
                            <div className="col-span-1 sm:col-span-2 text-xs text-cinemax-400 font-medium">
                              + {plan.features.length - 4} more benefits
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center min-w-[120px]">
                        <Button
                          onClick={() => handleUpgrade(plan.name)}
                          disabled={isUpgrading}
                          className={`h-12 w-full font-bold shadow-lg transition-all duration-300 hover:scale-105 ${plan.recommended
                              ? 'bg-gradient-to-r from-cinemax-600 to-amber-600 hover:from-cinemax-500 hover:to-amber-500 text-white shadow-cinemax-500/20'
                              : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                          {isUpgrading ? '...' : 'Upgrade'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <PremiumPromoModal>
                  <button className="text-xs text-gray-500 hover:text-white transition-colors underline decoration-gray-700 underline-offset-4">
                    Have a promo code? Click here
                  </button>
                </PremiumPromoModal>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;

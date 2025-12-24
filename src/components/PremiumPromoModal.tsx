import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumPromoModalProps {
  children: React.ReactNode;
}

export function PremiumPromoModal({ children }: PremiumPromoModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { activatePremium, isPremium } = useAuth();
  const [error, setError] = useState('');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPromoCode('');
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await activatePremium(promoCode);
      if (success) {
        setIsOpen(false);
        setPromoCode('');
      } else {
        setError('Invalid or expired promo code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
        <Sparkles className="h-3 w-3" />
        <span className="text-xs font-bold uppercase tracking-wide">Pro Access Active</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl">
          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[100%] bg-purple-600/10 rounded-full blur-[80px]" />
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>

          <div className="relative z-10 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <Gift className="h-8 w-8 text-white relative z-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Have a Promo Code?</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
              Enter your code below to unlock exclusive Pro features instantly.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="ENTER CODE"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="w-full bg-white/5 border-white/10 text-center text-xl tracking-widest font-mono text-white placeholder:text-gray-600 h-14 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20 transition-all uppercase"
                />

                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none blur-xl" />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-medium"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={!promoCode || isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Activate Access <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 w-full">
              <p className="text-xs text-gray-500">
                Don't have a code? <button onClick={() => setIsOpen(false)} className="text-amber-500 hover:text-amber-400 underline">View Plans</button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

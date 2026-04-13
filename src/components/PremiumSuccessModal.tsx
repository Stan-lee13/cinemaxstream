import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, Play, Download, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiresAt?: string;
  plan?: string;
}

const ConfettiPiece = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${x}%`,
      top: '-5%',
      backgroundColor: ['#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
    }}
    initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
    animate={{
      y: [0, 400, 600],
      opacity: [1, 1, 0],
      rotate: [0, 180, 360],
      scale: [1, 0.8, 0.5],
      x: [0, (Math.random() - 0.5) * 100],
    }}
    transition={{ duration: 2.5, delay, ease: 'easeOut' }}
  />
);

export function PremiumSuccessModal({ isOpen, onClose, expiresAt, plan = 'Premium' }: PremiumSuccessModalProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-lg p-0 border-0 bg-transparent shadow-none overflow-visible">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] border border-amber-500/20 shadow-2xl shadow-amber-500/10">
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
              {Array.from({ length: 30 }).map((_, i) => (
                <ConfettiPiece key={i} delay={i * 0.05} x={Math.random() * 100} />
              ))}
            </div>
          )}

          {/* Glow effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] left-[20%] w-[60%] h-[60%] bg-amber-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center">
            {/* Crown icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30"
            >
              <Crown className="h-10 w-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white mb-2"
            >
              🎉 Congratulations!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-amber-400 text-lg font-bold mb-6"
            >
              You just unlocked {plan} Access 🚀
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-white/5 rounded-2xl p-5 mb-6 border border-white/10 space-y-3"
            >
              {[
                { icon: Play, label: 'Unlimited streaming' },
                { icon: Download, label: 'Download access' },
                { icon: Zap, label: 'HD & 4K quality' },
                { icon: Shield, label: 'Priority servers' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-left">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-gray-200 text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Expiry */}
            {formattedExpiry && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 mb-6"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-300 font-bold">
                  Valid until {formattedExpiry} ({daysRemaining} days)
                </span>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full"
            >
              <Button
                onClick={() => { onClose(); navigate('/'); }}
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Watching
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PremiumSuccessModal;

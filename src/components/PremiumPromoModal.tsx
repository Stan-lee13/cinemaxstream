import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Sparkles } from 'lucide-react';

interface PremiumPromoModalProps {
  children: React.ReactNode;
}

export function PremiumPromoModal({ children }: PremiumPromoModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { activatePremium, isPremium } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = activatePremium(promoCode);
    if (success) {
      setIsOpen(false);
      setPromoCode('');
    }
  };

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 text-premium">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Premium Active</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-premium" />
            Enter Promo Code
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promo-code">Promo Code</Label>
            <Input
              id="promo-code"
              type="text"
              placeholder="Enter your promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Activate Premium
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
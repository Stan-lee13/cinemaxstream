import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/authHooks';
import { validatePremiumCode } from '@/utils/authUtils';
import { useUserTier } from '@/hooks/useUserTier';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import PremiumSuccessModal from './PremiumSuccessModal';
import { Sparkles, Loader2, Crown, Gift, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PromoCodeSectionProps {
  compact?: boolean;
}

export function PromoCodeSection({ compact = false }: PromoCodeSectionProps) {
  const { user, isPremium, activatePremium } = useAuth();
  const { tier, benefits, refreshTier } = useUserTier(user?.id);
  const { notifyPromoSuccess } = useEventNotifications();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    if (!user) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const success = await activatePremium(code);
      if (success) {
        // Fetch the updated expiry
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_expires_at')
          .eq('id', user.id)
          .maybeSingle();

        setExpiresAt(profile?.subscription_expires_at || undefined);
        notifyPromoSuccess(code.trim().toUpperCase());
        await refreshTier();
        setCode('');
        setShowSuccess(true);
      }
    } catch {
      // Error already handled in activatePremium
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already premium, show status
  if (isPremium || tier === 'premium') {
    return (
      <>
        <PremiumPlanDisplay userId={user?.id} />
        <PremiumSuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} expiresAt={expiresAt} />
      </>
    );
  }

  if (compact) {
    return (
      <>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Promo code"
            className="flex-1 bg-white/5 border-white/10 font-mono tracking-wider uppercase text-sm h-10"
            disabled={isLoading}
            maxLength={50}
          />
          <Button type="submit" size="sm" disabled={isLoading || !code.trim()} className="bg-amber-500 hover:bg-amber-600 h-10 px-4">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
          </Button>
        </form>
        <PremiumSuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} expiresAt={expiresAt} />
      </>
    );
  }

  return (
    <>
      <Card className="border-2 border-dashed border-amber-500/30 bg-amber-500/5">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Have a Promo Code?
          </CardTitle>
          <CardDescription>
            Activate your premium access here — unlimited streaming & downloads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="flex-1 text-center font-mono tracking-widest uppercase bg-white/5 border-white/10 h-12"
              disabled={isLoading}
              maxLength={50}
            />
            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 h-12 px-6"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
              ) : (
                'Activate'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <PremiumSuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} expiresAt={expiresAt} />
    </>
  );
}

// Persistent plan display for premium users
function PremiumPlanDisplay({ userId }: { userId?: string }) {
  const [expiry, setExpiry] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.subscription_expires_at) setExpiry(data.subscription_expires_at);
      });
  }, [userId]);

  const daysRemaining = expiry
    ? Math.max(0, Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-amber-400 font-bold flex items-center gap-2">
            💎 Premium Active
          </h3>
          {daysRemaining !== null && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining > 0 ? `Expires in ${daysRemaining} days` : 'Subscription expired'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromoCodeSection;

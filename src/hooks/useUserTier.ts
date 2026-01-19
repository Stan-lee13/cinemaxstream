import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserTier = 'free' | 'premium';

export interface TierBenefits {
  maxStreams: number;
  maxDownloads: number;
  unlimited: boolean;
  features: string[];
  priorityLevel: number;
}

export const useUserTier = (userId?: string) => {
  const [tier, setTier] = useState<UserTier>('free');
  const [benefits, setBenefits] = useState<TierBenefits>({
    maxStreams: 1000000,
    maxDownloads: 0,
    unlimited: false,
    features: ['Unlimited streaming', 'Standard quality', 'Basic support', 'Access to full catalog'],
    priorityLevel: 3
  });
  const [isLoading, setIsLoading] = useState(true);

  const tierBenefits = useMemo(() => ({
    free: {
      maxStreams: 1000000,
      maxDownloads: 0,
      unlimited: false,
      features: ['Unlimited streaming', 'Standard quality', 'Basic support', 'Access to full catalog'],
      priorityLevel: 3
    },
    premium: {
      maxStreams: 1000000,
      maxDownloads: 1000000,
      unlimited: true,
      features: ['Unlimited streaming', 'Unlimited downloads', '4K quality', 'Priority support', 'Early access'],
      priorityLevel: 1
    }
  }), []);

  const fetchUserTier = useCallback(async () => {
    if (!userId) {
      setTier('free');
      setBenefits(tierBenefits.free);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Check user_roles table first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['premium', 'admin'])
        .maybeSingle();

      // Also check user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        setTier('free');
        setBenefits(tierBenefits.free);
        setIsLoading(false);
        return;
      }

      let userTier: UserTier = 'free';
      
      // Check user_roles table (admin also gets premium benefits)
      if (roleData?.role === 'admin' || roleData?.role === 'premium') {
        userTier = 'premium';
      }
      // Check profile subscription_tier
      else if (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro' ||
               profile?.role === 'premium' || profile?.role === 'pro') {
        userTier = 'premium';
      }

      // Check if subscription has expired
      if (userTier === 'premium' && profile?.subscription_expires_at) {
        const expiryDate = new Date(profile.subscription_expires_at);
        if (expiryDate < new Date()) {
          userTier = 'free';
          await supabase
            .from('user_profiles')
            .update({ role: 'free', subscription_tier: 'free', subscription_expires_at: null })
            .eq('id', userId);
        }
      }

      setTier(userTier);
      setBenefits(tierBenefits[userTier]);
    } catch (error) {
      setTier('free');
      setBenefits(tierBenefits.free);
    } finally {
      setIsLoading(false);
    }
  }, [userId, tierBenefits]);

  useEffect(() => {
    fetchUserTier();
  }, [fetchUserTier]);

  const canStream = useCallback(() => true, []);
  const canDownload = useCallback(() => tier === 'premium', [tier]);

  const isPremium = tier === 'premium';
  const isPro = tier === 'premium'; // Pro = Premium in this system

  return { tier, benefits, isLoading, canStream, canDownload, isPremium, isPro, refreshTier: fetchUserTier };
};

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserTier = 'free' | 'pro' | 'premium';

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
    pro: {
      maxStreams: 1000000,
      maxDownloads: 1000000,
      unlimited: true,
      features: ['Unlimited streaming', 'Unlimited downloads', 'HD quality', 'Priority download queue', 'Priority support'],
      priorityLevel: 2
    },
    premium: {
      maxStreams: 1000000,
      maxDownloads: 1000000,
      unlimited: true,
      features: ['Unlimited streaming', 'Unlimited downloads', 'HD quality', 'Priority download queue', 'Priority support'],
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
      
      // Check user role in user_profiles table
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role, subscription_expires_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setTier('free');
        setBenefits(tierBenefits.free);
        return;
      }

      if (!profile) {
        setTier('free');
        setBenefits(tierBenefits.free);
        return;
      }

      // Check if premium subscription is still valid
      let userTier: UserTier = (profile.role as UserTier) || 'free';
      
      if (userTier === 'premium' && profile.subscription_expires_at) {
        const expiryDate = new Date(profile.subscription_expires_at);
        const now = new Date();
        
        if (expiryDate < now) {
          // Premium expired, revert to free
          userTier = 'free';
          
          // Update database to reflect expired subscription
          await supabase
            .from('user_profiles')
            .update({ role: 'free' })
            .eq('id', userId);
        }
      }

      setTier(userTier);
      setBenefits(tierBenefits[userTier]);
    } catch (error) {
      console.error('Error in fetchUserTier:', error);
      setTier('free');
      setBenefits(tierBenefits.free);
    } finally {
      setIsLoading(false);
    }
  }, [userId, tierBenefits]);

  useEffect(() => {
    fetchUserTier();
  }, [fetchUserTier]);

  const canStream = useCallback((currentStreams: number = 0) => {
    if (benefits.unlimited) return true;
    return currentStreams < benefits.maxStreams;
  }, [benefits]);

  const canDownload = useCallback((currentDownloads: number = 0) => {
    if (benefits.unlimited) return true;
    return currentDownloads < benefits.maxDownloads;
  }, [benefits]);

  const isPremium = tier === 'premium';
  const isPro = tier === 'pro' || tier === 'premium';

  return {
    tier,
    benefits,
    isLoading,
    canStream,
    canDownload,
    isPremium,
    isPro,
    refreshTier: fetchUserTier
  };
};

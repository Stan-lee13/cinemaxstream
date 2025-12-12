import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errorHelpers';

// Define the subscription plan interface
export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  price_naira: number;
  max_streams: number;
  max_downloads: number;
  unlimited: boolean;
  features: string[];
  priority_level: number;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  watched_today: number;
  downloads_today: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  role: 'free' | 'pro' | 'premium';
  timezone: string;
  priority_level: number;
  username?: string;
  avatar_url?: string;
  subscription_expires_at?: string;
}

export interface CreditLimits {
  maxStreams: number;
  maxDownloads: number;
  unlimited: boolean;
}

export const useCreditSystem = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscription plan based on user role
  const fetchSubscriptionPlan = useCallback(async (role: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_id', role)
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const plan: SubscriptionPlan = {
        id: data.id,
        plan_id: data.plan_id,
        name: data.name,
        price_naira: data.price_naira,
        max_streams: data.max_streams,
        max_downloads: data.max_downloads,
        unlimited: data.unlimited ?? false,
        features: Array.isArray(data.features) ? data.features.map(f => String(f)) : [],
        priority_level: data.priority_level ?? 3,
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString()
      };

      setSubscriptionPlan(plan);
      return plan;
    } catch (err) {
      console.error('Error fetching subscription plan:', getErrorMessage(err));
      return null;
    }
  }, []);

  // Get credit limits based on subscription plan
  const getCreditLimits = useCallback((plan: SubscriptionPlan | null, subscriptionExpiresAt?: string): CreditLimits => {
    // Check if premium subscription is still valid
    if (plan?.plan_id === 'premium' || plan?.plan_id === 'paid') {
      if (subscriptionExpiresAt) {
        const expiryDate = new Date(subscriptionExpiresAt);
        const now = new Date();
        if (expiryDate > now) {
          // Premium is active - unlimited access
          return { maxStreams: 0, maxDownloads: 0, unlimited: true };
        }
        // Premium expired, revert to free plan limits
        const freePlan = subscriptionPlan?.plan_id === 'free' ? subscriptionPlan : null;
        if (freePlan) {
          return { 
            maxStreams: freePlan.max_streams, 
            maxDownloads: freePlan.max_downloads, 
            unlimited: freePlan.unlimited 
          };
        }
      }
      // No expiry date means unlimited premium
      return { maxStreams: 0, maxDownloads: 0, unlimited: true };
    }
    
    if (plan) {
      return { 
        maxStreams: plan.max_streams, 
        maxDownloads: plan.max_downloads, 
        unlimited: plan.unlimited 
      };
    }
    
    // Default to free plan limits
    return { maxStreams: 5, maxDownloads: 0, unlimited: false };
  }, [subscriptionPlan]);

  // Stable function to check and reset daily limits
  const checkAndResetDailyLimits = useCallback(async (usage: UserUsage, timezone: string) => {
    try {
      const userMidnight = getMidnightInTimezone(timezone);
      const lastReset = new Date(usage.last_reset);
      
      if (lastReset < userMidnight) {
        // Reset the daily limits
        const { data: updatedUsage, error } = await supabase
          .from('user_usage')
          .update({
            watched_today: 0,
            downloads_today: 0,
            last_reset: new Date().toISOString()
          })
          .eq('user_id', usage.user_id)
          .select()
          .single();

        if (error) throw error;
        // Map DB row to UserUsage using a narrow type
        type UpdatedUsageRow = {
          id: string;
          user_id: string;
          watched_today?: number | null;
          downloads_today?: number | null;
          last_reset?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };

        const row = updatedUsage as unknown as UpdatedUsageRow;
        const mapped: UserUsage = {
          id: row.id,
          user_id: row.user_id,
          watched_today: row.watched_today ?? 0,
          downloads_today: row.downloads_today ?? 0,
          last_reset: row.last_reset ?? new Date().toISOString(),
          created_at: row.created_at ?? new Date().toISOString(),
          updated_at: row.updated_at ?? new Date().toISOString()
        };

        setUserUsage(mapped);
      } else {
        setUserUsage(usage);
      }
    } catch (err: unknown) {
      // Production error handling - capture for monitoring
      console.error('Error in checkAndResetDailyLimits:', getErrorMessage(err));
    }
  }, []);

  // Initialize user profile and usage
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const initializeUser = async () => {
      try {
        // Get user profile
        interface UserProfileRow {
          id: string;
          role?: string;
          timezone?: string;
          priority_level?: number;
          username?: string;
          avatar_url?: string;
          subscription_expires_at?: string;
        }

        let profile: UserProfileRow | null = null;
        const profileResult = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        const profileError = profileResult.error;
        profile = profileResult.data as UserProfileRow | null;

        if (profileError && profileError.code === 'PGRST116') {
          // Create profile if it doesn't exist
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              role: 'free',
              timezone: userTimezone,
              priority_level: 3
            })
            .select()
            .single();

          if (createError) throw createError;
          profile = newProfile as UserProfileRow;
        } else if (profileError) {
          throw profileError;
        }

        // Transform profile to match our interface
        const transformedProfile: UserProfile = {
          id: profile!.id,
          role: ((profile!.role as 'free' | 'pro' | 'premium') ?? 'free'),
          timezone: profile!.timezone ?? 'UTC',
          priority_level: profile!.priority_level ?? 3,
          username: profile!.username ?? undefined,
          avatar_url: profile!.avatar_url ?? undefined,
          subscription_expires_at: profile!.subscription_expires_at ?? undefined
        };

        setUserProfile(transformedProfile);

        // Fetch subscription plan
        const plan = await fetchSubscriptionPlan(transformedProfile.role);
        
        // Get or create user usage
        interface UserUsageRow {
          id: string;
          user_id: string;
          watched_today?: number;
          downloads_today?: number;
          last_reset?: string;
          created_at?: string;
          updated_at?: string;
        }

        let usage: UserUsageRow | null = null;
        const usageResult = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .single();
        const usageError = usageResult.error;
        usage = usageResult.data as UserUsageRow | null;

  if (usageError && ((usageError as { code?: string }).code === 'PGRST116')) {
          // Create usage record if it doesn't exist
          const { data: newUsage, error: createUsageError } = await supabase
            .from('user_usage')
            .insert({
              user_id: user.id,
              watched_today: 0,
              downloads_today: 0,
              last_reset: new Date().toISOString()
            })
            .select()
            .single();

          if (createUsageError) throw createUsageError;
          usage = newUsage as unknown as UserUsageRow;
        } else if (usageError) {
          throw usageError;
        }

        // Check if we need to reset daily limits
        // Map usage to UserUsage and pass to reset function
        const mappedUsage: UserUsage = {
          id: usage!.id,
          user_id: usage!.user_id,
          watched_today: usage!.watched_today ?? 0,
          downloads_today: usage!.downloads_today ?? 0,
          last_reset: usage!.last_reset ?? new Date().toISOString(),
          created_at: usage!.created_at ?? new Date().toISOString(),
          updated_at: usage!.updated_at ?? new Date().toISOString()
        };

        await checkAndResetDailyLimits(mappedUsage, transformedProfile.timezone);
        
      } catch (err: unknown) {
        // Production error handling - capture for monitoring  
        console.error('Failed to initialize user credit system:', err);
        setUserUsage(null);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [user, checkAndResetDailyLimits, fetchSubscriptionPlan]);

  

  // Get midnight in user's timezone
  const getMidnightInTimezone = (timezone: string): Date => {
    const now = new Date();
    const todayMidnight = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    todayMidnight.setHours(0, 0, 0, 0);
    return todayMidnight;
  };

  // Check if user can stream
  const canStream = (): boolean => {
    if (!userProfile || !userUsage) return false;
    
    const limits = getCreditLimits(subscriptionPlan, userProfile.subscription_expires_at);
    if (limits.unlimited) return true;
    
    return userUsage.watched_today < limits.maxStreams;
  };

  // Check if user can download
  const canDownload = (): boolean => {
    if (!userProfile || !userUsage) return false;
    
    const limits = getCreditLimits(subscriptionPlan, userProfile.subscription_expires_at);
    if (limits.unlimited) return true; // Premium users can download
    if (userProfile.role === 'free') return false; // Free users can't download
    
    return userUsage.downloads_today < limits.maxDownloads;
  };

  // Deduct streaming credit
  const deductStreamingCredit = async (): Promise<boolean> => {
    if (!userUsage || !canStream()) return false;

    try {
      const { data, error } = await supabase
        .from('user_usage')
        .update({
          watched_today: userUsage.watched_today + 1
        })
        .eq('user_id', userUsage.user_id)
        .select()
        .single();

      if (error) throw error;
      
      setUserUsage(data as UserUsage);
      return true;
    } catch (error) {
      // Production error handling - capture for monitoring
      return false;
    }
  };

  // Deduct download credit
  const deductDownloadCredit = async (): Promise<boolean> => {
    if (!userUsage || !canDownload()) return false;

    try {
      const { data, error } = await supabase
        .from('user_usage')
        .update({
          downloads_today: userUsage.downloads_today + 1
        })
        .eq('user_id', userUsage.user_id)
        .select()
        .single();

      if (error) throw error;
      
      setUserUsage(data as UserUsage);
      return true;
    } catch (error) {
      // Production error handling - capture for monitoring
      return false;
    }
  };

  // Get remaining downloads for the day
  const getDownloadsRemaining = (): number => {
    if (!userProfile || !userUsage) return 0;
    
    const limits = getCreditLimits(subscriptionPlan, userProfile.subscription_expires_at);
    if (limits.unlimited || userProfile.role === 'free') return 0;
    
    return Math.max(0, limits.maxDownloads - userUsage.downloads_today);
  };

  // Get remaining streams for the day
  const getStreamsRemaining = (): number => {
    if (!userProfile || !userUsage) return 0;
    
    const limits = getCreditLimits(subscriptionPlan, userProfile.subscription_expires_at);
    if (limits.unlimited) return 0;
    
    return Math.max(0, limits.maxStreams - userUsage.watched_today);
  };

  return {
    userProfile,
    userUsage,
    subscriptionPlan,
    isLoading,
    canStream,
    canDownload,
    deductStreamingCredit,
    deductDownloadCredit,
    getCreditLimits: () => subscriptionPlan ? getCreditLimits(subscriptionPlan, userProfile?.subscription_expires_at) : null,
    getDownloadsRemaining,
    getStreamsRemaining
  };
};
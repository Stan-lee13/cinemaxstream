import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(true);

  // Get credit limits based on user role
  const getCreditLimits = (role: string): CreditLimits => {
    switch (role) {
      case 'free':
        return { maxStreams: 5, maxDownloads: 0, unlimited: false };
      case 'pro':
        return { maxStreams: 12, maxDownloads: 5, unlimited: false };
      case 'premium':
        return { maxStreams: 0, maxDownloads: 0, unlimited: true };
      default:
        return { maxStreams: 5, maxDownloads: 0, unlimited: false };
    }
  };

  // Initialize user profile and usage
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const initializeUser = async () => {
      try {
        // Get user profile
        const { data: initialProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        let profile = initialProfile;

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
          profile = newProfile;
        } else if (profileError) {
          throw profileError;
        }

        // Transform profile to match our interface
        const transformedProfile: UserProfile = {
          id: profile.id,
          role: (profile.role as 'free' | 'pro' | 'premium') || 'free',
          timezone: profile.timezone || 'UTC',
          priority_level: profile.priority_level || 3,
          username: profile.username,
          avatar_url: profile.avatar_url
        };

        setUserProfile(transformedProfile);

        // Get or create user usage
        const { data: initialUsage, error: usageError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .single();

        let usage = initialUsage;

        if (usageError && usageError.code === 'PGRST116') {
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
          usage = newUsage;
        } else if (usageError) {
          throw usageError;
        }

        // Check if we need to reset daily limits
        await checkAndResetDailyLimits(usage, transformedProfile.timezone);
        
      } catch (error) {
        console.error('Error initializing user:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  // Check and reset daily limits if needed
  const checkAndResetDailyLimits = async (usage: UserUsage, timezone: string) => {
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
        setUserUsage(updatedUsage);
      } else {
        setUserUsage(usage);
      }
    } catch (error) {
      console.error('Error resetting daily limits:', error);
    }
  };

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
    
    const limits = getCreditLimits(userProfile.role);
    if (limits.unlimited) return true;
    
    return userUsage.watched_today < limits.maxStreams;
  };

  // Check if user can download
  const canDownload = (): boolean => {
    if (!userProfile || !userUsage) return false;
    
    const limits = getCreditLimits(userProfile.role);
    if (limits.unlimited) return true;
    if (userProfile.role === 'free') return false;
    
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
      
      setUserUsage(data);
      return true;
    } catch (error) {
      console.error('Error deducting streaming credit:', error);
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
      
      setUserUsage(data);
      return true;
    } catch (error) {
      console.error('Error deducting download credit:', error);
      return false;
    }
  };

  // Get remaining downloads for the day
  const getDownloadsRemaining = (): number => {
    if (!userProfile || !userUsage) return 0;
    
    const limits = getCreditLimits(userProfile.role);
    if (limits.unlimited || userProfile.role === 'free') return 0;
    
    return Math.max(0, limits.maxDownloads - userUsage.downloads_today);
  };

  // Get remaining streams for the day
  const getStreamsRemaining = (): number => {
    if (!userProfile || !userUsage) return 0;
    
    const limits = getCreditLimits(userProfile.role);
    if (limits.unlimited) return 0;
    
    return Math.max(0, limits.maxStreams - userUsage.watched_today);
  };

  return {
    userProfile,
    userUsage,
    isLoading,
    canStream,
    canDownload,
    deductStreamingCredit,
    deductDownloadCredit,
    getCreditLimits: () => userProfile ? getCreditLimits(userProfile.role) : null,
    getDownloadsRemaining,
    getStreamsRemaining
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuthState';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      setError(null);
      setProfileData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError('Failed to load profile data');
        return;
      }

      // If profile doesn't exist yet, create it
      if (!data && user) {
        const newProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          subscription_tier: 'free'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError('Failed to create profile');
          return;
        }

        setProfileData(createdProfile as UserProfile);
      } else if (data) {
        setProfileData(data as UserProfile);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
        return;
      }

      // Update local state
      setProfileData(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return { profileData, isLoading, error, updateProfile, fetchProfile };
};

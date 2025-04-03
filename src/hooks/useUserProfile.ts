
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuthState';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // If profile doesn't exist yet, create it
      if (!data) {
        const newProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          subscription_tier: 'free',
          hide_activity: false
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }

        setProfileData(createdProfile as UserProfile);
      } else {
        // Handle existing profiles and ensure hide_activity is included
        const profile = {
          ...data,
          // Ensure hide_activity is a boolean, default to false if undefined or null
          hide_activity: data.hide_activity === true
        } as UserProfile;
        
        // If hide_activity field doesn't exist in the database, update it
        if (data.hide_activity === undefined) {
          await supabase
            .from('user_profiles')
            .update({ hide_activity: false })
            .eq('id', user.id);
        }
        
        setProfileData(profile);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
  }, [user]);

  return { profileData, isLoading, updateProfile, fetchProfile };
};

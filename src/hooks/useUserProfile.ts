import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  subscription_tier: string;
  subscription_expires_at?: string;
  role: 'free' | 'pro' | 'premium';
  downloads_today?: number;
  watched_today?: number;
  timezone?: string;
  priority_level?: number;
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
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
        // Don't show error toast for missing profile, we'll create it
        if (!fetchError.message.includes('No rows')) {
          setError('Failed to load profile data');
          return;
        }
      }

      // If profile doesn't exist yet, create it
      if (!data && user) {
        const newProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          subscription_tier: 'free',
          role: 'free' as const
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

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
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfileData(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      return { avatar_url: publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile> & { avatar?: File }) => {
    if (!user) return;

    try {
      // Handle avatar upload separately
      if (updates.avatar) {
        const result = await uploadAvatar(updates.avatar);
        // Remove avatar from updates since it's not a database field
        const { avatar, ...dbUpdates } = updates;
        // Add the avatar_url to dbUpdates
        (dbUpdates as Partial<UserProfile>).avatar_url = result.avatar_url;
        
        const { error } = await supabase
          .from('user_profiles')
          .update(dbUpdates)
          .eq('id', user.id);

        if (error) {
          toast.error('Failed to update profile');
          console.error('Error updating profile:', error);
          return;
        }

        // Update local state
        setProfileData(prev => prev ? { ...prev, ...dbUpdates } : null);
        toast.success('Profile updated successfully');
        return result;
      } else {
        // Regular profile update without avatar
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
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  }, [user, uploadAvatar]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profileData, isLoading, error, updateProfile, fetchProfile };
};
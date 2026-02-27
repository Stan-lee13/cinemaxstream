import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { getErrorMessage } from '@/utils/errorHelpers';

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

interface UpdateProfileResult {
  ok: boolean;
  avatar_url?: string;
  error?: string;
}

const AVATAR_UPLOAD_RETRIES = 3;

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

      if (fetchError && !fetchError.message.includes('No rows')) {
        setError('Failed to load profile data');
        return;
      }

      if (!data) {
        const newProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          subscription_tier: 'free',
          role: 'free' as const,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          setError('Failed to create profile');
          return;
        }

        setProfileData(createdProfile as UserProfile);
      } else {
        setProfileData(data as UserProfile);
      }
    } catch {
      setError('An unexpected error occurred while loading profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file: File): Promise<{ avatar_url: string }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    let lastError: unknown;

    for (let attempt = 1; attempt <= AVATAR_UPLOAD_RETRIES; attempt += 1) {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const publicUrl = publicData.publicUrl;

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        setProfileData((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
        return { avatar_url: publicUrl };
      }

      lastError = uploadError;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }

    throw lastError instanceof Error ? lastError : new Error('Avatar upload failed');
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile> & { avatar?: File }): Promise<UpdateProfileResult> => {
    if (!user) return { ok: false, error: 'User not authenticated' };

    try {
      let avatarUrl: string | undefined;
      const dbUpdates: Partial<UserProfile> = { ...updates };

      if (updates.avatar) {
        const result = await uploadAvatar(updates.avatar);
        avatarUrl = result.avatar_url;
        delete (dbUpdates as { avatar?: File }).avatar;
        dbUpdates.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (updateError) {
        return { ok: false, error: updateError.message };
      }

      setProfileData((prev) => (prev ? { ...prev, ...dbUpdates } : null));
      return { ok: true, avatar_url: avatarUrl };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err) };
    }
  }, [user, uploadAvatar]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profileData, isLoading, error, updateProfile, fetchProfile };
};

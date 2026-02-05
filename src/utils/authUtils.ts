/**
 * Authentication utility functions
 * CRITICAL: All promo code validation and subscription updates use admin-level operations
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Check if current user has premium access
 */
export const hasPremiumAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check user_roles table first
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['premium', 'admin'])
      .maybeSingle();

    if (roleData) return true;

    // Check user_profiles subscription
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_expires_at, subscription_tier, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.subscription_tier === 'premium' || profile?.role === 'premium') {
      if (profile.subscription_expires_at) {
        return new Date(profile.subscription_expires_at) > new Date();
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Check if current user is admin
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Root admin email check
    if (user.email?.toLowerCase() === 'stanleyvic13@gmail.com') return true;

    // Check user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return !!roleData;
  } catch {
    return false;
  }
};

/**
 * Validate and redeem a premium promo code
 * CRITICAL: This updates user subscription status in database
 */
export const validatePremiumCode = async (code: string): Promise<boolean> => {
  try {
    if (!code?.trim() || code.trim().length < 3) return false;

    const normalizedCode = code.trim().toUpperCase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    console.log('Validating promo code:', normalizedCode, 'for user:', user.id);

    // Fetch the promo code - RLS allows reading active codes
    const { data: codeData, error } = await supabase
      .from('premium_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching promo code:', error);
      return false;
    }

    if (!codeData) {
      console.warn('Promo code not found or inactive:', normalizedCode);
      return false;
    }

    console.log('Found promo code:', codeData);
    
    // Check expiration
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      console.warn('Promo code expired:', normalizedCode);
      return false;
    }
    
    // Check max uses
    if (codeData.max_uses !== null && (codeData.current_uses ?? 0) >= codeData.max_uses) {
      console.warn('Promo code max uses reached:', normalizedCode);
      return false;
    }

    // Check per-user limit
    if (codeData.per_user_limit !== null) {
      const { count } = await supabase
        .from('promo_code_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('code_id', codeData.id)
        .eq('user_id', user.id);
      
      if (count !== null && count >= codeData.per_user_limit) {
        console.warn('User has reached per-user limit for this code');
        return false;
      }
    }

    // Calculate expiry based on duration_days or months_granted
    const expiryDate = new Date();
    if (codeData.months_granted && codeData.months_granted > 0) {
      expiryDate.setMonth(expiryDate.getMonth() + codeData.months_granted);
    } else {
      const days = codeData.duration_days ?? 30;
      expiryDate.setDate(expiryDate.getDate() + days);
    }

    console.log('Subscription will expire:', expiryDate.toISOString());

    // STEP 1: Record redemption first (user can insert their own redemptions)
    const { error: redemptionError } = await supabase
      .from('promo_code_redemptions')
      .insert({
        code_id: codeData.id,
        user_id: user.id
      });

    if (redemptionError) {
      console.error('Failed to record redemption:', redemptionError);
      // Continue anyway - the main upgrade is more important
    }

    // STEP 2: Check if user already has premium role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'premium')
      .maybeSingle();
    
    // STEP 3: Insert premium role if not exists (admin policy required)
    // This might fail due to RLS, so we'll rely on user_profiles as source of truth
    if (!existingRole) {
      try {
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'premium' as const });
      } catch (roleError) {
        console.warn('Could not insert user_roles (RLS restriction), continuing with profile update');
      }
    }

    // STEP 4: Update user_profiles with premium status
    // NOTE: Due to RLS restrictions on role/subscription fields, we use a different approach
    // The user_profiles UPDATE policy prevents users from changing their own role
    // So we need to use an edge function or admin operation
    
    // Try direct update first (will fail with current RLS)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: 'premium',
        role: 'premium',
        subscription_expires_at: expiryDate.toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.warn('Direct profile update failed (expected with RLS):', profileError);
      
      // Call edge function to perform admin-level update
      try {
        const { data, error: fnError } = await supabase.functions.invoke('upgrade-user-subscription', {
          body: {
            userId: user.id,
            tier: 'premium',
            expiresAt: expiryDate.toISOString(),
            codeId: codeData.id
          }
        });

        if (fnError) {
          console.error('Edge function error:', fnError);
          return false;
        }

        if (data?.success) {
          console.log('User upgraded via edge function');
          return true;
        }
      } catch (fnErr) {
        console.error('Failed to call upgrade edge function:', fnErr);
        return false;
      }
    }

    console.log('Promo code validated successfully. User upgraded to premium until:', expiryDate.toISOString());
    return true;
  } catch (error) {
    console.error('Error validating premium code:', error);
    return false;
  }
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = charset[Math.floor(Math.random() * 26)] + charset[Math.floor(Math.random() * 26) + 26] + 
                 charset[Math.floor(Math.random() * 10) + 52] + charset[Math.floor(Math.random() * 12) + 62];
  for (let i = 4; i < length; i++) password += charset[Math.floor(Math.random() * charset.length)];
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Resend email confirmation
 */
export const resendConfirmationEmail = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    });

    if (error) {
      console.error('Error resending confirmation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return false;
  }
};

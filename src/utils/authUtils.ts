/**
 * Authentication utility functions
 */

// Storage key for premium access
const PREMIUM_ACCESS_KEY = 'premium_access';

/**
 * Check if user has premium access via database
 * Checks subscription_expires_at and user_roles table
 */
export const hasPremiumAccess = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // Check if user has premium role in user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'premium')
      .maybeSingle();

    if (roleData) return true;

    // Check subscription expiry date
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_expires_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.subscription_expires_at) {
      const expiryDate = new Date(profile.subscription_expires_at);
      return expiryDate > new Date();
    }

    return false;
  } catch (_error) {
    return false;
  }
};

/**
 * Check if user has admin role
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return !!roleData;
  } catch (_error) {
    return false;
  }
};

export const validatePremiumCode = async (code: string): Promise<boolean> => {
  try {
    if (!code || typeof code !== 'string') {
      return false;
    }

    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length < 5) {
      return false;
    }

    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: codeData, error } = await (supabase as any)
      .from('premium_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !codeData) {
      console.warn('Premium code not found or invalid:', code);
      return false;
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return false;
    }

    if (codeData.max_uses !== null && codeData.current_uses >= codeData.max_uses) {
      return false;
    }

    if (codeData.per_user_limit !== null && codeData.per_user_limit !== undefined) {
      const { count: userUsageCount } = await (supabase as any)
        .from('promo_code_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('code_id', codeData.id)
        .eq('user_id', user.id);

      if ((userUsageCount ?? 0) >= codeData.per_user_limit) {
        return false;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('premium_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    await (supabase as any).from('promo_code_redemptions').insert({
      code_id: codeData.id,
      user_id: user.id
    });

    await supabase.from('user_roles').insert({
      user_id: user.id,
      role: 'premium'
    });

    const months = codeData.months_granted && typeof codeData.months_granted === 'number'
      ? codeData.months_granted
      : 12;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    await supabase.from('user_profiles').update({
      subscription_tier: 'premium',
      subscription_expires_at: expiryDate.toISOString()
    }).eq('id', user.id);

    return true;
  } catch (error) {
    console.error('Error validating premium code:', error);
    return false;
  }
};

/**
 * Generate a secure password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';

  // Ensure at least one character of each type
  password += charset[Math.floor(Math.random() * 26)]; // lowercase
  password += charset[Math.floor(Math.random() * 26) + 26]; // uppercase
  password += charset[Math.floor(Math.random() * 10) + 52]; // number
  password += charset[Math.floor(Math.random() * (charset.length - 62)) + 62]; // special

  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

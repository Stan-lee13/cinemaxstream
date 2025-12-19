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

/**
 * Validate premium code using database function
 */
export const validatePremiumCode = async (code: string): Promise<boolean> => {
  try {
    // Validate input
    if (!code || typeof code !== 'string') {
      return false;
    }

    // Trim and normalize the code
    const normalizedCode = code.trim().toUpperCase();

    // Check minimum length requirement
    if (normalizedCode.length < 5) {
      return false;
    }

    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // Direct table check for the code
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

    // Check expiration
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return false;
    }

    // Check usage limits
    if (codeData.max_uses !== null && codeData.current_uses >= codeData.max_uses) {
      return false;
    }

    // Code is valid - update usage count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('premium_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    // Grant premium role to user
    await supabase.from('user_roles').insert({
      user_id: user.id,
      role: 'premium'
    });

    // Also update profile subscription_tier/expires_at as a backup
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Default 30 days for code

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
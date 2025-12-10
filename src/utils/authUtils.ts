
/**
 * Authentication utility functions
 */

// Storage key for premium access
const PREMIUM_ACCESS_KEY = 'premium_access';
import ProductionValidator from '@/utils/productionValidation';

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
  } catch (error) {
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
  } catch (error) {
    return false;
  }
};

/**
 * Validate premium code via edge function
 * This should be moved to a secure edge function for production
 */
export const validatePremiumCode = async (code: string): Promise<boolean> => {
  if (!code || typeof code !== 'string') return false;
  try {
    const valid = await ProductionValidator.isValidPromoCode(code);
    return !!valid;
  } catch {
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

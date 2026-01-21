/**
 * Authentication utility functions
 */

export const hasPremiumAccess = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['premium', 'admin'])
      .maybeSingle();

    if (roleData) return true;

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

export const isAdmin = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    if (user.email?.toLowerCase() === 'stanleyvic13@gmail.com') return true;

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

export const validatePremiumCode = async (code: string): Promise<boolean> => {
  try {
    if (!code?.trim() || code.trim().length < 3) return false;

    const normalizedCode = code.trim().toUpperCase();
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Fetch the promo code
    const { data: codeData, error } = await supabase
      .from('premium_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !codeData) {
      console.warn('Promo code not found or inactive:', normalizedCode);
      return false;
    }
    
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

    // TRANSACTION: Update usage count
    const { error: updateError } = await supabase
      .from('premium_codes')
      .update({ current_uses: (codeData.current_uses ?? 0) + 1 })
      .eq('id', codeData.id);
    
    if (updateError) {
      console.error('Failed to update promo code usage:', updateError);
      return false;
    }

    // Record redemption in promo_code_redemptions table
    await supabase.from('promo_code_redemptions').insert({
      code_id: codeData.id,
      user_id: user.id
    });

    // Calculate expiry based on duration_days or months_granted
    const expiryDate = new Date();
    if (codeData.months_granted && codeData.months_granted > 0) {
      expiryDate.setMonth(expiryDate.getMonth() + codeData.months_granted);
    } else {
      const days = codeData.duration_days ?? 30;
      expiryDate.setDate(expiryDate.getDate() + days);
    }

    // Check if user already has premium role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'premium')
      .maybeSingle();
    
    // Insert premium role if not exists
    if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'premium' as const });
      
      if (roleError) {
        console.error('Failed to insert user role:', roleError);
        // Continue anyway - profile update is more important
      }
    }

    // Update user_profiles with premium status - THIS IS CRITICAL
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: 'premium',
        role: 'premium',
        subscription_expires_at: expiryDate.toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to update user profile:', profileError);
      return false;
    }

    console.log('Promo code validated successfully. User upgraded to premium until:', expiryDate.toISOString());
    return true;
  } catch (error) {
    console.error('Error validating premium code:', error);
    return false;
  }
};

export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = charset[Math.floor(Math.random() * 26)] + charset[Math.floor(Math.random() * 26) + 26] + 
                 charset[Math.floor(Math.random() * 10) + 52] + charset[Math.floor(Math.random() * 12) + 62];
  for (let i = 4; i < length; i++) password += charset[Math.floor(Math.random() * charset.length)];
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

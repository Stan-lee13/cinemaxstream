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
    if (!code?.trim() || code.trim().length < 5) return false;

    const normalizedCode = code.trim().toUpperCase();
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: codeData, error } = await supabase
      .from('premium_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !codeData) return false;
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) return false;
    if (codeData.max_uses !== null && (codeData.current_uses ?? 0) >= codeData.max_uses) return false;

    // Update usage and apply premium
    await supabase.from('premium_codes').update({ current_uses: (codeData.current_uses ?? 0) + 1 }).eq('id', codeData.id);
    
    // Check existing role
    const { data: existingRole } = await supabase.from('user_roles').select('id').eq('user_id', user.id).eq('role', 'premium').maybeSingle();
    if (!existingRole) {
      await supabase.from('user_roles').insert({ user_id: user.id, role: 'premium' as const });
    }

    const days = codeData.duration_days ?? 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    await supabase.from('user_profiles').update({
      subscription_tier: 'premium',
      role: 'premium',
      subscription_expires_at: expiryDate.toISOString()
    }).eq('id', user.id);

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

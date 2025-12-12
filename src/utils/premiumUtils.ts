/**
 * Premium membership utility functions
 * SECURITY: All premium validation now happens server-side via database
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Check if user has premium access based on database roles and subscription
 * @returns Promise<boolean> - true if user has active premium access
 */
export const checkPremiumAccess = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }
  
  try {
    // Check user_roles table for premium role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'premium')
      .maybeSingle();
    
    if (roleData) return true;
    
    // Check subscription expiry date
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .maybeSingle();
    
    if (profile?.subscription_expires_at) {
      const expiryDate = new Date(profile.subscription_expires_at);
      return expiryDate > new Date();
    }
    
    return false;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
};

/**
 * Check if user has admin role
 * @returns Promise<boolean> - true if user is an admin
 */
export const checkAdminAccess = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }
  
  try {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !!roleData;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

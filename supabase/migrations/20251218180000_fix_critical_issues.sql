-- Fix critical issues with Admin Panel, Promo Codes, and User Management

-- 1. Ensure the admin user has the correct role in both auth.users metadata and user_profiles
-- Replace 'stanleyvic13@gmail.com' with the actual admin email if different, but this matches the code.
DO $$
BEGIN
  -- Update user_profiles role
  UPDATE public.user_profiles 
  SET role = 'admin' 
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'stanleyvic13@gmail.com');

  -- Update auth.users metadata (for potential token claims)
  UPDATE auth.users 
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb 
  WHERE email = 'stanleyvic13@gmail.com';

  -- Ensure entry in user_roles
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::user_role 
  FROM auth.users 
  WHERE email = 'stanleyvic13@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 2. Fix RLS Policies for Admin Access to User Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_admin());

-- 3. Fix RLS Policies for User Roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin());

-- 4. Fix RLS Policies for Content Management
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
CREATE POLICY "Admins can manage content"
ON public.content
FOR ALL
USING (public.is_admin());

-- 5. Fix Promo Code Validation Logic (Case Insensitive) and Policies
-- Recreate the validation function to be robust and case-insensitive
CREATE OR REPLACE FUNCTION public.validate_premium_code(input_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Look up the code (case insensitive comparison)
  SELECT * INTO code_record
  FROM public.premium_codes
  WHERE UPPER(code) = UPPER(TRIM(input_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  -- If code exists and is valid, increment usage counter
  IF FOUND THEN
    UPDATE public.premium_codes
    SET current_uses = current_uses + 1
    WHERE id = code_record.id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Ensure Admins can manage premium codes (CRUD)
DROP POLICY IF EXISTS "Admins can manage premium codes" ON public.premium_codes;
CREATE POLICY "Admins can manage premium codes"
ON public.premium_codes
FOR ALL
USING (public.is_admin());

-- 6. Insert/Update the problematic promo code
INSERT INTO public.premium_codes (code, is_active, max_uses, notes)
VALUES ('Stanley123.', true, 100, 'Admin Special Code')
ON CONFLICT (code) DO UPDATE 
SET is_active = true, 
    notes = 'Admin Special Code (Fixed)';

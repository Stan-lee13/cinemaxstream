-- Security Fix: Prevent users from updating their own role field
-- This fixes the privilege escalation vulnerability

-- Drop the existing overly-permissive UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.user_profiles;

-- Create a new UPDATE policy that excludes role, subscription_tier, subscription_expires_at, and priority_level
-- Users can only update safe fields like username, avatar_url, timezone
CREATE POLICY "Users can update their own profile safely" ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure role is not being changed
  role IS NOT DISTINCT FROM (SELECT role FROM public.user_profiles WHERE id = auth.uid()) AND
  -- Ensure subscription_tier is not being changed
  subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.user_profiles WHERE id = auth.uid()) AND
  -- Ensure subscription_expires_at is not being changed
  subscription_expires_at IS NOT DISTINCT FROM (SELECT subscription_expires_at FROM public.user_profiles WHERE id = auth.uid()) AND
  -- Ensure priority_level is not being changed
  priority_level IS NOT DISTINCT FROM (SELECT priority_level FROM public.user_profiles WHERE id = auth.uid())
);

-- Create admin-only policy for updating sensitive fields
CREATE POLICY "Admins can update all profile fields" ON public.user_profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add a comment explaining the security rationale
COMMENT ON POLICY "Users can update their own profile safely" ON public.user_profiles IS 
'Security: Users can only update safe fields (username, avatar_url, timezone). Role and subscription fields are protected to prevent privilege escalation.';

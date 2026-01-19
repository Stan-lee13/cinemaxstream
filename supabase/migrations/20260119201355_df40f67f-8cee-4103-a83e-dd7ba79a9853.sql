-- Add missing columns to premium_codes table
ALTER TABLE public.premium_codes
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'premium',
ADD COLUMN IF NOT EXISTS months_granted integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS per_user_limit integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

-- Create promo_code_redemptions table for tracking user redemptions
CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.premium_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(code_id, user_id)
);

-- Enable RLS on promo_code_redemptions
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.promo_code_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own redemptions
CREATE POLICY "Users can insert their own redemptions"
  ON public.promo_code_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON public.promo_code_redemptions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_action_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  target_user_id uuid,
  action_type text NOT NULL,
  action_description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_action_logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access admin logs
CREATE POLICY "Admins can manage action logs"
  ON public.admin_action_logs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blocked_content table for admin to hide specific content
CREATE TABLE IF NOT EXISTS public.blocked_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL UNIQUE,
  blocked_by uuid,
  reason text,
  blocked_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on blocked_content
ALTER TABLE public.blocked_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read blocked content (to filter it out)
CREATE POLICY "Everyone can read blocked content"
  ON public.blocked_content
  FOR SELECT
  USING (true);

-- Policy: Only admins can manage blocked content
CREATE POLICY "Admins can manage blocked content"
  ON public.blocked_content
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blocked_users table for admin to block users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  blocked_by uuid,
  reason text,
  blocked_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage blocked users
CREATE POLICY "Admins can manage blocked users"
  ON public.blocked_users
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Users can check if they are blocked
CREATE POLICY "Users can check their own block status"
  ON public.blocked_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add admin role check for stanleyvic13@gmail.com if not exists
-- This needs to be run manually or via edge function with service role
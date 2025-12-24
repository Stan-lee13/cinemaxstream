-- Add per-user promo limits and usage tracking plus admin audit logs

-- 1. Extend premium_codes with per-user usage limit
ALTER TABLE public.premium_codes
  ADD COLUMN IF NOT EXISTS per_user_limit INTEGER;

-- 2. Create promo_code_redemptions table to track individual uses
CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.premium_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code_id
  ON public.promo_code_redemptions(code_id);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user_id
  ON public.promo_code_redemptions(user_id);

CREATE POLICY "Admins can view all promo redemptions"
ON public.promo_code_redemptions
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can view their own promo redemptions"
ON public.promo_code_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own promo redemptions"
ON public.promo_code_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3. Admin action audit log
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES public.user_profiles(id),
  action_type text NOT NULL,
  action_description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_id
  ON public.admin_action_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target_user_id
  ON public.admin_action_logs(target_user_id);

CREATE POLICY "Admins can view admin action logs"
ON public.admin_action_logs
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can insert admin action logs"
ON public.admin_action_logs
FOR INSERT
WITH CHECK (public.is_admin());


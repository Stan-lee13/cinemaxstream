
-- Create user_wraps table for storing generated wrap snapshots
CREATE TABLE public.user_wraps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  wrap_type text NOT NULL DEFAULT 'monthly' CHECK (wrap_type IN ('monthly', 'yearly')),
  total_minutes integer NOT NULL DEFAULT 0,
  total_titles integer NOT NULL DEFAULT 0,
  top_genre text,
  top_titles jsonb DEFAULT '[]'::jsonb,
  longest_binge_session integer DEFAULT 0,
  most_active_day text,
  binge_streak integer DEFAULT 0,
  completion_rate integer DEFAULT 0,
  personality_title text,
  personality_comment text,
  downloads_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  active_days integer DEFAULT 0,
  monthly_trend jsonb DEFAULT '[]'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year, wrap_type)
);

-- Enable RLS
ALTER TABLE public.user_wraps ENABLE ROW LEVEL SECURITY;

-- Users can view their own wraps
CREATE POLICY "Users can view own wraps"
  ON public.user_wraps FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own wraps
CREATE POLICY "Users can insert own wraps"
  ON public.user_wraps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own wraps
CREATE POLICY "Users can update own wraps"
  ON public.user_wraps FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_wraps_user_period ON public.user_wraps(user_id, year, month);

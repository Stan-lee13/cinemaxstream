
-- Add role and timezone fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'free' CHECK (role IN ('free', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 3 CHECK (priority_level IN (1, 2, 3));

-- Update priority_level based on role
UPDATE public.user_profiles 
SET priority_level = CASE 
  WHEN role = 'premium' THEN 1
  WHEN role = 'pro' THEN 2
  ELSE 3
END;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  watched_today integer DEFAULT 0,
  downloads_today integer DEFAULT 0,
  last_reset timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_usage table
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_usage
CREATE POLICY "Users can view their own usage" 
  ON public.user_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON public.user_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
  ON public.user_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create watch sessions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.watch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  content_title text,
  content_duration integer, -- in seconds
  session_start timestamp with time zone DEFAULT now(),
  session_end timestamp with time zone,
  total_watched_time integer DEFAULT 0, -- in seconds
  watch_events jsonb DEFAULT '[]'::jsonb,
  credit_deducted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on watch_sessions table
ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for watch_sessions
CREATE POLICY "Users can view their own watch sessions" 
  ON public.watch_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watch sessions" 
  ON public.watch_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch sessions" 
  ON public.watch_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_usage updated_at
CREATE TRIGGER update_user_usage_updated_at 
    BEFORE UPDATE ON public.user_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- Create a table for storing user watch history
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  poster_path VARCHAR,
  watch_time INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  type VARCHAR NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress INTEGER NOT NULL DEFAULT 0,
  episode_id VARCHAR,
  season_number INTEGER,
  episode_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies that allows users to manage their own watch history
CREATE POLICY "Users can view their own watch history" 
  ON public.watch_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" 
  ON public.watch_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" 
  ON public.watch_history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history" 
  ON public.watch_history FOR DELETE 
  USING (auth.uid() = user_id);

-- Add index to improve query performance
CREATE INDEX IF NOT EXISTS watch_history_user_id_idx ON public.watch_history (user_id);
CREATE INDEX IF NOT EXISTS watch_history_content_id_idx ON public.watch_history (content_id);

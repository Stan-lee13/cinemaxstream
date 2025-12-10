
-- Create download_requests table to track user download attempts
CREATE TABLE public.download_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  season_number INTEGER,
  episode_number INTEGER,
  year TEXT,
  search_query TEXT,
  nkiri_url TEXT,
  download_url TEXT,
  quality TEXT,
  file_size TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, found, failed, completed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create download_search_cache table to cache AI search results
CREATE TABLE public.download_search_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL UNIQUE,
  nkiri_url TEXT,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for download_requests
ALTER TABLE public.download_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own download requests"
  ON public.download_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own download requests"
  ON public.download_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own download requests"
  ON public.download_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add RLS policies for download_search_cache (read-only for users)
ALTER TABLE public.download_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read search cache"
  ON public.download_search_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_download_requests_user_id ON public.download_requests(user_id);
CREATE INDEX idx_download_requests_status ON public.download_requests(status);
CREATE INDEX idx_download_search_cache_query ON public.download_search_cache(search_query);

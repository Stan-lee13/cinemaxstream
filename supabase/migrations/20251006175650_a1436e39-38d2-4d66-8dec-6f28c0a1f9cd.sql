-- Fix UUID to TEXT conversion for content IDs across all tables
-- Drop all foreign key constraints first

-- Drop foreign key constraints
ALTER TABLE public.user_favorites 
DROP CONSTRAINT IF EXISTS user_favorites_content_id_fkey;

ALTER TABLE public.episodes
DROP CONSTRAINT IF EXISTS episodes_content_id_fkey;

ALTER TABLE public.user_watch_history
DROP CONSTRAINT IF EXISTS user_watch_history_content_id_fkey;

-- Now convert all ID columns to TEXT
ALTER TABLE public.content 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

ALTER TABLE public.user_favorites 
ALTER COLUMN content_id TYPE TEXT USING content_id::TEXT;

ALTER TABLE public.user_watch_history 
ALTER COLUMN content_id TYPE TEXT USING content_id::TEXT;

ALTER TABLE public.episodes
ALTER COLUMN content_id TYPE TEXT USING content_id::TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_content_id 
ON public.user_favorites(content_id);

CREATE INDEX IF NOT EXISTS idx_watch_history_content_id 
ON public.user_watch_history(content_id);

CREATE INDEX IF NOT EXISTS idx_episodes_content_id 
ON public.episodes(content_id);

-- Note: We don't recreate foreign keys because TMDB IDs (strings) 
-- won't always exist in the content table (which is for curated content only)
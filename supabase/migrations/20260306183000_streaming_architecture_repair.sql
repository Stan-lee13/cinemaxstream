-- Pre-discovered stream sources for fast player startup
CREATE TABLE IF NOT EXISTS public.stream_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  provider text NOT NULL,
  source integer NOT NULL,
  latency_ms integer,
  quality text,
  is_available boolean NOT NULL DEFAULT false,
  last_checked timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_stream_sources_content_id ON public.stream_sources(content_id);
CREATE INDEX IF NOT EXISTS idx_stream_sources_available ON public.stream_sources(is_available, latency_ms);

ALTER TABLE public.stream_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stream sources"
ON public.stream_sources FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can write stream sources"
ON public.stream_sources FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update stream sources"
ON public.stream_sources FOR UPDATE TO authenticated
USING (true);

-- Aggregate provider health metrics for ranking and admin dashboards
CREATE TABLE IF NOT EXISTS public.stream_provider_health (
  provider_key text PRIMARY KEY,
  checks_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  success_rate numeric(6,4) NOT NULL DEFAULT 0,
  avg_latency_ms integer,
  consecutive_failures integer NOT NULL DEFAULT 0,
  is_healthy boolean NOT NULL DEFAULT true,
  last_checked timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_provider_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read provider health"
ON public.stream_provider_health FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can write provider health"
ON public.stream_provider_health FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Release radar + download discovery persistence
CREATE TABLE IF NOT EXISTS public.release_radar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id text NOT NULL UNIQUE,
  content_type text NOT NULL,
  title text NOT NULL,
  release_date date,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_scanned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.release_radar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read release radar"
ON public.release_radar FOR SELECT TO authenticated
USING (true);
CREATE POLICY "Authenticated write release radar"
ON public.release_radar FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.download_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id text NOT NULL,
  provider text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('direct','torrent','torrent_http')),
  download_url text NOT NULL,
  quality text,
  file_size text,
  is_valid boolean NOT NULL DEFAULT false,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz,
  UNIQUE(tmdb_id, provider, download_url)
);

CREATE INDEX IF NOT EXISTS idx_download_sources_tmdb_id ON public.download_sources(tmdb_id);
ALTER TABLE public.download_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read download sources"
ON public.download_sources FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated write download sources"
ON public.download_sources FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

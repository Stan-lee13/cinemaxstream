-- Device sessions hardening
ALTER TABLE public.device_sessions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN device_fingerprint SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_device_sessions_user_last_active
  ON public.device_sessions(user_id, last_active_at DESC);

-- Watch sessions hardening
ALTER TABLE public.watch_sessions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN content_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_created
  ON public.watch_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_content
  ON public.watch_sessions(content_id);

-- Watch history hardening
ALTER TABLE public.watch_history
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN content_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_watch_history_user_watched_at
  ON public.watch_history(user_id, watched_at DESC);

-- Stream health metrics hardening
ALTER TABLE public.stream_health_metrics
  ALTER COLUMN provider_key SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stream_health_metrics_provider_checked
  ON public.stream_health_metrics(provider_key, checked_at DESC);

-- Download request / cache hardening
ALTER TABLE public.download_requests
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_download_requests_user_status
  ON public.download_requests(user_id, status, created_at DESC);

ALTER TABLE public.download_search_cache
  ALTER COLUMN search_query SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_download_search_cache_verified
  ON public.download_search_cache(last_verified DESC);

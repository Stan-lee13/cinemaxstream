
-- Device sessions table for device limit tracking
CREATE TABLE public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_fingerprint text NOT NULL,
  device_os text,
  device_browser text,
  device_resolution text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own device sessions
CREATE POLICY "Users can view own devices" ON public.device_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON public.device_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON public.device_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON public.device_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins can view all device sessions
CREATE POLICY "Admins can manage all devices" ON public.device_sessions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Stream health metrics table
CREATE TABLE public.stream_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  response_time_ms integer,
  is_healthy boolean DEFAULT true,
  error_message text,
  checked_at timestamptz DEFAULT now(),
  checked_by uuid
);

ALTER TABLE public.stream_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stream health" ON public.stream_health_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert health metrics" ON public.stream_health_metrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage health metrics" ON public.stream_health_metrics
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

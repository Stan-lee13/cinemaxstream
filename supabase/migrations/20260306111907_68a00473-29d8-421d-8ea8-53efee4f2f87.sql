
-- Fix permissive RLS: restrict stream_health_metrics INSERT to authenticated users with user_id check
DROP POLICY IF EXISTS "Authenticated can insert health metrics" ON public.stream_health_metrics;
CREATE POLICY "Authenticated can insert health metrics" ON public.stream_health_metrics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = checked_by);

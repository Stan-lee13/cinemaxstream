ALTER TABLE public.user_watch_history
  ADD COLUMN IF NOT EXISTS content_type text,
  ADD COLUMN IF NOT EXISTS duration_seconds int,
  ADD COLUMN IF NOT EXISTS season_number int,
  ADD COLUMN IF NOT EXISTS episode_number int,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS poster_url text;

CREATE UNIQUE INDEX IF NOT EXISTS user_watch_history_unique
  ON public.user_watch_history (user_id, content_id, COALESCE(season_number,0), COALESCE(episode_number,0));

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own subs" ON public.push_subscriptions;
CREATE POLICY "users manage own subs" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins read all subs" ON public.push_subscriptions;
CREATE POLICY "admins read all subs" ON public.push_subscriptions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);
## Decisions Confirmed

- **Web Push:** YES — full VAPID + push subscriptions + send-push edge function.
- **Streaming/Download CDN:** wsrv.nl is image-only. Video and large binaries cannot be safely proxied through any free CDN without breaking the vidsrc/vidrock/videasy/vidlink iframe handshake, referrer chains, range requests, and DRM tokens. Verified — every free "video CDN" (jsDelivr, Statically, Cloudflare Workers free, BunnyCDN free trial) either blocks media MIME types, strips headers, or requires the file live in a Git repo. So **streaming and download URLs stay 100% untouched**, as the constraint requires. CDN scope = images + static assets only.

## 1. Image CDN (wsrv.nl, free, Cloudflare-backed)

- Rewrite `getImageUrl` in `src/utils/urlUtils.ts` so any TMDB / external poster URL becomes:
  ```
  https://wsrv.nl/?url=<encoded>&w=<size>&output=webp&q=82
  ```
  Sizes: `thumb` 200, `poster` 500, `backdrop` 1280.
- New `<CDNImage />` wrapper in `src/components/ui/CDNImage.tsx`. On `onError` it falls back to the original TMDB URL. Used by `ContentCard`, `ContinueWatching`, notification thumbnails, hero/backdrop.
- `index.html`: add `<link rel="preconnect" href="https://wsrv.nl">`, `<link rel="preconnect" href="https://image.tmdb.org" crossorigin>`, `<link rel="dns-prefetch" href="https://api.themoviedb.org">`.
- `public/sw.js` v4: extend IMAGE_CACHE strategy to allow `wsrv.nl` and `image.tmdb.org` cross-origin GETs (14-day TTL). Streaming/download domains explicitly excluded — only image hosts are added.
- `vercel.json`: add `Cache-Control: public, max-age=86400` for `/app-icon.png`, `/manifest.json`.

## 2. Static CDN (jsDelivr) for app icons + manifest fallback

- Reference `/app-icon.png` via Vercel's edge cache (already CDN). No code change needed beyond cache headers above. jsDelivr is mentioned only as documented backup if Vercel egress becomes an issue post-launch.

## 3. Continue Watching — Cross-Device Persistence

- Migration: extend `user_watch_history` with `content_type, duration_seconds, season_number, episode_number, title, poster_url`, plus a unique index on `(user_id, content_id, COALESCE(season_number,0), COALESCE(episode_number,0))`.
- `useVideoProgress.saveProgress`: when authed, debounced 5 s `upsert` to DB. Never blocks the player.
- `useContinueWatching` on mount: read DB rows, merge with localStorage (newest `last_watched` wins), seed localStorage from DB so offline still works.
- `removeItem`: deletes from DB + localStorage.
- 5% / 95% thresholds preserved.

## 4. Recommendations — Real Cards

- `supabase/functions/generate-ai-recommendations`: after OpenAI returns titles, call TMDB `search/multi` for each, attach `tmdb_id`, `poster_path`, `content_type`, `overview`, `vote_average`. Drop unresolved titles.
- `useAIRecommendations` returns `recommendations: ContentItem[]` and caches in localStorage for 4 h.
- New "Recommended for you" rail on `Index` (under Continue Watching).
- Cold-start fallback (< 3 watch entries): TMDB `discover` weighted by user's favorited genres — still real, dynamic.

## 5. Notifications — In-App + Real Web Push

**In-app:** `useEventNotifications` + Supabase realtime — isnt working, think deeply and fix it. Delete redundant `useRealNotifications`.

**Web Push (works when app fully closed):**

- Migration: `push_subscriptions` table with RLS scoped to `auth.uid()`.
- Generate VAPID keypair via a one-shot script run during this loop. Public key committed to client (`VITE_VAPID_PUBLIC_KEY` in `.env`). Private key + subject email added as Supabase secrets via `add_secret` (`VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
- `public/sw.js` v4: add `push` and `pushsubscriptionchange` handlers → `showNotification` with `data.route`.
- Client: after Notification permission granted, `pushManager.subscribe({ userVisibleOnly:true, applicationServerKey })` and upsert into `push_subscriptions`.
- New edge function `supabase/functions/send-push/index.ts`: signs payloads with VAPID (Deno-native `npm:web-push@3` or hand-rolled JWT) and POSTs to each subscription endpoint. Removes 410/404 stale subs.
- New edge function `supabase/functions/notify-new-content/index.ts` triggered from `useNewContentNotifier`'s realtime handler (admin/system path) and from a daily TMDB poll. Fan-out via `send-push`. And also add a cron job for notification 

## 6. Cleanups (audit close-out)

- Delete dead/duplicate files: `src/pages/dmcaData.ts`, `src/pages/faqData.ts`, `verify-fixes-simple.js`, `verify-fixes.js`, `verify_fixes_manual.cjs`, `verify_implementation.js`, `verify_implementation_final.js`, `verify_promo_code_fix.js`, `direct-test.js`, `test_promo_validation.js`, `create_test_promo_codes.cjs`, `create_test_promo_codes.js`, `insert_stanley_promo_code.sql`, `setup_premium_codes.sql`, `coverage/`, `playwright-report/`.
- `src/utils/productionConfig.ts`: drop hardcoded Supabase/TMDB keys; read from `import.meta.env`.
- Consolidate to `useEventNotifications`; delete `useRealNotifications`.
- SW: bump to `v4`, fix `clients.matchAll` → `self.clients.matchAll`, verify preview-iframe skip.
- `vercel.json`: add `Strict-Transport-Security`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Content-Security-Policy` mirroring meta tag, remove deprecated `X-XSS-Protection`.
- `useAIRecommendations`: use real `errorReporter` import, fix dep array.
- `useContinueWatching`: clean dep array warning.

## Database Migration

```sql
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
CREATE POLICY "users manage own subs" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all subs" ON public.push_subscriptions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
```

## Secrets I will request after approval

- `VAPID_PRIVATE_KEY` (auto-generated, I provide value)
- `VAPID_SUBJECT` (mailto:[cinemaxstream7@gmail.com](mailto:cinemaxstream7@gmail.com))
- `VITE_VAPID_PUBLIC_KEY` is committed to `.env` (public, safe).

## Explicitly NOT touched

- `src/utils/providers/*`, `useDownloadManager`, `useSmartDownload`, `useOfflineDownloads`
- `nkiri-scraper`, `ai-download-search`
- `download_requests` table, all download UI/naming
- Player iframe rules, SW media cache, allowed streaming domains

## Final Report (delivered after implementation)

- Issues fixed checklist
- Recommendations / Continue Watching / Notifications — verification steps
- CDN: wsrv.nl domains, sizes, cache headers, fallback
- Streaming + Download smoke-check confirmation (no code changes)
- Remaining risks: iOS Safari < 16.4 has no Web Push; wsrv.nl rate limits at very high traffic (mitigated by SW image cache).

Reply **"go"** to switch to build mode and execute.
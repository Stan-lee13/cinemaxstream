# CineMax Deep Structural Audit (Code-Verified)

Scope: Full repository audit focused on actual architecture and execution paths (not UI names alone).

## 1) Provider architecture — **PARTIALLY IMPLEMENTED**
- **Provider registry exists** in `src/utils/providers/providerUtils.ts` via `SOURCE_CONFIGS` mapping numeric sources to provider keys/domains for Videasy, Vidnest, Vidrock, Vidlink.
- **Provider adapters are minimal/inlined** (per-provider URL logic is conditionals in one file, not isolated adapter modules/interfaces).
- **Streaming URL generation exists** via `getStreamingUrlForSource`/`buildEmbedUrl`.
- **Fallback logic exists** via Smart Source Engine (`getNextFallback`) and player error/timeout switching in `VideoPlayerWrapper`.
- **Latency measurement exists** via `probeSource` (`performance.now`) and iframe load timing in `VideoPlayerWrapper`.
- **Health scoring exists** (EMA latency + success/failure counters + unhealthy after repeated failures) in `smartSourceEngine`.
- **Architectural split issue**: legacy provider system (`src/utils/streamingUtils.ts`, `src/utils/contentUtils.ts`) is inconsistent with active source-based runtime path.

## 2) Player system — **PARTIALLY IMPLEMENTED**
- **Source switching exists** in `VideoPlayerWrapper` + `SourceSelector` (active source state and manual switching).
- **Timestamp restoration is missing in active player path**: progress is saved (`useVideoProgress` + postMessage listeners), but `VideoPlayerWrapper` does not read prior progress and pass `options.progress` to URL generation.
- **Error fallback pipeline exists**: timeout-based failover + iframe error failover + retry/reset controls.
- **Provider abstraction layer is partial/inconsistent**: active runtime uses source numbers (`providerUtils`), while `ContentDetail` also renders `StreamingProviderSelector` using `activeProvider` from `useContentDetail`; this selector is not wired into `VideoPlayerWrapper` source selection.

## 3) Background services — **PARTIALLY IMPLEMENTED**
- **Stream health monitor exists (client-side interval)** in `streamHealthMonitor.ts`, started from `AuthContext`.
- **Release radar crawler: missing** (no crawler worker/service discovered).
- **Download discovery workers: missing as background workers**; only request-driven edge functions (`ai-download-search`, `nkiri-scraper`) exist.
- **Torrent conversion workers: missing** (no conversion pipeline/worker found).

## 4) Database schema — **PARTIALLY IMPLEMENTED**
- **Device tracking table exists**: `device_sessions` (migration `20260306111848...`).
- **Provider metrics table exists**: `stream_health_metrics` (same migration + insert-policy hardening in `20260306111907...`).
- **Watch session tables exist**: `watch_sessions` (`20250624174018...`) and watch history table `watch_history` (`20241001000001...`).
- **Download source tables are partial**: `download_requests` and `download_search_cache` exist (`20250625004154...`), but no normalized provider/source graph or torrent-conversion source schema found.

## 5) Server infrastructure — **NOT IMPLEMENTED** (for requested scheduler/queue model)
- No repository evidence of:
  - cron jobs,
  - scheduled task configuration,
  - queue infrastructure,
  - background worker pipeline framework.
- Supabase edge functions exist, but they are request/response handlers (not scheduled pipelines).
- `supabase/config.toml` contains only project id.

## 6) Anti-ad protection (5 layers) — **PARTIALLY IMPLEMENTED**
- **Iframe sandbox policy**: **missing** (iframe in player has `referrerPolicy` and `allow`, but no `sandbox` attribute).
- **Click interceptor**: implemented.
- **Mutation observer ad scrubber**: implemented.
- **Overlay shield**: implemented.
- **Ad-domain request filter**: implemented (fetch/XHR interception).

## 7) Adaptive Stream Intelligence Engine — **PARTIALLY IMPLEMENTED**
Verified ranking uses:
- **Device type**: yes (`isMobile` user-agent/viewport logic).
- **Latency**: yes (`probeSource`, EMA updates, ranking sort).
- **Failure rate/health**: yes (`failures`, `healthy`, fallback ranking).
- **Network speed**: partial yes (Network Information API `effectiveType` slow-network branch).
- **Country**: **missing** (no geo/country signal in ranking logic).

## 8) Streaming provider configuration (Vidrock, Vidnest, Videasy, Vidlink) — **IMPLEMENTED**
- All four providers are present in active source config and used by active player URL generation.
- Source selector labels map directly to these providers.

## 9) Device limit system — **PARTIALLY IMPLEMENTED**
- **Device fingerprinting**: implemented (`generateFingerprint`).
- **Device storage**: implemented (`device_sessions` table + upsert).
- **Max device enforcement**: implemented as oldest-session pruning after limit exceeded.
- **Admin device dashboard**: missing in UI (no admin page section for `device_sessions`; helper functions exist but are unused by admin interface).

## 10) Release Radar Engine — **NOT IMPLEMENTED** (as automated engine)
- **Automated discovery of new releases**: missing as engine/crawler; `getNewReleases` is runtime TMDB fetch/sort.
- **Automated discovery of streaming sources**: missing.
- **Automated discovery of downloadable files**: missing as automation; current flow is user-triggered edge functions (`ai-download-search` + `nkiri-scraper`).

---

## Key modules inspected
- Providers/player:
  - `src/utils/providers/providerUtils.ts`
  - `src/utils/providers/smartSourceEngine.ts`
  - `src/utils/providers/streamHealthMonitor.ts`
  - `src/components/VideoPlayerWrapper.tsx`
  - `src/components/SourceSelector.tsx`
  - `src/components/StreamingProviderSelector.tsx`
  - `src/hooks/useVideoProgress.ts`
  - `src/hooks/useContentDetail.ts`
  - `src/pages/ContentDetail.tsx`
- Anti-ad:
  - `src/utils/providers/adProtection.ts`
- Background/download:
  - `supabase/functions/ai-download-search/index.ts`
  - `supabase/functions/nkiri-scraper/index.ts`
- Schema:
  - `supabase/migrations/20250624174018-0ac71155-c5e0-4a0a-a551-d62902217cac.sql`
  - `supabase/migrations/20250625004154-22461bb0-c2d3-4052-8f79-758607fe3a59.sql`
  - `supabase/migrations/20260306111848_383b0dfd-2779-4b36-acec-977fa9a0d280.sql`
  - `supabase/migrations/20260306111907_68a00473-29d8-421d-8ea8-53efee4f2f87.sql`
  - `supabase/migrations/20241001000001_create_watch_history_table.sql`
- Infra/new releases:
  - `supabase/config.toml`
  - `src/services/tmdbApiProduction.ts`
  - `src/pages/NewReleases.tsx`

# Audit & Fix Plan

## Issues Found

### 1. VidRock (Source 3) — URLs completely broken

**Root cause:** `providerUtils.ts` builds VidRock URLs as `vidrock.net/embed/{id}` and `vidrock.net/embed/tv/{id}/...` but VidRock's actual API uses `vidrock.net/movie/{id}` and `vidrock.net/tv/{id}/...` (no `/embed/` prefix).

**Fix:** Update `buildEmbedUrl` for `vidrock_net`:

- Movies: `https://vidrock.net/movie/{tmdb_id}`
- TV: `https://vidrock.net/tv/{tmdb_id}/{season}/{episode}`

### 2. AutoEmbed (Source 1) — URL pattern is already correct

Confirmed from autoembed.cc docs: `player.autoembed.cc/embed/movie/{tmdb_id}` and `player.autoembed.cc/embed/tv/{tmdb_id}/{season}/{episode}`. Our code matches. The `?server=2` fallback is also documented. No change needed.

### 3. Anime Season/Episode — Jujutsu Kaisen showing 1 season with 59 episodes

**Root cause:** The `getTvShowSeasons` in `tmdbApiProduction.ts` fetches season data from TMDB correctly (TMDB returns 3 seasons for JJK). The filter `s.episode_count > 0` is fine. However, the issue is that `useContentDetail.ts` line 111-114 has a `useEffect` that calls `loadEpisodesForSeason(seasons[0].season_number)` every time `seasons` changes — and `loadEpisodesForSeason` is not memoized with `useCallback`, so it changes on every render, causing an infinite loop that may collapse state. Also, this effect fires redundantly since the initial fetch already loads first season episodes.

**Fix:**

- Remove the redundant `useEffect` in `ContentDetail.tsx` (lines 111-115) that calls `loadEpisodesForSeason` on mount — the hook already loads first season episodes during initial fetch.
- Wrap `loadEpisodesForSeason` in `useCallback` in `useContentDetail.ts`.

### 4. Download system — "Download failed" for pro users

**Root cause:** The download system itself works (DB insert + new tab open). The likely failure is the `dl.vidsrc.vip` URL pattern. Let me verify the URL construction: for movies it builds `dl.vidsrc.vip/movie/{contentId}` — but `contentId` could be a UUID from Supabase DB, not a TMDB ID. The download URL needs the TMDB ID. And also the offline functionality isnt found users cant see where to add file even when in the download page 

**Fix:** In `DownloadModal.tsx`, accept a `tmdbId` prop and use it for building the download URL instead of `contentId`. Update `ContentDetail.tsx` to pass `tmdbId` to `DownloadButton`/`DownloadModal`. And also Fix the offline and file functionalities 

### 5. Wrap — Top Titles slide shows only text, no TMDB posters

**Root cause:** `SlideTopTitles` renders title text only — no poster images. The `topTitles` data only has `{ title, count, minutes }` with no image URL.

**Fix:** When processing wrap data, look up each top title's TMDB poster by searching TMDB. Store poster URL in `topTitles` array. Render poster images in `SlideTopTitles`.

### 6. Wrap — Shareable summary shares text, not an image card

**Root cause:** `SlideSummary` shares plain text via `navigator.share()`. The "Download as Image" button is missing — no canvas/PNG export.

**Fix:** Add `html2canvas` or use the native Canvas API to render the summary card `div` as a PNG, add a "Download as Image" button that exports it.

### 7. `topGenre` is always "Movies" — hardcoded fallback

**Root cause:** In `processWrapData` line 117: `const topGenre = s.length > 0 ? 'Movies' : 'N/A';` — the genre is never computed from actual data because `watch_sessions` doesn't store genre info.

**Fix:** Use the content titles from watch sessions to look up genres from TMDB, or at minimum derive genre from content_type categories. For now, use a simple heuristic based on content metadata available in sessions.

---

## Summary of Changes


| File                                   | Change                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/utils/providers/providerUtils.ts` | Fix VidRock URL pattern: `/movie/{id}` and `/tv/{id}/s/e`                           |
| `src/pages/ContentDetail.tsx`          | Remove redundant `loadEpisodesForSeason` useEffect; pass `tmdbId` to DownloadButton |
| `src/hooks/useContentDetail.ts`        | Wrap `loadEpisodesForSeason` in `useCallback`                                       |
| `src/components/DownloadModal.tsx`     | Accept `tmdbId` prop, use for download URL                                          |
| `src/components/DownloadButton.tsx`    | Pass through `tmdbId` prop                                                          |
| `src/pages/Wrap.tsx`                   | Fetch TMDB posters for top titles; add canvas-based PNG export for summary card     |

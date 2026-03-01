# Full Codebase Audit and Fix Plan

## Build Errors (Critical - Must Fix First)

### 1. TypeScript `error` of type `unknown` in Edge Functions

Three edge functions use `error.message` without narrowing `unknown`:

- `supabase/functions/admin-confirm-user/index.ts` (line 119)
- `supabase/functions/admin-get-users/index.ts` (line 122)
- `supabase/functions/upgrade-user-subscription/index.ts` (line 153)

**Fix:** Cast `error` to `Error` or use conditional check:

```typescript
const message = error instanceof Error ? error.message : "Internal server error";
```

### 2. TypeScript `Uint8Array` incompatibility in `useDownloadManager.ts` (line 132)

`new Blob(chunks)` fails because `Uint8Array<ArrayBufferLike>[]` is not assignable to `BlobPart[]`.

**Fix:** Cast chunks explicitly:

```typescript
const blob = new Blob(chunks as BlobPart[], { type: mimeType });
```

---

## Functional Issues Found

### 3. `useUserTier.ts` - Self-Downgrade on Expired Subscription (Security Risk)

Lines 91-96: When a premium user's subscription expires, the hook tries to update `user_profiles` directly. This will **silently fail** due to the RLS policy that prevents users from changing their own `role`, `subscription_tier`, and `subscription_expires_at`. The user sees `free` tier in UI but the DB may still say `premium`.

**Fix:** Remove the client-side downgrade attempt. Instead, just set the local state to `free` without touching the DB. Expired subscription handling should be done server-side (e.g., a scheduled function or during the next edge function call).

### 4. `DownloadModal.tsx` - Download Tracking Uses Wrong Update Matcher (line 123-126)

The `update` query after download completion uses `.eq('content_title', contentTitle).eq('content_type', contentType).is('completed_at', null)` which is fragile and could match wrong rows if user downloads the same content twice.

**Fix:** Store the inserted row's `id` from the initial insert and use it for the update.

### 5. `ContentDetail.tsx` - Skip Functionality Stub (line 110-112)

`handleSkipPlayback` is an empty callback. Not harmful but is unused dead code.

**Fix:** Remove.

### 6. Admin Panel - `handleBanUser` Updates `user_profiles` Directly (lines 271-275)

The admin bans a user and then tries to update `user_profiles.subscription_tier`, `role`, and `subscription_expires_at` directly. This will fail because the admin's RLS policy on `user_profiles` requires `has_role(auth.uid(), 'admin')`, but the Supabase client uses the **anon key**, not the service role key. The `user_roles` delete on line 270 may work since admin has an ALL policy on `user_roles`.

**Fix:** Use the `upgrade-user-subscription` edge function for profile updates during ban, or add a dedicated admin ban edge function that uses the service role key.

### 7. Admin Panel - `handleTogglePromo` and `handleDeletePromo` Use Client Queries

Lines 370-388: These operations query `premium_codes` directly via the Supabase client. The RLS policy requires `is_admin()` which checks `user_roles`. This should work if the admin user has the `admin` role in `user_roles`, but the `is_admin()` function uses `auth.uid()` which relies on the JWT. If the admin role was granted via a migration, this should be fine.

**Status:** Working if admin role is properly set. No fix needed but worth verifying.

### 8. `supabase/config.toml` - Missing Edge Function JWT Config

The config only has `project_id`. No `[functions.*]` sections with `verify_jwt = false`. Edge functions default to `verify_jwt = true`, which means the Supabase client's `functions.invoke()` automatically passes the JWT. This is correct behavior for authenticated endpoints.

**Status:** OK - no change needed.

### 9. Upgrade Page Plans Grid Shows 3 Columns But Only 2 Plans (line 174)

`grid md:grid-cols-3` with only 2 plan cards creates unbalanced layout.

**Fix:** Change to `md:grid-cols-2`.

### 10. `CastButton.tsx` - Unused `airplayRef` (line 33)

`airplayRef` is declared but never used.

**Fix:** Remove unused ref.

### 11. `CastButton.tsx` - `window` Access at Module Level (line 117)

`const browserWindow = window as ChromeCastWindow;` is called at the component body level (outside hooks/callbacks). This is evaluated on every render and is fine in browser but would fail in SSR.

**Status:** Not harmful for this Vite/SPA setup, but could be moved inside the conditional check.

### 12. `useContentDetail.ts` - TMDB ID Extraction from Image URL (lines 186-192)

The regex `'/t/p/[^/]+/([^./]+)\\.(?:jpg|png|jpeg)'` tries to extract a TMDB ID from an image URL. TMDB image URLs contain a hash, not the content ID. This will produce incorrect IDs.

**Status:** Fallback is `contentId` so impact is minimal, but the logic is incorrect. Should be corrected.

### 13. `useSmartDownload.ts` - Still References AI Search and Nkiri Scraper

This hook still contains the full "smart download" pipeline (AI search, Nkiri scraper) that was supposed to be removed. It's used alongside the newer `useDownloadManager` and `DownloadModal`.

**Fix:** Either delete `useSmartDownload.ts` entirely (if no longer imported) or clean it up. Check imports first.

---

## Summary of Changes

```text
Files to edit:
1. supabase/functions/admin-confirm-user/index.ts    - Fix error type
2. supabase/functions/admin-get-users/index.ts        - Fix error type  
3. supabase/functions/upgrade-user-subscription/index.ts - Fix error type
4. src/hooks/useDownloadManager.ts                    - Fix Uint8Array blob cast
5. src/hooks/useUserTier.ts                           - Remove client-side downgrade
6. src/components/DownloadModal.tsx                    - Fix tracking update matcher
7. src/pages/Admin.tsx                                - Fix ban profile update
8. src/pages/Upgrade.tsx                              - Fix grid columns
9. src/components/CastButton.tsx                      - Remove unused ref
10. src/pages/ContentDetail.tsx                       - Remove empty stub
```

All 3 edge functions will be redeployed after fixes.
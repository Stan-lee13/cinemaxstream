/**
 * useNewContentNotifier
 *
 * Delivers BOTH in-app and native browser notifications when new content
 * is detected, so users come back even when the app is closed.
 *
 * Two channels:
 *   1. Supabase Realtime — INSERT on public.content fires instantly.
 *   2. TMDB polling      — every 30 min compares latest "new releases"
 *                          to a locally-cached id set; new ids → notify.
 *
 * Dedup: a single localStorage set ("seen_new_content_ids", capped at 500)
 * prevents duplicate alerts across the two channels.
 *
 * Persistence: when a user is logged in, every notification is stored in
 * `user_notifications` so it shows up in the in-app NotificationBar even
 * after a refresh.
 *
 * Native delivery: piggybacks on `sendNativeNotification` which uses the
 * service worker's `showNotification()` so alerts arrive even when the
 * tab is backgrounded. The SW already handles `notificationclick` and
 * navigates to `data.route`.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { getNewReleases } from '@/services/tmdbApi';
import { sendNativeNotification, getNativePermission } from '@/utils/nativeNotifications';
import type { ContentItem } from '@/types/content';

const SEEN_KEY = 'seen_new_content_ids';
const SEEN_MAX = 500;
const POLL_INTERVAL_MS = 30 * 60 * 1000; // 30 min
const NATIVE_THROTTLE_KEY = 'new_content_native_last';
const NATIVE_THROTTLE_MS = 60 * 60 * 1000; // at most 1 native push per hour

const loadSeen = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
};

const saveSeen = (set: Set<string>) => {
  try {
    const arr = Array.from(set).slice(-SEEN_MAX);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    /* quota — ignore */
  }
};

const canFireNative = (): boolean => {
  if (getNativePermission() !== 'granted') return false;
  const last = parseInt(localStorage.getItem(NATIVE_THROTTLE_KEY) || '0', 10);
  return Date.now() - last >= NATIVE_THROTTLE_MS;
};

const markNativeFired = () => {
  localStorage.setItem(NATIVE_THROTTLE_KEY, String(Date.now()));
};

export function useNewContentNotifier() {
  const { user } = useAuth();
  const seenRef = useRef<Set<string>>(loadSeen());
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const insertInAppNotification = async (
      title: string,
      message: string,
      route: string
    ) => {
      if (!user) return;
      try {
        await supabase.from('user_notifications').insert({
          user_id: user.id,
          title,
          message,
          type: 'content',
          route,
        });
      } catch {
        /* silent */
      }
    };

    const handleNewItem = async (
      id: string,
      title: string,
      kind: 'movie' | 'series' | 'content',
      route: string
    ) => {
      if (seenRef.current.has(id)) return;
      seenRef.current.add(id);
      saveSeen(seenRef.current);

      const notifTitle = '🎬 New on CineMax';
      const body = `${title} is now available to stream.`;

      // 1) In-app row
      await insertInAppNotification(notifTitle, body, route);

      // 2) Native browser notification (works when tab is closed/background)
      if (canFireNative()) {
        const fired = await sendNativeNotification(notifTitle, body, {
          route,
          tag: `new-content-${id}`,
        });
        if (fired) markNativeFired();
      }
    };

    // ── Channel 1: Supabase Realtime on public.content ─────────────────
    const channel = supabase
      .channel('new-content-notifier')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content' },
        (payload) => {
          const row = payload.new as {
            id: string;
            title: string;
            content_type?: string;
          };
          if (!row?.id || !row?.title) return;
          const kind = row.content_type === 'series' ? 'series' : 'movie';
          handleNewItem(String(row.id), row.title, kind, `/content/${row.id}`);
        }
      )
      .subscribe();

    // ── Channel 2: TMDB polling for new releases ───────────────────────
    let cancelled = false;

    const pollTmdb = async () => {
      try {
        const items: ContentItem[] = await getNewReleases();
        if (cancelled || !Array.isArray(items)) return;

        // First run after install: don't spam. Just seed the seen-set.
        const isFirstRun = seenRef.current.size === 0;
        if (isFirstRun) {
          items.forEach((it) => seenRef.current.add(String(it.id)));
          saveSeen(seenRef.current);
          return;
        }

        // Find genuinely new items (limit to 3 alerts per poll)
        const fresh = items.filter((it) => !seenRef.current.has(String(it.id))).slice(0, 3);
        for (const it of fresh) {
          const kind = it.type === 'series' ? 'series' : 'movie';
          await handleNewItem(
            String(it.id),
            it.title,
            kind,
            `/content/${it.id}`
          );
        }
      } catch {
        /* network / TMDB hiccup — try again next interval */
      }
    };

    // Initial poll after a short delay so the app finishes booting
    const bootTimer = window.setTimeout(pollTmdb, 15_000);
    const interval = window.setInterval(pollTmdb, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(bootTimer);
      window.clearInterval(interval);
      supabase.removeChannel(channel);
      startedRef.current = false;
    };
  }, [user]);
}

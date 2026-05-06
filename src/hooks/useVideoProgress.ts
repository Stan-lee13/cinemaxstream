/**
 * Video progress tracking hook
 * Stores playback progress in localStorage AND mirrors it to Supabase
 * (`user_watch_history`) so Continue Watching works across devices.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VideoProgress {
  contentId: string;
  contentType: string;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  timestamp: number;
  source: number;
  title?: string;
  poster?: string;
}

interface VidRockMediaData {
  type: string;
  data: {
    currentTime?: number;
    duration?: number;
    title?: string;
    episode?: number;
    season?: number;
  };
}

const PROGRESS_STORAGE_KEY = 'video_progress';
const MAX_STORED_ITEMS = 100;
const DB_DEBOUNCE_MS = 5000;

export const useVideoProgress = () => {
  const [allProgress, setAllProgress] = useState<VideoProgress[]>([]);
  const vidRockListenerRef = useRef<boolean>(false);
  const dbSyncTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load progress from localStorage on mount + hydrate from DB
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) setAllProgress(JSON.parse(stored) as VideoProgress[]);
    } catch {
      /* ignore */
    }

    // Background: pull last ~50 rows from DB and merge (newest wins per key)
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return;
        const { data, error } = await supabase
          .from('user_watch_history')
          .select(
            'content_id, content_type, season_number, episode_number, watch_position, duration_seconds, last_watched, title, poster_url'
          )
          .eq('user_id', auth.user.id)
          .order('last_watched', { ascending: false })
          .limit(50);
        if (error || !data) return;

        const dbItems: VideoProgress[] = data
          .filter((r) => r.content_id && (r.duration_seconds ?? 0) > 0)
          .map((r) => ({
            contentId: r.content_id as string,
            contentType: r.content_type || 'movie',
            season: r.season_number ?? undefined,
            episode: r.episode_number ?? undefined,
            position: r.watch_position || 0,
            duration: r.duration_seconds || 0,
            timestamp: r.last_watched ? new Date(r.last_watched).getTime() : Date.now(),
            source: 0,
            title: r.title || undefined,
            poster: r.poster_url || undefined,
          }));

        setAllProgress((prev) => {
          const map = new Map<string, VideoProgress>();
          const key = (p: VideoProgress) => `${p.contentId}:${p.season ?? ''}:${p.episode ?? ''}`;
          [...prev, ...dbItems].forEach((p) => {
            const k = key(p);
            const existing = map.get(k);
            if (!existing || p.timestamp > existing.timestamp) map.set(k, p);
          });
          const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_STORED_ITEMS);
          try {
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          return merged;
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // VidRock message listener
  useEffect(() => {
    if (vidRockListenerRef.current) return;
    vidRockListenerRef.current = true;

    const handleVidRockMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vidrock.net')) return;
      try {
        const data = event.data as VidRockMediaData;
        if (data?.type === 'MEDIA_DATA' && data.data) {
          localStorage.setItem('vidRockProgress', JSON.stringify(data.data));
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('message', handleVidRockMessage);
    return () => {
      window.removeEventListener('message', handleVidRockMessage);
      vidRockListenerRef.current = false;
    };
  }, []);

  // Debounced DB sync
  const scheduleDbSync = useCallback((p: VideoProgress) => {
    const key = `${p.contentId}:${p.season ?? ''}:${p.episode ?? ''}`;
    const existing = dbSyncTimers.current.get(key);
    if (existing) clearTimeout(existing);
    const t = setTimeout(async () => {
      dbSyncTimers.current.delete(key);
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return;
        await supabase.from('user_watch_history').upsert(
          {
            user_id: auth.user.id,
            content_id: p.contentId,
            content_type: p.contentType,
            season_number: p.season ?? null,
            episode_number: p.episode ?? null,
            watch_position: Math.floor(p.position),
            duration_seconds: Math.floor(p.duration),
            title: p.title ?? null,
            poster_url: p.poster ?? null,
            last_watched: new Date(p.timestamp).toISOString(),
            completed: p.duration > 0 && p.position >= p.duration * 0.95,
          },
          { onConflict: 'user_id,content_id,season_number,episode_number' }
        );
      } catch {
        /* never block playback */
      }
    }, DB_DEBOUNCE_MS);
    dbSyncTimers.current.set(key, t);
  }, []);

  const saveProgress = useCallback(
    (progress: VideoProgress) => {
      setAllProgress((prev) => {
        const existingIndex = prev.findIndex(
          (p) => p.contentId === progress.contentId && p.season === progress.season && p.episode === progress.episode
        );
        const stamped = { ...progress, timestamp: Date.now() };
        let updated: VideoProgress[];
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = stamped;
        } else {
          updated = [stamped, ...prev];
        }
        if (updated.length > MAX_STORED_ITEMS) updated = updated.slice(0, MAX_STORED_ITEMS);
        try {
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        scheduleDbSync(stamped);
        return updated;
      });
    },
    [scheduleDbSync]
  );

  const getProgress = useCallback(
    (contentId: string, season?: number, episode?: number): VideoProgress | null =>
      allProgress.find((p) => p.contentId === contentId && p.season === season && p.episode === episode) || null,
    [allProgress]
  );

  const clearProgress = useCallback((contentId: string, season?: number, episode?: number) => {
    setAllProgress((prev) => {
      const updated = prev.filter(
        (p) => !(p.contentId === contentId && p.season === season && p.episode === episode)
      );
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      // Best-effort DB delete
      (async () => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) return;
          let q = supabase
            .from('user_watch_history')
            .delete()
            .eq('user_id', auth.user.id)
            .eq('content_id', contentId);
          if (season !== undefined) q = q.eq('season_number', season);
          else q = q.is('season_number', null);
          if (episode !== undefined) q = q.eq('episode_number', episode);
          else q = q.is('episode_number', null);
          await q;
        } catch {
          /* ignore */
        }
      })();
      return updated;
    });
  }, []);

  const clearAllProgress = useCallback(() => {
    setAllProgress([]);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const getRecentlyWatched = useCallback(
    (limit: number = 10): VideoProgress[] =>
      allProgress
        .filter((p) => p.position > 0 && p.duration > 0 && p.position < p.duration * 0.95)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit),
    [allProgress]
  );

  return {
    allProgress,
    saveProgress,
    getProgress,
    clearProgress,
    clearAllProgress,
    getRecentlyWatched,
  };
};

/**
 * Persistent State Hook
 * Stores state in localStorage with TTL support and instant restore.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const PREFIX = 'cinemax_ps_';

interface StoredValue<T> {
  data: T;
  savedAt: number;
  ttl: number;
}

/**
 * Like useState but persisted to localStorage.
 * @param key Unique key
 * @param defaultValue Fallback value
 * @param ttlMs Time-to-live in ms (0 = forever). Default: 30 minutes
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  ttlMs: number = 30 * 60 * 1000
): [T, (val: T | ((prev: T) => T)) => void, () => void] {
  const fullKey = PREFIX + key;

  const readStored = (): T => {
    try {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return defaultValue;
      const parsed: StoredValue<T> = JSON.parse(raw);
      if (parsed.ttl > 0 && Date.now() - parsed.savedAt > parsed.ttl) {
        localStorage.removeItem(fullKey);
        return defaultValue;
      }
      return parsed.data;
    } catch {
      return defaultValue;
    }
  };

  const [value, setValueInternal] = useState<T>(readStored);
  const ttlRef = useRef(ttlMs);
  ttlRef.current = ttlMs;

  const setValue = useCallback((valOrFn: T | ((prev: T) => T)) => {
    setValueInternal(prev => {
      const next = typeof valOrFn === 'function' ? (valOrFn as (prev: T) => T)(prev) : valOrFn;
      try {
        const stored: StoredValue<T> = { data: next, savedAt: Date.now(), ttl: ttlRef.current };
        localStorage.setItem(fullKey, JSON.stringify(stored));
      } catch { /* storage full */ }
      return next;
    });
  }, [fullKey]);

  const clear = useCallback(() => {
    setValueInternal(defaultValue);
    try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
  }, [fullKey, defaultValue]);

  return [value, setValue, clear];
}

/**
 * Save and restore scroll position for a page.
 */
export function useScrollRestore(pageKey: string) {
  const storageKey = `${PREFIX}scroll_${pageKey}`;

  useEffect(() => {
    // Restore on mount
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const pos = parseInt(saved, 10);
        if (!isNaN(pos)) {
          requestAnimationFrame(() => window.scrollTo(0, pos));
        }
      }
    } catch { /* ignore */ }

    // Save on unmount / before navigation
    const save = () => {
      try { sessionStorage.setItem(storageKey, String(window.scrollY)); } catch { /* ignore */ }
    };

    window.addEventListener('beforeunload', save);
    return () => {
      save();
      window.removeEventListener('beforeunload', save);
    };
  }, [storageKey]);
}

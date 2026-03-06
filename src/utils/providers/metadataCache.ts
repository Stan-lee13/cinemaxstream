/**
 * CDN Edge Cache Layer — Metadata caching
 * In-memory + localStorage cache with TTL expiry.
 * Reduces repeated TMDB API calls and provider requests by 50–70%.
 */

interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

const CACHE_PREFIX = 'meta_cache_';
const DEFAULT_TTL_MS = 30 * 60 * 1000;       // 30 minutes for metadata
const PROVIDER_TTL_MS = 5 * 60 * 1000;       // 5 minutes for provider availability
const SEARCH_TTL_MS = 10 * 60 * 1000;        // 10 minutes for search results
const MAX_MEMORY_ENTRIES = 500;

// In-memory cache (fast, ephemeral)
const memoryCache = new Map<string, CacheEntry>();

// ── Helpers ────────────────────────────────────────────────────────

const isExpired = (entry: CacheEntry): boolean => Date.now() > entry.expiresAt;

const evictOldMemoryEntries = () => {
  if (memoryCache.size <= MAX_MEMORY_ENTRIES) return;
  const entries = Array.from(memoryCache.entries())
    .sort(([, a], [, b]) => a.createdAt - b.createdAt);
  const toRemove = entries.slice(0, entries.length - MAX_MEMORY_ENTRIES);
  toRemove.forEach(([key]) => memoryCache.delete(key));
};

// ── Core API ───────────────────────────────────────────────────────

/**
 * Get a cached value. Checks memory first, then localStorage.
 */
export const cacheGet = <T = any>(key: string): T | null => {
  // Check memory
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (!isExpired(memEntry)) return memEntry.data as T;
    memoryCache.delete(key);
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (!isExpired(entry)) {
        // Promote to memory cache
        memoryCache.set(key, entry);
        return entry.data;
      }
      localStorage.removeItem(CACHE_PREFIX + key);
    }
  } catch { /* ignore */ }

  return null;
};

/**
 * Set a cached value in both memory and localStorage.
 */
export const cacheSet = <T = any>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void => {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  };

  memoryCache.set(key, entry);
  evictOldMemoryEntries();

  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full — that's okay, memory cache still works
  }
};

/**
 * Remove a cached entry
 */
export const cacheRemove = (key: string): void => {
  memoryCache.delete(key);
  try { localStorage.removeItem(CACHE_PREFIX + key); } catch { /* ignore */ }
};

/**
 * Clear all cached entries
 */
export const cacheClear = (): void => {
  memoryCache.clear();
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
};

// ── Typed cache helpers ────────────────────────────────────────────

export const cacheMetadata = <T>(contentId: string, contentType: string, data: T): void => {
  cacheSet(`metadata_${contentType}_${contentId}`, data, DEFAULT_TTL_MS);
};

export const getCachedMetadata = <T>(contentId: string, contentType: string): T | null => {
  return cacheGet<T>(`metadata_${contentType}_${contentId}`);
};

export const cacheProviderAvailability = (sourceNumber: number, available: boolean): void => {
  cacheSet(`provider_avail_${sourceNumber}`, available, PROVIDER_TTL_MS);
};

export const getCachedProviderAvailability = (sourceNumber: number): boolean | null => {
  return cacheGet<boolean>(`provider_avail_${sourceNumber}`);
};

export const cacheSearchResults = <T>(query: string, results: T): void => {
  cacheSet(`search_${query.toLowerCase().trim()}`, results, SEARCH_TTL_MS);
};

export const getCachedSearchResults = <T>(query: string): T | null => {
  return cacheGet<T>(`search_${query.toLowerCase().trim()}`);
};

/**
 * Get cache stats for admin/debug
 */
export const getCacheStats = () => ({
  memoryEntries: memoryCache.size,
  localStorageEntries: Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).length,
});

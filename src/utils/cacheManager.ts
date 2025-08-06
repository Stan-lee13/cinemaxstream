/**
 * Production-grade cache management system
 */

import { CACHE_KEYS } from './productionConfig';

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
  version: string;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private currentVersion = '1.0.0';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enablePersistence: true,
      ...config
    };

    this.loadFromStorage();
    this.startCleanupInterval();
  }

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expiry,
      version: this.currentVersion
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, item);
    
    if (this.config.enablePersistence) {
      this.saveToStorage(key, item);
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    // Check version compatibility
    if (item.version !== this.currentVersion) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    
    if (this.config.enablePersistence) {
      this.removeFromStorage(key);
    }
  }

  clear(): void {
    this.cache.clear();
    
    if (this.config.enablePersistence) {
      this.clearStorage();
    }
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredItems++;
      } else {
        validItems++;
      }
      totalSize += JSON.stringify(item.data).length;
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      totalSizeBytes: totalSize,
      maxSize: this.config.maxSize,
      defaultTTL: this.config.defaultTTL
    };
  }

  // Evict least recently used item
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  // Start automatic cleanup
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  // Load cache from localStorage
  private loadFromStorage(): void {
    if (!this.config.enablePersistence) {
      return;
    }

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      
      for (const storageKey of keys) {
        const data = localStorage.getItem(storageKey);
        if (data) {
          const item: CacheItem = JSON.parse(data);
          const cacheKey = storageKey.replace('cache_', '');
          
          // Only load if not expired and version matches
          if (Date.now() <= item.expiry && item.version === this.currentVersion) {
            this.cache.set(cacheKey, item);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  // Save item to localStorage
  private saveToStorage(key: string, item: CacheItem): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      // Storage quota exceeded or not available
      console.warn('Failed to save cache to storage:', error);
    }
  }

  // Remove item from localStorage
  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error);
    }
  }

  // Clear all cache from localStorage
  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error);
    }
  }

  // Cache invalidation by pattern
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  // Preload cache with data
  preload(entries: Array<{ key: string; data: any; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }
}

// Create cache instances for different types of data
export const contentCache = new CacheManager({
  maxSize: 200,
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  enablePersistence: true
});

export const userCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  enablePersistence: true
});

export const searchCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  enablePersistence: false // Don't persist search results
});

// Convenience functions using the appropriate cache
export const cacheContent = (key: string, data: any, ttl?: number) => {
  contentCache.set(key, data, ttl);
};

export const getCachedContent = <T>(key: string): T | null => {
  return contentCache.get<T>(key);
};

export const cacheUser = (key: string, data: any, ttl?: number) => {
  userCache.set(key, data, ttl);
};

export const getCachedUser = <T>(key: string): T | null => {
  return userCache.get<T>(key);
};

export const cacheSearch = (key: string, data: any, ttl?: number) => {
  searchCache.set(key, data, ttl);
};

export const getCachedSearch = <T>(key: string): T | null => {
  return searchCache.get<T>(key);
};

export default CacheManager;
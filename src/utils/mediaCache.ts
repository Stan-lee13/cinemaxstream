import { toast } from 'sonner';

export interface MediaCacheConfig {
  maxSize: number;  // Maximum size in MB
  maxAge: number;   // Maximum age in milliseconds
  priority: 'high' | 'medium' | 'low';
}

class MediaCacheManager {
  private static instance: MediaCacheManager;
  private readonly DB_NAME = 'cinemaxstream-media-cache';
  private readonly STORE_NAME = 'media-metadata';
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initializeDB();
  }

  static getInstance(): MediaCacheManager {
    if (!MediaCacheManager.instance) {
      MediaCacheManager.instance = new MediaCacheManager();
    }
    return MediaCacheManager.instance;
  }

  private initializeDB(): void {
    const request = indexedDB.open(this.DB_NAME, 1);

    request.onerror = () => {
      console.error('Failed to open media cache database');
      toast.error('Failed to initialize media cache');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('size', 'size', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  async cacheMedia(mediaId: string, blob: Blob, config: MediaCacheConfig): Promise<boolean> {
    // Ensure DB is initialized; if not, still attempt caching to Cache Storage
    try {
      await this.waitForDBReady();

      // Check if we need to clear space first
      await this.enforceStorageLimits(config.maxSize).catch(() => {});

      interface MediaMetadata {
        id: string;
        timestamp: number;
        size: number;
        type: string;
        priority: 'high' | 'medium' | 'low';
        lastAccessed: number;
      }

      const metadata: MediaMetadata = {
        id: mediaId,
        timestamp: Date.now(),
        size: blob.size,
        type: blob.type,
        priority: config.priority,
        lastAccessed: Date.now(),
      };

      if (this.db) {
        const tx = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        store.put(metadata);
        await new Promise((resolve, reject) => {
          tx.oncomplete = () => resolve(null);
          tx.onerror = () => reject(tx.error);
        });
      }

      const cache = await caches.open('cinemaxstream-media-v3');
      await cache.put(mediaId, new Response(blob));

      return true;
    } catch (error) {
      console.error('Failed to cache media:', error);
      return false;
    }
  }

  async getMedia(mediaId: string): Promise<Response | null> {
    try {
      const cache = await caches.open('cinemaxstream-media-v3');
      const response = await cache.match(mediaId);

      if (response) {
        // Update access timestamp in IDB (best-effort)
        if (this.db) {
          const tx = this.db.transaction([this.STORE_NAME], 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.get(mediaId);
          req.onsuccess = () => {
            const metadata = req.result;
            if (metadata) {
              metadata.lastAccessed = Date.now();
              store.put(metadata);
            }
          };
        }
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve media from cache:', error);
      return null;
    }
  }

  private async enforceStorageLimits(maxSize: number): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const allReq = store.getAll();

    const allItems: Array<{ id: string; size?: number; priority?: 'high'|'medium'|'low'; timestamp?: number }> = await new Promise((resolve, reject) => {
      allReq.onsuccess = () => resolve(allReq.result || []);
      allReq.onerror = () => reject(allReq.error);
    });

    allItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        // Keep higher priority first
        const order: Record<'high'|'medium'|'low', number> = { high: 3, medium: 2, low: 1 };
        return order[b.priority || 'low'] - order[a.priority || 'low'];
      }
      return (a.timestamp ?? 0) - (b.timestamp ?? 0);
    });

    let totalSize = 0;
    const toDelete: string[] = [];
    for (const item of allItems) {
      totalSize += item.size || 0;
      if (totalSize > maxSize * 1024 * 1024) {
        if (item.id) toDelete.push(item.id);
      }
    }

    const mediaCache = await caches.open('cinemaxstream-media-v3');
    await Promise.all(toDelete.map(async (id) => {
      store.delete(id);
      await mediaCache.delete(id);
    }));
  }

  async clearExpiredMedia(maxAge: number): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const allReq = store.getAll();
    const allItems: Array<{ id: string; timestamp?: number }> = await new Promise((resolve, reject) => {
      allReq.onsuccess = () => resolve(allReq.result || []);
      allReq.onerror = () => reject(allReq.error);
    });

  const expired = Date.now() - maxAge;
  const expiredItems = allItems.filter(item => (item.timestamp ?? 0) < expired).map(i => i.id).filter(Boolean) as string[];
    const mediaCache = await caches.open('cinemaxstream-media-v3');

    await Promise.all(expiredItems.map(async (id) => {
      store.delete(id);
      await mediaCache.delete(id as string);
    }));
  }

  private waitForDBReady(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.db) return resolve();
        setTimeout(check, 50);
      };
      check();
    });
  }
}

export const mediaCache = MediaCacheManager.getInstance();
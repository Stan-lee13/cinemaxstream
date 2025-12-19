// Use a lightweight local channel type to avoid pulling in deep supabase generics
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SyncQueueItem, TableName, TableRow, RealtimePayload } from '@/types/sync';
import type { Database } from '@/integrations/supabase/types';

// Lightweight local types to avoid deep supabase realtime typings and `any` usage
interface LocalRealtimeChannel {
  on: (event: string, opts: Record<string, unknown>, cb: (payload: unknown) => void) => LocalRealtimeChannel;
  subscribe: (cb?: (status: string) => void) => void;
  unsubscribe?: () => Promise<void>;
}

interface LocalRealtimeClient {
  channel: (name: string) => LocalRealtimeChannel;
}

interface SyncOptions {
  syncInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

class RealtimeSync {
  private static instance: RealtimeSync | undefined;
  private channels: Map<TableName, LocalRealtimeChannel> = new Map();
  private syncQueue: Map<TableName, SyncQueueItem<TableName>[]> = new Map();
  private options: SyncOptions;

  private constructor(options: SyncOptions = {}) {
    this.options = {
      syncInterval: options.syncInterval || 5000,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
    };

    // Initialize offline sync queue: always listen for network coming back online
    window.addEventListener('online', () => this.processSyncQueue());
  }

  static getInstance(options?: SyncOptions): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync(options);
    }
    return RealtimeSync.instance;
  }

  async subscribeToChanges(table: TableName, callback: (payload: RealtimePayload<TableName>) => void): Promise<void> {
    try {
      const client = supabase as unknown as LocalRealtimeClient;
      const channel = client
        .channel(`${String(table)}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table: String(table) }, (payload: unknown) => {
          const p = payload as RealtimePayload<TableName>;
          callback(p);
          this.updateLocalCache(table, p);
        });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to changes in ${String(table)}`);
        }
      });

      this.channels.set(table, channel as LocalRealtimeChannel);
    } catch (error) {
      console.error(`Failed to subscribe to ${String(table)} changes:`, error);
      toast.error(`Failed to sync ${String(table)} data`);
    }
  }

  async unsubscribe(table: TableName): Promise<void> {
    const channel = this.channels.get(table);
    if (channel) {
      // unsubscribe may be optional on the lightweight wrapper
      await channel.unsubscribe?.();
      this.channels.delete(table);
    }
  }

  private async updateLocalCache(table: TableName, payload: RealtimePayload<TableName>): Promise<void> {
    try {
      const cache = await caches.open('api-cache');
      const cacheKey = `/api/${String(table)}`;
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        // JSON from cache could be anything; guard with runtime checks
        const cachedRaw = await cachedResponse.text();
        let cachedData: unknown = [];
        try {
          cachedData = JSON.parse(cachedRaw);
        } catch (_error) {
          cachedData = [];
        }
        let updatedData;

        switch (payload.eventType) {
          case 'INSERT':
            updatedData = (Array.isArray(cachedData) ? (cachedData as unknown[]) : []).concat(payload.new as unknown);
            break;
          case 'UPDATE': {
            type RowWithId = { id?: string } & Record<string, unknown>;
            const arr = Array.isArray(cachedData) ? (cachedData as unknown[]) : [];
            updatedData = arr.map((item) => {
              const row = item as RowWithId;
              const newRow = payload.new as unknown as RowWithId;
              return row.id === newRow.id ? (payload.new as unknown) : item;
            });
            break;
          }
          case 'DELETE': {
            type RowWithId = { id?: string } & Record<string, unknown>;
            const arr = Array.isArray(cachedData) ? (cachedData as unknown[]) : [];
            const oldRow = payload.old as unknown as RowWithId;
            updatedData = arr.filter((item) => {
              const row = item as RowWithId;
              return row.id !== oldRow.id;
            });
            break;
          }
          default:
            return;
        }

        await cache.put(
          cacheKey,
          new Response(JSON.stringify(updatedData), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
    } catch (error) {
      console.error('Failed to update local cache:', error);
    }
  }

  async queueOfflineChange<T extends TableName>(table: T, operation: 'INSERT' | 'UPDATE' | 'DELETE', data: TableRow<T>): Promise<void> {
    // Always queue the change locally (so we have an audit), even if online.
    const queueKey = `sync_queue_${String(table)}`;
    const queue = this.syncQueue.get(table) || [];
    const item: SyncQueueItem<T> = { operation, data: data as TableRow<T>, timestamp: Date.now() } as SyncQueueItem<T>;
    queue.push(item as SyncQueueItem<TableName>);
    this.syncQueue.set(table, queue as SyncQueueItem<TableName>[]);

    // Persist queue under a string key
    await this.persistSyncQueue(queueKey, queue as SyncQueueItem<TableName>[]);

    toast.info('Change queued for sync');

    // If we're online, try to process immediately
    if (navigator.onLine) {
      this.processSyncQueue().catch((err) => console.error('Error processing sync queue:', err));
    }
  }

  private async processSyncQueue(): Promise<void> {
    // Iterate over a shallow snapshot to avoid issues if the map is mutated during processing
    for (const [table, queue] of Array.from(this.syncQueue.entries())) {
      for (const item of queue) {
        let retryCount = 0;
        let success = false;

        while (retryCount < (this.options.retryAttempts ?? 3) && !success) {
          try {
            switch (item.operation) {
              case 'INSERT':
                // Type-safe insert using template literals to satisfy TypeScript
                if (table === 'contact_submissions') {
                  await supabase.from('contact_submissions').insert([item.data as unknown as Database['public']['Tables']['contact_submissions']['Insert']]);
                } else if (table === 'content') {
                  await supabase.from('content').insert([item.data as unknown as Database['public']['Tables']['content']['Insert']]);
                } else if (table === 'content_categories') {
                  await supabase.from('content_categories').insert([item.data as unknown as Database['public']['Tables']['content_categories']['Insert']]);
                } else if (table === 'download_requests') {
                  await supabase.from('download_requests').insert([item.data as unknown as Database['public']['Tables']['download_requests']['Insert']]);
                } else if (table === 'download_search_cache') {
                  await supabase.from('download_search_cache').insert([item.data as unknown as Database['public']['Tables']['download_search_cache']['Insert']]);
                } else if (table === 'episodes') {
                  await supabase.from('episodes').insert([item.data as unknown as Database['public']['Tables']['episodes']['Insert']]);
                } else if (table === 'user_favorites') {
                  await supabase.from('user_favorites').insert([item.data as unknown as Database['public']['Tables']['user_favorites']['Insert']]);
                } else if (table === 'user_profiles') {
                  await supabase.from('user_profiles').insert([item.data as unknown as Database['public']['Tables']['user_profiles']['Insert']]);
                } else if (table === 'user_roles') {
                  await supabase.from('user_roles').insert([item.data as unknown as Database['public']['Tables']['user_roles']['Insert']]);
                } else if (table === 'user_usage') {
                  await supabase.from('user_usage').insert([item.data as unknown as Database['public']['Tables']['user_usage']['Insert']]);
                } else if (table === 'user_watch_history') {
                  await supabase.from('user_watch_history').insert([item.data as unknown as Database['public']['Tables']['user_watch_history']['Insert']]);
                } else if (table === 'watch_sessions') {
                  await supabase.from('watch_sessions').insert([item.data as unknown as Database['public']['Tables']['watch_sessions']['Insert']]);
                }
                break;
              case 'UPDATE':
                // Type-safe update
                if (table === 'contact_submissions') {
                  await supabase.from('contact_submissions').update(item.data as unknown as Database['public']['Tables']['contact_submissions']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'content') {
                  await supabase.from('content').update(item.data as unknown as Database['public']['Tables']['content']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'content_categories') {
                  await supabase.from('content_categories').update(item.data as unknown as Database['public']['Tables']['content_categories']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'download_requests') {
                  await supabase.from('download_requests').update(item.data as unknown as Database['public']['Tables']['download_requests']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'download_search_cache') {
                  await supabase.from('download_search_cache').update(item.data as unknown as Database['public']['Tables']['download_search_cache']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'episodes') {
                  await supabase.from('episodes').update(item.data as unknown as Database['public']['Tables']['episodes']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_favorites') {
                  await supabase.from('user_favorites').update(item.data as unknown as Database['public']['Tables']['user_favorites']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_profiles') {
                  await supabase.from('user_profiles').update(item.data as unknown as Database['public']['Tables']['user_profiles']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_roles') {
                  await supabase.from('user_roles').update(item.data as unknown as Database['public']['Tables']['user_roles']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_usage') {
                  await supabase.from('user_usage').update(item.data as unknown as Database['public']['Tables']['user_usage']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_watch_history') {
                  await supabase.from('user_watch_history').update(item.data as unknown as Database['public']['Tables']['user_watch_history']['Update']).eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'watch_sessions') {
                  await supabase.from('watch_sessions').update(item.data as unknown as Database['public']['Tables']['watch_sessions']['Update']).eq('id', String((item.data as { id?: string }).id));
                }
                break;
              case 'DELETE':
                // Type-safe delete
                if (table === 'contact_submissions') {
                  await supabase.from('contact_submissions').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'content') {
                  await supabase.from('content').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'content_categories') {
                  await supabase.from('content_categories').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'download_requests') {
                  await supabase.from('download_requests').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'download_search_cache') {
                  await supabase.from('download_search_cache').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'episodes') {
                  await supabase.from('episodes').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_favorites') {
                  await supabase.from('user_favorites').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_profiles') {
                  await supabase.from('user_profiles').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_roles') {
                  await supabase.from('user_roles').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_usage') {
                  await supabase.from('user_usage').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'user_watch_history') {
                  await supabase.from('user_watch_history').delete().eq('id', String((item.data as { id?: string }).id));
                } else if (table === 'watch_sessions') {
                  await supabase.from('watch_sessions').delete().eq('id', String((item.data as { id?: string }).id));
                }
                break;
            }
            item.success = true;
            success = true;
          } catch (error) {
            retryCount++;
            if (retryCount === this.options.retryAttempts) {
              console.error(`Failed to sync ${String(table)} after ${retryCount} attempts:`, error);
              toast.error(`Failed to sync some changes for ${String(table)}`);
            } else {
              await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay));
            }
          }
        }
      }

      if (queue.every((item) => item.success)) {
        this.syncQueue.delete(table);
        await this.clearPersistedQueue(String(table));
        toast.success(`Successfully synced all changes for ${String(table)}`);
      } else {
        // Persist updated queue state
        await this.persistSyncQueue(`sync_queue_${String(table)}`, queue as SyncQueueItem<TableName>[]);
      }
    }
  }

  private async persistSyncQueue(key: string, queue: SyncQueueItem<TableName>[]): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  private async clearPersistedQueue(table: string): Promise<void> {
    try {
      localStorage.removeItem(`sync_queue_${table}`);
    } catch (error) {
      console.error('Failed to clear persisted queue:', error);
    }
  }

  async restoreSyncQueue(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('sync_queue_')) {
          const raw = localStorage.getItem(key) || '[]';
          const queue = JSON.parse(raw) as SyncQueueItem<TableName>[];
          if (queue.length > 0) {
            const tableName = key.replace('sync_queue_', '') as TableName;
            this.syncQueue.set(tableName, queue as SyncQueueItem<TableName>[]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore sync queue:', error);
    }
  }
}

export const realtimeSync = RealtimeSync.getInstance();
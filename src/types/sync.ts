import { Database } from '@/integrations/supabase/types';

export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export interface SyncQueueItem<T extends TableName> {
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: TableRow<T>;
  timestamp: number;
  success?: boolean;
}

export interface RealtimePayload<T extends TableName> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: TableRow<T>;
  old: TableRow<T>;
}
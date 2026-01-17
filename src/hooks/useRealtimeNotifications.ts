/**
 * Real-time Notifications Hook using Supabase Realtime
 * 
 * Provides push notifications when new content is added to the database.
 * Uses Supabase Realtime channels for instant updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface RealtimeNotification {
  id: string;
  type: 'new_content' | 'promo' | 'system';
  title: string;
  message: string;
  contentId?: string;
  image?: string;
  createdAt: string;
  isRead: boolean;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [readIds, setReadIds] = useLocalStorage<string[]>('read-notification-ids', []);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to content table changes
  useEffect(() => {
    if (!user) return;

    // Create realtime channel for content updates
    const channel = supabase
      .channel('content-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content'
        },
        (payload) => {
          const newContent = payload.new as {
            id: string;
            title: string;
            content_type: string;
            image_url?: string;
            created_at: string;
          };

          const notification: RealtimeNotification = {
            id: `content-${newContent.id}-${Date.now()}`,
            type: 'new_content',
            title: 'New Content Added',
            message: `${newContent.title} is now available!`,
            contentId: newContent.id,
            image: newContent.image_url,
            createdAt: new Date().toISOString(),
            isRead: false
          };

          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast.info(`New: ${newContent.title}`, {
            description: `A new ${newContent.content_type} has been added`,
            action: {
              label: 'View',
              onClick: () => window.location.href = `/content/${newContent.id}`
            }
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  // Update unread count when read IDs change
  useEffect(() => {
    const count = notifications.filter(n => !readIds.includes(n.id) && !n.isRead).length;
    setUnreadCount(count);
  }, [notifications, readIds]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setReadIds(prev => [...new Set([...prev, notificationId])]);
  }, [setReadIds]);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setReadIds(prev => [...new Set([...prev, ...allIds])]);
    setUnreadCount(0);
  }, [notifications, setReadIds]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const addSystemNotification = useCallback((title: string, message: string) => {
    const notification: RealtimeNotification = {
      id: `system-${Date.now()}`,
      type: 'system',
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addSystemNotification
  };
};

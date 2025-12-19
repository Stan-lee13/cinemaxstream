
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  contentId?: string;
  image?: string;
  isRead: boolean;
  type: 'content' | 'system' | 'billing';
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useLocalStorage<string[]>('seen-notifications', []);

  const fetchContentNotifications = useCallback(async () => {
    // Check if content notifications are enabled in settings
    const isEnabled = localStorage.getItem('notif_content') !== 'false';
    if (!isEnabled) {
      setNotifications([]);
      return;
    }

    try {
      // Fetch newest content (last 10 items)
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const contentNotifs: Notification[] = (data || []).map(item => ({
        id: `content-${item.id}`,
        title: item.title,
        message: `New ${item.content_type} available: ${item.title}`,
        date: item.created_at,
        contentId: item.id,
        image: item.image_url || undefined,
        isRead: seenIds.includes(`content-${item.id}`),
        type: 'content'
      }));

      // System notification (always available)
      const systemNotifs: Notification[] = [
        {
          id: 'sys-welcome',
          title: 'Welcome to CineMax',
          message: 'Your terminal is now synchronized with our global content network.',
          date: new Date().toISOString(),
          isRead: seenIds.includes('sys-welcome'),
          type: 'system'
        }
      ];

      const allNotifs = [...contentNotifs, ...systemNotifs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setNotifications(allNotifs);

      // Trigger browser notifications for new unseen items (only if push is enabled)
      const pushEnabled = localStorage.getItem('notif_push') !== 'false';
      if (pushEnabled && permissionGranted && 'Notification' in window && Notification.permission === 'granted') {
        const unseenNew = contentNotifs.filter(n => !n.isRead && !seenIds.includes(n.id));
        unseenNew.forEach(n => {
          new window.Notification('CineMax New Content', {
            body: n.title,
            icon: n.image || '/favicon.ico'
          });
        });
      }
    } catch (err) {
      console.error('Notification bridge failure:', err);
    }
  }, [seenIds, permissionGranted]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
    fetchContentNotifications();

    // Polling interval (10 minutes)
    const interval = setInterval(fetchContentNotifications, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchContentNotifications]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setNotificationCount(unread);
    document.title = unread > 0 ? `(${unread}) CineMax` : 'CineMax';
  }, [notifications]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPermissionGranted(true);
      toast.success('Neural link established');
      fetchContentNotifications();
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (!seenIds.includes(id)) {
      setSeenIds(prev => [...prev, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setSeenIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  return {
    notifications,
    setShowNotifications,
    showNotifications,
    notificationCount,
    permissionGranted,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
    fetchLatestReleases: fetchContentNotifications
  };
}

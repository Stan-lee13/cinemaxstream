import { useState, useEffect } from 'react';
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
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useLocalStorage<string[]>('seen-notifications', []);

  // Fetch latest releases from Supabase content table
  const fetchLatestReleases = async () => {
    try {
      // Get content added in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentContent, error } = await supabase
        .from('content')
        .select('id, title, description, poster_path, content_type, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (!recentContent || recentContent.length === 0) {
        // If no recent content, show a welcome notification
        const welcomeNotification: Notification = {
          id: 'welcome-1',
          title: 'Welcome to CinemaXStream!',
          message: 'Start exploring thousands of movies and TV shows',
          date: new Date().toISOString(),
          isRead: seenIds.includes('welcome-1')
        };
        setNotifications([welcomeNotification]);
        return;
      }

      // Convert content to notifications
      const currentReleases: Notification[] = recentContent.map(content => ({
        id: `content-${content.id}`,
        title: content.title,
        message: `New ${content.content_type === 'movie' ? 'movie' : 'series'} now available to stream`,
        date: content.created_at,
        contentId: content.id,
        image: content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : undefined,
        isRead: seenIds.includes(`content-${content.id}`)
      }));

      // Send browser notifications for unseen content
      if (permissionGranted) {
        currentReleases.forEach(release => {
          if (!release.isRead && !seenIds.includes(release.id)) {
            new Notification('New Content Available', {
              body: release.title,
              icon: release.image
            });
          }
        });
      }

      setNotifications(currentReleases);
    } catch (error) {
      console.error('Error in fetchLatestReleases:', error);
    }
  };

  // On mount, request permission status and set up interval
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
    fetchLatestReleases();

    // 30 minute interval
    const interval = setInterval(() => {
      fetchLatestReleases();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unread counter, title update
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    setNotificationCount(unreadCount);
    document.title = unreadCount > 0
      ? `(${unreadCount}) New Movies Available`
      : 'Cinemax Streaming';
  }, [notifications]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        toast.success('Notification permission granted!');
        fetchLatestReleases();
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setSeenIds(prev => [...prev, id]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setSeenIds(prev => [...prev, ...notifications.map(n => n.id)]);
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
    setNotifications, // For custom update (not typical)
    fetchLatestReleases
  };
}

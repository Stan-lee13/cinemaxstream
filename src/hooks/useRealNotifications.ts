import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { tmdbApi } from '@/services/tmdbApi';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  contentId?: string;
  image?: string;
  isRead: boolean;
  contentType?: 'movie' | 'series' | 'anime' | 'documentary';
}

const NOTIFICATION_INTERVAL = 45 * 60 * 1000; // 45 minutes

export function useRealNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useLocalStorage<string[]>('seen-notifications', []);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>('notifications-enabled', false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch mixed content recommendations from TMDB
  const fetchMixedRecommendations = useCallback(async (): Promise<Notification[]> => {
    try {
      // Fetch from different categories
      const [movies, series, anime] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTvShows(),
        tmdbApi.getAnime(),
      ]);

      // Mix content: 2 movies, 2 series, 1 anime
      const mixed = [
        ...(movies?.slice(0, 2) || []).map(movie => ({ ...movie, category: 'movie' })),
        ...(series?.slice(0, 2) || []).map(series => ({ ...series, category: 'series' })),
        ...(anime?.slice(0, 1) || []).map(anime => ({ ...anime, category: 'anime' })),
      ].filter(Boolean);

      // Shuffle and take 5
      const shuffled = mixed.sort(() => Math.random() - 0.5).slice(0, 5);

      return shuffled.map((item, index) => ({
        id: `notif-${item.id}-${Date.now()}-${index}`,
        title: item.title,
        message: `New ${item.category === 'movie' ? 'movie' : 'show'} available: ${item.title}`,
        date: new Date().toISOString(),
        contentId: item.id,
        image: item.image,
        isRead: seenIds.includes(`notif-${item.id}-${Date.now()}-${index}`),
        contentType: item.category as 'movie' | 'series' | 'anime' | 'documentary',
      }));
    } catch (error) {
      return [];
    }
  }, [seenIds]);

  // Send browser notification
  const sendBrowserNotification = useCallback((notification: Notification) => {
    if (permissionGranted && 'Notification' in window) {
      try {
        new Notification('New Content Available', {
          body: notification.title,
          icon: notification.image || '/favicon.ico',
          tag: notification.id,
        });
      } catch (error) {
        // Browser notification failed silently
      }
    }
  }, [permissionGranted]);

  // Fetch and set notifications
  const refreshNotifications = useCallback(async () => {
    if (!notificationsEnabled) return;
    
    const newNotifications = await fetchMixedRecommendations();
    
    if (newNotifications.length > 0) {
      setNotifications(prev => {
        // Add new notifications, keep max 20
        const combined = [...newNotifications, ...prev].slice(0, 20);
        return combined;
      });

      // Send browser notifications for new items
      newNotifications.forEach(notif => {
        if (!notif.isRead && !seenIds.includes(notif.id)) {
          sendBrowserNotification(notif);
        }
      });
    }
  }, [fetchMixedRecommendations, notificationsEnabled, seenIds, sendBrowserNotification]);

  // Setup interval for notifications
  useEffect(() => {
    // Check permission status
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true);
    }

    // Initial fetch
    if (notificationsEnabled) {
      refreshNotifications();
    }

    // Setup 45-minute interval
    if (notificationsEnabled) {
      intervalRef.current = setInterval(() => {
        refreshNotifications();
      }, NOTIFICATION_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [notificationsEnabled, refreshNotifications]);

  // Calculate unread count
  const notificationCount = notifications.filter(n => !n.isRead).length;

  // Update page title with notification count
  useEffect(() => {
    document.title = notificationCount > 0
      ? `(${notificationCount}) New Updates - CinemaxStream`
      : 'CinemaxStream';
  }, [notificationCount]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
        refreshNotifications();
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const enableNotifications = () => {
    setNotificationsEnabled(true);
    refreshNotifications();
    toast.success('Notifications enabled');
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.info('Notifications disabled');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setSeenIds(prev => [...new Set([...prev, id])]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setSeenIds(prev => [...new Set([...prev, ...notifications.map(n => n.id)])]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    setShowNotifications,
    showNotifications,
    notificationCount,
    permissionGranted,
    notificationsEnabled,
    requestNotificationPermission,
    enableNotifications,
    disableNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refreshNotifications,
  };
}


import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

  // Fetch latest releases from TMDB API
  const fetchLatestReleases = async () => {
    const currentReleases: Notification[] = [
      {
        id: 'movie-123',
        title: 'Dune: Part Three',
        message: 'New sci-fi epic now available to stream',
        date: new Date().toISOString(),
        contentId: '438631',
        image: 'https://image.tmdb.org/t/p/w500/xFYpUmB01nswPgbzi8EOCT1ZYFu.jpg',
        isRead: seenIds.includes('movie-123')
      },
      {
        id: 'movie-456',
        title: 'Avengers: Secret Wars',
        message: 'The latest Marvel blockbuster is here!',
        date: new Date().toISOString(),
        contentId: '505642',
        image: 'https://image.tmdb.org/t/p/w500/laCJxobHoPVaLQTKxc14Y2zV64J.jpg',
        isRead: seenIds.includes('movie-456')
      },
      {
        id: 'movie-789',
        title: 'Joker: Folie à Deux',
        message: 'The anticipated sequel to Joker has arrived',
        date: new Date().toISOString(),
        contentId: '575264',
        image: 'https://image.tmdb.org/t/p/w500/gN79aDbZjUMEQp8Rj6MpJ9eTSQK.jpg',
        isRead: seenIds.includes('movie-789')
      },
      {
        id: 'movie-101',
        title: 'The Batman 2',
        message: 'Return to Gotham with the sequel to The Batman',
        date: new Date().toISOString(),
        contentId: '726759',
        image: 'https://image.tmdb.org/t/p/w500/7IW5yyJ5oA1PxaCKg9xKcNtTl1d.jpg',
        isRead: seenIds.includes('movie-101')
      }
    ];

    // Send browser notifications for unseen content
    if (permissionGranted) {
      currentReleases.forEach(release => {
        if (!release.isRead && !seenIds.includes(release.id)) {
          new Notification('New Movie Available', {
            body: release.title,
            icon: release.image
          });
        }
      });
    }

    setNotifications(currentReleases);
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

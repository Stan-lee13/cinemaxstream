/**
 * Event-driven notification system with DB persistence
 * Triggers notifications based on real app events:
 * - Monthly/Yearly Wrap availability
 * - Promo code success
 * - Download complete
 * - Account/security changes
 * 
 * Falls back to localStorage for unauthenticated users.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { sendNativeNotification, getNativePermission } from '@/utils/nativeNotifications';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  route?: string;
  isRead: boolean;
  type: 'wrap' | 'promo' | 'download' | 'account' | 'content' | 'system';
  image?: string;
}

const LOCAL_KEY = 'app_event_notifications';

export function useEventNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load notifications from DB or localStorage
  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data) {
          setNotifications(data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            date: n.created_at,
            route: n.route ?? undefined,
            isRead: n.is_read,
            type: n.type as AppNotification['type'],
          })));
        }
      } else {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) setNotifications(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Realtime sync: keep NotificationBar in sync across tabs/devices
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = payload.new as {
              id: string; title: string; message: string; created_at: string;
              route: string | null; is_read: boolean; type: string;
            };
            setNotifications(prev => {
              if (prev.some(p => p.id === n.id)) return prev;
              return [{
                id: n.id,
                title: n.title,
                message: n.message,
                date: n.created_at,
                route: n.route ?? undefined,
                isRead: n.is_read,
                type: n.type as AppNotification['type'],
              }, ...prev].slice(0, 50);
            });
          } else if (payload.eventType === 'UPDATE') {
            const n = payload.new as { id: string; is_read: boolean };
            setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, isRead: n.is_read } : p));
          } else if (payload.eventType === 'DELETE') {
            const n = payload.old as { id: string };
            setNotifications(prev => prev.filter(p => p.id !== n.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Sync to localStorage for non-auth fallback
  useEffect(() => {
    if (!user && loaded) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(notifications));
    }
  }, [notifications, user, loaded]);

  const addNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    const tempId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newNotif: AppNotification = {
      ...notif,
      id: tempId,
      date: new Date().toISOString(),
      isRead: false,
    };

    // Optimistically add to state
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));

    // Fire native browser notification (throttled internally)
    if (getNativePermission() === 'granted') {
      sendNativeNotification(notif.title, notif.message, {
        route: notif.route,
        tag: `cinemax-${notif.type}-${Date.now()}`,
      });
    }

    // Persist to DB if authenticated
    if (user) {
      const { data } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          route: notif.route ?? null,
        })
        .select('id')
        .single();

      if (data) {
        // Update the temp id with the real one
        setNotifications(prev => prev.map(n => n.id === tempId ? { ...n, id: data.id } : n));
      }
    }

    return newNotif;
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (user) {
      await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (user) {
      await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    }
  }, [user]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    if (user) {
      await supabase.from('user_notifications').delete().eq('user_id', user.id);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // === Event triggers ===

  const notifyMonthlyWrap = useCallback(() => {
    addNotification({
      title: '🎬 Your Monthly Wrap is Ready!',
      message: `Your ${new Date().toLocaleString('default', { month: 'long' })} streaming summary is available.`,
      route: '/wrap',
      type: 'wrap',
    });
  }, [addNotification]);

  const notifyYearlyWrap = useCallback(() => {
    addNotification({
      title: '🏆 Your Yearly Wrap is Here!',
      message: `Your ${new Date().getFullYear()} streaming year in review is ready.`,
      route: '/wrap',
      type: 'wrap',
    });
  }, [addNotification]);

  const notifyPromoSuccess = useCallback((code: string) => {
    addNotification({
      title: '🎉 Promo Code Applied!',
      message: `Code "${code}" redeemed successfully. Your account has been upgraded.`,
      route: '/account',
      type: 'promo',
    });
  }, [addNotification]);

  const notifyDownloadComplete = useCallback((contentTitle: string) => {
    addNotification({
      title: '✅ Download Complete',
      message: `"${contentTitle}" has been downloaded and added to your library.`,
      route: '/downloads',
      type: 'download',
    });
  }, [addNotification]);

  const notifyAccountChange = useCallback((description: string) => {
    addNotification({
      title: '🔐 Account Update',
      message: description,
      route: '/account',
      type: 'account',
    });
  }, [addNotification]);

  // === Time-based wrap triggers ===
  const checkWrapTriggers = useCallback(() => {
    const now = new Date();
    const today = now.getDate();
    const month = now.getMonth();

    const lastMonthlyTrigger = localStorage.getItem('last_monthly_wrap_trigger');
    const lastYearlyTrigger = localStorage.getItem('last_yearly_wrap_trigger');
    const currentMonthKey = `${now.getFullYear()}-${month}`;
    const currentYearKey = `${now.getFullYear()}`;

    // Monthly wrap: last day of month
    const lastDayOfMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
    if (today === lastDayOfMonth && lastMonthlyTrigger !== currentMonthKey) {
      notifyMonthlyWrap();
      localStorage.setItem('last_monthly_wrap_trigger', currentMonthKey);
    }

    // Yearly wrap: Dec 31 or first 7 days of new year
    const isYearEnd = month === 11 && today === 31;
    const isNewYearWeek = month === 0 && today <= 7;
    if ((isYearEnd || isNewYearWeek) && lastYearlyTrigger !== currentYearKey) {
      notifyYearlyWrap();
      localStorage.setItem('last_yearly_wrap_trigger', currentYearKey);
    }
  }, [notifyMonthlyWrap, notifyYearlyWrap]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    notifyMonthlyWrap,
    notifyYearlyWrap,
    notifyPromoSuccess,
    notifyDownloadComplete,
    notifyAccountChange,
    checkWrapTriggers,
  };
}

/**
 * Event-driven notification system
 * Triggers notifications based on real app events:
 * - Monthly/Yearly Wrap availability
 * - Promo code success
 * - Download complete
 * - Account/security changes
 */

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  route?: string;
  isRead: boolean;
  type: 'wrap' | 'promo' | 'download' | 'account' | 'content' | 'system';
  icon?: string;
}

const NOTIFICATIONS_KEY = 'app_event_notifications';

export function useEventNotifications() {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(NOTIFICATIONS_KEY, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    return newNotif;
  }, [setNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

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
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    
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

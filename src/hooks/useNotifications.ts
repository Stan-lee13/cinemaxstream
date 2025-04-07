
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export type NotificationPreference = 'all' | 'favorites' | 'none';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notificationPreference, setNotificationPreference] = useLocalStorage<NotificationPreference>('notification_preference', 'all');
  
  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      return;
    }
    
    // Set initial permission state
    setPermission(Notification.permission);
  }, []);
  
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission was denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };
  
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || permission !== 'granted') {
      return false;
    }
    
    try {
      const notification = new Notification(title, options);
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };
  
  return {
    permission,
    requestPermission,
    sendNotification,
    notificationPreference,
    setNotificationPreference,
    isSupported: 'Notification' in window
  };
};

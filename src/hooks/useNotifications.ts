
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

export type NotificationPreference = 'all' | 'favorites' | 'none';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notificationPreference, setNotificationPreference] = useLocalStorage<NotificationPreference>('notification_preference', 'all');
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    // Check if the browser supports notifications
    if ('Notification' in window) {
      setIsSupported(true);
      
      // Set initial permission state
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);
  
  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Notification permission was denied');
        return false;
      } else {
        toast.error('Notification permission was dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };
  
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
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
    isSupported
  };
};

export default useNotifications;

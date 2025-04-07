
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/notification-worker.js');
      console.log('Service worker registration succeeded:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const result = await registration.unregister();
      console.log('Service worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
      return false;
    }
  }
  return false;
};

export const showContentNotification = async (content: {
  title: string;
  type: string;
  image?: string;
  id: string;
}) => {
  if (Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    // When using the Notification API directly, we need to handle images differently
    // as the 'image' property is not supported in all browsers
    const notificationOptions: NotificationOptions = {
      body: content.title,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: `/content/${content.id}`,
        imageUrl: content.image // Store the image URL in the data object instead
      }
    };
    
    // For browsers that do support image, we can add it conditionally
    if (content.image) {
      // @ts-ignore - TypeScript doesn't recognize this property on all browsers
      notificationOptions.image = content.image;
    }
    
    const notification = new Notification(`New ${content.type} available!`, notificationOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      window.location.href = `/content/${content.id}`;
    };
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

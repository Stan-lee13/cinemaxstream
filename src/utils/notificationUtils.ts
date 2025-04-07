
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
    const notification = new Notification(`New ${content.type} available!`, {
      body: content.title,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: `/content/${content.id}`,
        imageUrl: content.image // Store the image URL in the data object instead
      }
    });
    
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

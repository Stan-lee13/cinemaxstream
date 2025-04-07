
// This is a service worker for handling notifications in the background

self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New content is available!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    data: {
      url: data.url || '/',
      imageUrl: data.image // Store image URL in data instead
    },
    actions: data.actions || [
      { action: 'view', title: 'View Now' },
      { action: 'dismiss', title: 'Later' }
    ],
    image: data.image // Keep this for browsers that support image in notifications
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CinemaxStream Update', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // This looks to see if the current is already open and focuses it
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      const url = event.notification.data.url || '/';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

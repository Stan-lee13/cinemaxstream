
import { useState, useEffect } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  contentId?: string;
  image?: string;
  isRead: boolean;
}

const NotificationBar = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const navigate = useNavigate();
  const [seenIds, setSeenIds] = useLocalStorage<string[]>('seen-notifications', []);
  
  useEffect(() => {
    // Check if notifications are supported and permission is granted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      }
    }
    
    // Fetch notifications
    fetchLatestReleases();
    
    // Set up periodic checks for new notifications (every 15 minutes)
    const intervalId = setInterval(() => {
      fetchLatestReleases();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update unread count when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    setNotificationCount(unreadCount);
    
    // Update document title if there are unread notifications
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) New Movies Available`;
    } else {
      document.title = 'Cinemax Streaming';
    }
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
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    }
  };
  
  const fetchLatestReleases = async () => {
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate some new releases
      const mockReleases = [
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
      
      setNotifications(mockReleases);
      
      // Send browser notification if permission is granted and there are new releases
      if (permissionGranted) {
        mockReleases.forEach(release => {
          if (!release.isRead) {
            new Notification('New Movie Available', {
              body: release.title,
              icon: release.image
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    setSeenIds(prev => [...prev, id]);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate to content if contentId exists
    if (notification.contentId) {
      navigate(`/content/${notification.contentId}`);
    }
    
    // Close notification panel
    setShowNotifications(false);
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setSeenIds(prev => [...prev, ...notifications.map(n => n.id)]);
  };
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-cinemax-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {!permissionGranted && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={requestNotificationPermission}
                  className="text-xs"
                >
                  Enable
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${!notification.isRead ? 'bg-gray-800/30' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {notification.image && (
                        <img 
                          src={notification.image} 
                          alt={notification.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                          {!notification.isRead && (
                            <span className="bg-cinemax-500 w-2 h-2 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notificationCount > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;

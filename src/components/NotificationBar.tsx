
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NotificationCard from './NotificationCard';
import { useNotifications, Notification } from '@/hooks/useNotifications';

const NotificationBar = () => {
  const {
    notifications,
    setShowNotifications,
    showNotifications,
    notificationCount,
    permissionGranted,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.contentId) {
      navigate(`/content/${notification.contentId}`);
    }
    setShowNotifications(false);
  };

  return (
    <div className="relative" data-tour-id="notifications-button">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-cinemax-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-50 max-h-[80vh] overflow-hidden">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex gap-1">
              {!permissionGranted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="text-xs px-2 py-1 h-auto"
                >
                  Enable
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
                className="p-1 h-auto"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map(notification => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
                {notificationCount > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs py-2"
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

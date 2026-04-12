import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Check, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEventNotifications, AppNotification } from '@/hooks/useEventNotifications';
import { getNativePermission, requestNativePermission, sendNativeNotification } from '@/utils/nativeNotifications';

const NotificationBar = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    checkWrapTriggers,
    addNotification,
  } = useEventNotifications();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nativePerm, setNativePerm] = useState<NotificationPermission>(getNativePermission());

  const handleEnableNative = async () => {
    const granted = await requestNativePermission();
    setNativePerm(granted ? 'granted' : 'denied');
  };

  // Check for time-based wrap triggers on mount and periodically
  useEffect(() => {
    checkWrapTriggers();
    const interval = setInterval(checkWrapTriggers, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkWrapTriggers]);

  // Update page title with unread count
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) CineMaxStream` : 'CineMaxStream';
  }, [unreadCount]);

  const handleClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.route) {
      navigate(notif.route);
    }
    setOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" data-tour-id="notifications-button">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
                >
                  <Check size={12} className="mr-1" />
                  Read all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="p-1 h-auto text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Native notification permission banner */}
          {nativePerm !== 'granted' && nativePerm !== 'denied' && (
            <div className="p-3 border-b border-border bg-accent/30">
              <div className="flex items-center gap-2">
                <BellRing size={16} className="text-primary shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  Get notified about new releases even when the app is closed
                </p>
                <Button size="sm" variant="secondary" className="text-xs h-7 px-3" onClick={handleEnableNative}>
                  Enable
                </Button>
              </div>
            </div>
          )}

          {/* Test notification trigger */}
          {nativePerm === 'granted' && (
            <div className="p-2 border-b border-border/50 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
                onClick={async () => {
                  addNotification({
                    title: '🔔 Test Notification',
                    message: 'Notifications are working! You will receive alerts for new releases.',
                    type: 'system',
                  });
                  await sendNativeNotification(
                    '🔔 CineMaxStream',
                    'Notifications are working! You will receive alerts for new releases.',
                    { tag: 'test-notif' }
                  );
                }}
              >
                <TestTube2 size={10} /> Test
              </Button>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`p-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 ${
                    !notif.isRead ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                    <div className={`flex-1 ${notif.isRead ? 'ml-5' : ''}`}>
                      <p className={`text-sm font-medium ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(notif.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;


import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const NotificationPermissionPrompt = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { permission, requestPermission, notificationPreference, setNotificationPreference, isSupported } = useNotifications();
  const [hasPrompted, setHasPrompted] = useState(false);
  
  useEffect(() => {
    // Check if we've already prompted this user before
    const hasBeenPrompted = localStorage.getItem('notification_prompted');
    setHasPrompted(!!hasBeenPrompted);
    
    // Show notification prompt for new users after 30 seconds
    if (!hasBeenPrompted && isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShowDialog(true);
        localStorage.setItem('notification_prompted', 'true');
      }, 30000); // 30 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, [permission, isSupported]);
  
  if (!isSupported) {
    return null;
  }
  
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result) {
      setShowDialog(false);
      // Show an example notification
      try {
        const notification = new Notification('Notifications Enabled!', {
          body: 'You will now receive updates on new content',
          icon: '/favicon.ico'
        });
        
        // Close the notification after 3 seconds
        setTimeout(() => notification.close(), 3000);
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    }
  };
  
  const handleOpenSettings = () => {
    if (permission === 'granted') {
      // If already granted, show notification preferences
      setShowDialog(true);
    } else {
      // If not granted, show permission request dialog
      setShowDialog(true);
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2" 
        onClick={handleOpenSettings}
        aria-label="Notification settings"
      >
        {permission === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
        <span className="hidden md:inline">Notifications</span>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{permission === 'granted' ? 'Notification Settings' : 'Enable Notifications'}</DialogTitle>
            <DialogDescription>
              {permission === 'granted' 
                ? 'Manage your notification preferences'
                : 'Get notified about new movies, series, and content updates.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {permission === 'granted' ? (
              <div className="space-y-2">
                <Label htmlFor="notification-type">Notification Preference</Label>
                <Select 
                  value={notificationPreference} 
                  onValueChange={(value) => setNotificationPreference(value as any)}
                >
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="Select notifications to receive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All New Content</SelectItem>
                    <SelectItem value="favorites">Only Favorites & Recommended</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Stay Updated</p>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when new movies or shows are available.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            {permission !== 'granted' && (
              <Button onClick={handleRequestPermission}>
                Enable Notifications
              </Button>
            )}
            {permission === 'granted' && (
              <Button onClick={() => setShowDialog(false)}>
                Save Settings
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationPermissionPrompt;


import React, { useState } from 'react';
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
  
  if (!isSupported) {
    return null;
  }
  
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result) {
      setShowDialog(false);
      // Show an example notification
      const notification = new Notification('Notifications Enabled!', {
        body: 'You will now receive updates on new content',
        icon: '/favicon.ico'
      });
    }
  };
  
  const handleOpenSettings = () => {
    if (permission === 'granted') {
      toast.info('Notification settings updated');
    } else {
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
      >
        {permission === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
        <span className="hidden md:inline">Notifications</span>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enable Notifications</DialogTitle>
            <DialogDescription>
              Get notified about new movies, series, and content updates.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestPermission}>
              Enable Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationPermissionPrompt;

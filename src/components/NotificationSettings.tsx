
import React from 'react';
import { useNotifications, NotificationPreference } from '@/hooks/useNotifications';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';

const NotificationSettings = () => {
  const {
    permission,
    requestPermission,
    notificationPreference,
    setNotificationPreference,
    isSupported,
  } = useNotifications();
  
  const handleRequestPermission = async () => {
    if (permission === 'granted') {
      toast.info('Notifications are already enabled');
      return;
    }
    
    const result = await requestPermission();
    if (result) {
      // Show an example notification
      const notification = new Notification('Notifications Enabled!', {
        body: 'You will now receive updates on new content',
        icon: '/favicon.ico',
      });
    }
  };
  
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <BellOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Not Available</p>
                <p className="text-sm text-muted-foreground">
                  Notifications are not supported in your browser.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage notification settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            {permission === 'granted' ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted'
                  ? 'Notifications are enabled'
                  : 'Enable notifications to get updates about new content'}
              </p>
            </div>
          </div>
          <Switch
            checked={permission === 'granted'}
            onCheckedChange={handleRequestPermission}
            disabled={permission === 'granted'}
          />
        </div>
        
        {permission === 'granted' && (
          <div className="space-y-4">
            <Label htmlFor="notification-preference">Notification Preference</Label>
            <Select
              value={notificationPreference}
              onValueChange={(value) => setNotificationPreference(value as NotificationPreference)}
            >
              <SelectTrigger id="notification-preference">
                <SelectValue placeholder="Select notifications to receive" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All New Content</SelectItem>
                <SelectItem value="favorites">Only Favorites & Recommended</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;

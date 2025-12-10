import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newContentAlert, setNewContentAlert] = useState(true);
  const [downloadComplete, setDownloadComplete] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_settings) {
        const settings = data.notification_settings as any;
        setEmailNotifications(settings.email ?? true);
        setPushNotifications(settings.push ?? true);
        setNewContentAlert(settings.newContent ?? true);
        setDownloadComplete(settings.downloadComplete ?? true);
        setPromotionalEmails(settings.promotional ?? false);
        setWeeklyDigest(settings.weeklyDigest ?? true);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save settings');
      return;
    }

    try {
      setLoading(true);

      const settings = {
        email: emailNotifications,
        push: pushNotifications,
        newContent: newContentAlert,
        downloadComplete: downloadComplete,
        promotional: promotionalEmails,
        weeklyDigest: weeklyDigest
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({ notification_settings: settings })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const notificationSections = [
    {
      title: 'General Notifications',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          label: 'Email Notifications',
          description: 'Receive important updates via email',
          value: emailNotifications,
          onChange: setEmailNotifications
        },
        {
          label: 'Push Notifications',
          description: 'Get browser notifications for important events',
          value: pushNotifications,
          onChange: setPushNotifications
        }
      ]
    },
    {
      title: 'Content Notifications',
      icon: <Volume2 className="w-5 h-5" />,
      settings: [
        {
          label: 'New Content Alerts',
          description: 'Notify me when new movies or shows are added',
          value: newContentAlert,
          onChange: setNewContentAlert
        },
        {
          label: 'Download Complete',
          description: 'Notify when downloads finish',
          value: downloadComplete,
          onChange: setDownloadComplete
        }
      ]
    },
    {
      title: 'Marketing & Updates',
      icon: <Mail className="w-5 h-5" />,
      settings: [
        {
          label: 'Promotional Emails',
          description: 'Receive emails about special offers and promotions',
          value: promotionalEmails,
          onChange: setPromotionalEmails
        },
        {
          label: 'Weekly Digest',
          description: 'Get a weekly summary of new content',
          value: weeklyDigest,
          onChange: setWeeklyDigest
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground mb-8">Control how and when you receive notifications</p>

          <div className="space-y-6">
            {notificationSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-base font-medium">{setting.label}</Label>
                        <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.value}
                        onCheckedChange={setting.onChange}
                        className="ml-4"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Browser Notification Permission */}
          <Card className="p-6 bg-card border-border mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Browser Permissions</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow this site to send you notifications
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                          toast.success('Notifications enabled');
                        } else {
                          toast.error('Notifications denied');
                        }
                      });
                    }
                  }}
                >
                  {Notification?.permission === 'granted' ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end mt-8">
            <Button onClick={handleSave} className="px-8" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
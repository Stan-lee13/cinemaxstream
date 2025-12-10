import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/authHooks';
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { 
  Monitor, 
  Volume2, 
  Bell, 
  Shield, 
  Download, 
  Wifi,
  Moon,
  Sun,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState('1080p');
  const [language, setLanguage] = useState('en');

  const handleSaveSetting = (setting: string) => {
    toast.success(`${setting} updated successfully`);
  };

  const settingsSections = [
    {
      title: "Display & Playback",
      icon: <Monitor className="w-5 h-5" />,
      settings: [
        {
          label: "Auto-play next episode",
          description: "Automatically play the next episode in a series",
          type: "switch",
          value: autoPlay,
          onChange: setAutoPlay
        },
        {
          label: "High quality streaming",
          description: "Use higher quality video when available (uses more data)",
          type: "switch",
          value: highQuality,
          onChange: setHighQuality
        }
      ]
    },
    {
      title: "Downloads",
      icon: <Download className="w-5 h-5" />,
      settings: [
        {
          label: "Download quality",
          description: "Quality for downloaded content",
          type: "select",
          value: downloadQuality,
          onChange: setDownloadQuality,
          options: [
            { value: '720p', label: '720p (Recommended)' },
            { value: '1080p', label: '1080p (High Quality)' },
            { value: '480p', label: '480p (Lower Size)' }
          ]
        }
      ]
    },
    {
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          label: "Push notifications",
          description: "Receive notifications about new content and updates",
          type: "switch",
          value: notifications,
          onChange: setNotifications
        }
      ]
    },
    {
      title: "Language & Region",
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          label: "Language",
          description: "Choose your preferred language",
          type: "select",
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ]
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground mb-8">Please sign in to access settings</p>
            <a 
              href="/auth" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Customize your streaming experience</p>
          
          <div className="space-y-8">
            {settingsSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-6">
                  {section.icon}
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-base font-medium">{setting.label}</Label>
                        <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                      
                      <div className="ml-4">
                        {setting.type === 'switch' ? (
                          <Switch
                            checked={setting.value as boolean}
                            onCheckedChange={(checked) => {
                              setting.onChange(checked);
                              handleSaveSetting(setting.label);
                            }}
                          />
                        ) : setting.type === 'select' ? (
                          <Select
                            value={setting.value as string}
                            onValueChange={(value) => {
                              setting.onChange(value);
                              handleSaveSetting(setting.label);
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={setting.value as string}
                            onChange={(e) => {
                              setting.onChange(e.target.value);
                              handleSaveSetting(setting.label);
                            }}
                            className="w-48"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
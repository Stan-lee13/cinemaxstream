import React, { useState, useEffect } from 'react'; // Add useEffect
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { 
  Settings, 
  Volume2, 
  Download, 
  Wifi, 
  Monitor,
  Smartphone,
  HardDrive,
  Globe
} from 'lucide-react';
import { useTheme } from '@/hooks/themeContext';

const AppSettings = () => {
  // Load settings from localStorage or use defaults
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem('settings_autoPlay');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [preloadContent, setPreloadContent] = useState(() => {
    const saved = localStorage.getItem('settings_preloadContent');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [dataSaver, setDataSaver] = useState(() => {
    const saved = localStorage.getItem('settings_dataSaver');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [offlineMode, setOfflineMode] = useState(() => {
    const saved = localStorage.getItem('settings_offlineMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [videoQuality, setVideoQuality] = useState(() => {
    return localStorage.getItem('settings_videoQuality') || 'auto';
  });
  
  const [downloadLocation, setDownloadLocation] = useState(() => {
    return localStorage.getItem('settings_downloadLocation') || 'internal';
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('settings_language') || 'en';
  });
  
  const [subtitleLanguage, setSubtitleLanguage] = useState(() => {
    return localStorage.getItem('settings_subtitleLanguage') || 'en';
  });
  
  const { theme, setTheme } = useTheme();

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('settings_autoPlay', JSON.stringify(autoPlay));
  }, [autoPlay]);
  
  useEffect(() => {
    localStorage.setItem('settings_preloadContent', JSON.stringify(preloadContent));
  }, [preloadContent]);
  
  useEffect(() => {
    localStorage.setItem('settings_dataSaver', JSON.stringify(dataSaver));
  }, [dataSaver]);
  
  useEffect(() => {
    localStorage.setItem('settings_offlineMode', JSON.stringify(offlineMode));
  }, [offlineMode]);
  
  useEffect(() => {
    localStorage.setItem('settings_videoQuality', videoQuality);
  }, [videoQuality]);
  
  useEffect(() => {
    localStorage.setItem('settings_downloadLocation', downloadLocation);
  }, [downloadLocation]);
  
  useEffect(() => {
    localStorage.setItem('settings_language', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('settings_subtitleLanguage', subtitleLanguage);
  }, [subtitleLanguage]);

  const handleSaveSetting = (setting: string) => {
    toast.success(`${setting} updated`);
  };

  const handleClearCache = () => {
    try {
      // Clear localStorage cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear browser cache if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
      
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const appSections = [
    {
      title: 'Playback Settings',
      icon: <Monitor className="w-5 h-5" />,
      settings: [
        {
          label: 'Auto-play videos',
          description: 'Automatically start playing content when selected',
          type: 'switch',
          value: autoPlay,
          onChange: setAutoPlay
        },
        {
          label: 'Preload content',
          description: 'Load content in advance for smoother playback',
          type: 'switch',
          value: preloadContent,
          onChange: setPreloadContent
        },
        {
          label: 'Video quality',
          description: 'Default quality for streaming content',
          type: 'select',
          value: videoQuality,
          onChange: setVideoQuality,
          options: [
            { value: 'auto', label: 'Auto (Recommended)' },
            { value: '1080p', label: '1080p (High)' },
            { value: '720p', label: '720p (Medium)' },
            { value: '480p', label: '480p (Low)' }
          ]
        }
      ]
    },
    {
      title: 'Network Settings',
      icon: <Wifi className="w-5 h-5" />,
      settings: [
        {
          label: 'Data saver mode',
          description: 'Use less data by reducing video quality',
          type: 'switch',
          value: dataSaver,
          onChange: setDataSaver
        },
        {
          label: 'Offline mode',
          description: 'Only show downloaded content when offline',
          type: 'switch',
          value: offlineMode,
          onChange: setOfflineMode
        }
      ]
    },
    {
      title: 'Download Settings',
      icon: <Download className="w-5 h-5" />,
      settings: [
        {
          label: 'Download location',
          description: 'Where to store downloaded content',
          type: 'select',
          value: downloadLocation,
          onChange: setDownloadLocation,
          options: [
            { value: 'internal', label: 'Internal Storage' },
            { value: 'external', label: 'External Storage' },
            { value: 'cloud', label: 'Cloud Storage' }
          ]
        }
      ]
    },
    {
      title: 'Language & Accessibility',
      icon: <Globe className="w-5 h-5" />,
      settings: [
        {
          label: 'App language',
          description: 'Language for the app interface',
          type: 'select',
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'pt', label: 'Portuguese' }
          ]
        },
        {
          label: 'Subtitle language',
          description: 'Default language for subtitles',
          type: 'select',
          value: subtitleLanguage,
          onChange: setSubtitleLanguage,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'off', label: 'Off' }
          ]
        },
        {
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: theme,
          onChange: setTheme,
          options: [
            { value: 'default', label: 'Default Dark' },
            { value: 'midnight', label: 'Midnight Gradient' },
            { value: 'neon', label: 'Neon Cyberpunk' },
            { value: 'sunrise', label: 'Sunrise Horizon' },
            { value: 'forest', label: 'Forest Deep' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">App Settings</h1>
          <p className="text-muted-foreground mb-8">Customize your app experience</p>

          <div className="space-y-6">
            {appSections.map((section, sectionIndex) => (
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

                      <div className="ml-4">
                        {setting.type === 'switch' ? (
                          <Switch
                            checked={setting.value as boolean}
                            onCheckedChange={(checked) => {
                              (setting.onChange as (value: boolean) => void)(checked);
                              handleSaveSetting(setting.label);
                            }}
                          />
                        ) : (
                          <Select
                            value={setting.value as string}
                            onValueChange={(value) => {
                              (setting.onChange as (value: string) => void)(value);
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Storage Information */}
          <Card className="p-6 bg-card border-border mt-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Storage Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Downloaded Content</span>
                <span className="text-muted-foreground">2.3 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cache Data</span>
                <span className="text-muted-foreground">156 MB</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Total Used</span>
                <span>2.46 GB</span>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AppSettings.module.css';
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

const AppSettings = () => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [preloadContent, setPreloadContent] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [downloadLocation, setDownloadLocation] = useState('internal');
  const [language, setLanguage] = useState('en');
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usageInMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaInGB = (estimate.quota || 0) / (1024 * 1024 * 1024);
        setStorageUsed(usageInMB);
        setStorageQuota(quotaInGB);
      }
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const clearCache = async () => {
    try {
      setClearing(true);

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage (except important data)
      const keysToKeep = ['seen-notifications', 'user-preferences'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Recalculate storage
      await calculateStorage();

      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  const handleSaveSetting = (setting: string) => {
    toast.success(`${setting} updated`);
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
        }
      ]
    }
  ];

  const formatStorage = (mb: number) => {
    if (mb < 1024) {
      return `${mb.toFixed(0)} MB`;
    }
    return `${(mb / 1024).toFixed(2)} GB`;
  };

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
                <span>App Data & Cache</span>
                <span className="text-muted-foreground">{formatStorage(storageUsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Available Storage</span>
                <span className="text-muted-foreground">{storageQuota.toFixed(2)} GB</span>
              </div>

              {/* Storage Progress Bar */}
              <div className={styles.storageProgressBar}>
                <div
                  className={styles.storageProgressFill}
                  style={{
                    width: `${Math.min((storageUsed / (storageQuota * 1024)) * 100, 100)}%`
                  }}
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearCache}
                  disabled={clearing}
                >
                  {clearing ? 'Clearing...' : 'Clear Cache'}
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
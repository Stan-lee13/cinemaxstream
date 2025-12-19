import React, { useState, useEffect, useRef } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import {
  Monitor,
  Wifi,
  Download,
  Globe,
  Trash2,
  HardDrive
} from 'lucide-react';
import { useTheme } from '@/hooks/themeContext';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const AppSettings = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".settings-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".settings-group", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });

      gsap.from(".storage-card", {
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: "back.out(1.7)"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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

      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
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
      title: 'Playback',
      icon: <Monitor className="w-5 h-5 text-blue-400" />,
      settings: [
        {
          label: 'Auto-play videos',
          description: 'Automatically start playing content',
          type: 'switch',
          value: autoPlay,
          onChange: setAutoPlay
        },
        {
          label: 'Preload content',
          description: 'Load content in advance',
          type: 'switch',
          value: preloadContent,
          onChange: setPreloadContent
        },
        {
          label: 'Video quality',
          description: 'Default streaming quality',
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
      title: 'Network',
      icon: <Wifi className="w-5 h-5 text-emerald-400" />,
      settings: [
        {
          label: 'Data saver mode',
          description: 'Reduce quality to save data',
          type: 'switch',
          value: dataSaver,
          onChange: setDataSaver
        },
        {
          label: 'Offline mode',
          description: 'Show downloaded content only',
          type: 'switch',
          value: offlineMode,
          onChange: setOfflineMode
        }
      ]
    },
    {
      title: 'Downloads',
      icon: <Download className="w-5 h-5 text-purple-400" />,
      settings: [
        {
          label: 'Download location',
          description: 'Where to store downloads',
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
      title: 'Language',
      icon: <Globe className="w-5 h-5 text-pink-400" />,
      settings: [
        {
          label: 'App language',
          description: 'Interface language',
          type: 'select',
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ]
        },
        {
          label: 'Subtitle language',
          description: 'Default subtitle language',
          type: 'select',
          value: subtitleLanguage,
          onChange: setSubtitleLanguage,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'off', label: 'Off' }
          ]
        },
        {
          label: 'App Theme',
          description: 'Visual appearance',
          type: 'select',
          value: theme,
          onChange: setTheme,
          options: [
            { value: 'default', label: 'Default Dark' },
            { value: 'midnight', label: 'Midnight Gradient' },
            { value: 'neon', label: 'Neon Cyberpunk' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[25%] h-[25%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="settings-header mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              App Preferences
            </h1>
            <p className="text-gray-400">Customize your viewing experience and application behavior</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {appSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="settings-group bg-[#111] border border-white/5 rounded-3xl overflow-hidden p-1">
                  <div className="p-4 bg-white/5 rounded-t-[20px] flex items-center gap-3 border-b border-white/5">
                    <div className="p-2 bg-black/20 rounded-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-lg font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {section.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="flex items-center justify-between group py-2">
                        <div className="flex-1 pr-4">
                          <Label className="text-base font-medium text-gray-200 group-hover:text-white transition-colors">{setting.label}</Label>
                          <p className="text-sm text-gray-500 mt-0.5">{setting.description}</p>
                        </div>

                        {setting.type === 'switch' ? (
                          <Switch
                            checked={setting.value as boolean}
                            onCheckedChange={(checked) => {
                              (setting.onChange as (value: boolean) => void)(checked);
                              handleSaveSetting(setting.label);
                            }}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
                          />
                        ) : (
                          <Select
                            value={setting.value as string}
                            onValueChange={(value) => {
                              (setting.onChange as (value: string) => void)(value);
                              handleSaveSetting(setting.label);
                            }}
                          >
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white rounded-xl focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                              {setting.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Storage Card */}
              <div className="storage-card bg-[#111] border border-white/5 rounded-3xl p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Storage</h2>
                </div>

                <div className="relative pt-6 pb-2">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold text-white">2.46<span className="text-sm text-gray-500 ml-1">GB</span></span>
                    <span className="text-sm text-gray-400">of 64 GB</span>
                  </div>
                  {/* Progress Visual */}
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="w-[20%] h-full bg-emerald-500" />
                    <div className="w-[5%] h-full bg-blue-500" />
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Downloads
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Cache
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/5" />
                      Free
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Downloads</span>
                    <span className="text-white font-medium text-sm">2.3 GB</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Cache</span>
                    <span className="text-white font-medium text-sm">156 MB</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-6 border-white/10 hover:bg-white/10 text-white hover:text-white rounded-xl h-10"
                  onClick={handleClearCache}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppSettings;
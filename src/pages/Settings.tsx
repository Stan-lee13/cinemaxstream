import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/authHooks';
import { useTheme } from '@/hooks/themeContext';
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from 'sonner';
import {
  Monitor,
  Bell,
  Shield,
  Download,
  Moon,
  Sun,
  Palette,
  Eye,
  Zap,
  Languages,
  ChevronRight,
  Wifi,
  CloudDownload,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState('1080p');
  const [language, setLanguage] = useState('en');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".settings-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".settings-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSaveSetting = (setting: string) => {
    toast.success(`${setting} configuration applied`);
  };

  const settingsSections = [
    {
      title: "Playback & Experience",
      icon: <Monitor className="w-5 h-5 text-blue-500" />,
      settings: [
        {
          label: "Auto-play next episode",
          description: "Seamlessly transition between episodes",
          icon: <Zap className="w-4 h-4" />,
          type: "switch",
          value: autoPlay,
          onChange: setAutoPlay
        },
        {
          label: "Ultra High Quality",
          description: "Stream in pure 4K when available",
          icon: <Eye className="w-4 h-4" />,
          type: "switch",
          value: highQuality,
          onChange: setHighQuality
        },
        {
          label: "Interface Theme",
          description: "Elevate your visual ambiance",
          icon: <Palette className="w-4 h-4" />,
          type: "select",
          value: theme,
          onChange: setTheme,
          options: [
            { value: 'default', label: 'Classic Noir' },
            { value: 'midnight', label: 'Midnight Ocean' },
            { value: 'neon', label: 'Cyber Neon' },
            { value: 'sunrise', label: 'Golden Hour' },
            { value: 'forest', label: 'Deep Forest' }
          ]
        }
      ]
    },
    {
      title: "Downloads & Offline",
      icon: <Download className="w-5 h-5 text-emerald-500" />,
      settings: [
        {
          label: "Resolution",
          description: "Preferred quality for offline viewing",
          icon: <CloudDownload className="w-4 h-4" />,
          type: "select",
          value: downloadQuality,
          onChange: setDownloadQuality,
          options: [
            { value: '480p', label: 'Standard (SD)' },
            { value: '720p', label: 'High Definition (HD)' },
            { value: '1080p', label: 'Full HD (FHD)' }
          ]
        },
        {
          label: "Download via Cellular",
          description: "Allow downloads on mobile data networks",
          icon: <Wifi className="w-4 h-4" />,
          type: "switch",
          value: false,
          onChange: () => { }
        }
      ]
    },
    {
      title: "Communication",
      icon: <Bell className="w-5 h-5 text-purple-500" />,
      settings: [
        {
          label: "Intelligent Alerts",
          description: "Receive updates about new releases",
          icon: <Sparkles className="w-4 h-4" />,
          type: "switch",
          value: notifications,
          onChange: setNotifications
        }
      ]
    },
    {
      title: "Localization",
      icon: <Languages className="w-5 h-5 text-pink-500" />,
      settings: [
        {
          label: "System Language",
          description: "Select your primary interface language",
          icon: <Languages className="w-4 h-4" />,
          type: "select",
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'en', label: 'English (US)' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' }
          ]
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-[40px] p-12 text-center shadow-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-10 border border-white/10">
            <SettingsIcon className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Settings Locked</h1>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">Elevate your experience. Sign in to access personal viewing configurations.</p>
          <Button
            onClick={() => navigate('/auth')}
            className="w-full h-14 bg-white text-black hover:bg-cinemax-500 hover:text-white font-black rounded-2xl transition-all shadow-xl"
          >
            Authenticate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[-5%] w-[45%] h-[45%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="settings-header mb-16 px-4">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
              Settings
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              Precision-tuned experience. Personalize every aspect of your cinematic journey.
            </p>
          </div>

          <div className="space-y-10">
            {settingsSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="settings-card space-y-6">
                <div className="flex items-center gap-3 px-6">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">{section.title}</h2>
                </div>

                <Card className="p-4 bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {section.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors rounded-2xl">
                        <div className="flex gap-5 items-start">
                          <div className="mt-1 p-2 bg-white/5 rounded-lg text-gray-500 group-hover:text-white transition-colors">
                            {setting.icon}
                          </div>
                          <div>
                            <Label className="text-lg font-black text-gray-100 uppercase tracking-tighter cursor-pointer">
                              {setting.label}
                            </Label>
                            <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">{setting.description}</p>
                          </div>
                        </div>

                        <div className="ml-6 flex-shrink-0">
                          {setting.type === 'switch' ? (
                            <Switch
                              checked={setting.value as boolean}
                              onCheckedChange={(checked) => {
                                if ('onChange' in setting) {
                                  (setting.onChange as (val: boolean) => void)(checked);
                                  handleSaveSetting(setting.label);
                                }
                              }}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          ) : setting.type === 'select' ? (
                            <Select
                              value={setting.value as string}
                              onValueChange={(value) => {
                                if ('onChange' in setting) {
                                  (setting.onChange as (val: string) => void)(value);
                                  handleSaveSetting(setting.label);
                                }
                              }}
                            >
                              <SelectTrigger className="w-44 md:w-56 h-12 bg-white/5 border-white/5 rounded-xl font-bold uppercase tracking-widest text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#111] border-white/10 rounded-xl">
                                {setting.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="font-bold uppercase tracking-widest text-[10px] focus:bg-blue-500 focus:text-white">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-20 p-10 rounded-[32px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Professional Calibration?</h3>
              <p className="text-gray-400 font-medium italic">Our expert systems are ready to optimize your setup.</p>
            </div>
            <Button
              className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-blue-500 hover:text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate('/contact-support')}
            >
              Consult Support
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
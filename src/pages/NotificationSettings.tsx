import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Volume2, Radio, CheckCircle2 } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newContentAlert, setNewContentAlert] = useState(true);
  const [downloadComplete, setDownloadComplete] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".settings-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".settings-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSave = () => {
    // Here you would save to your backend
    toast.success('Notification preferences saved');
  };

  const notificationSections = [
    {
      title: 'General Notifications',
      icon: <Bell className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/20",
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
      icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/20",
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
      icon: <Mail className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/20",
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
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="settings-header mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Notification Settings
            </h1>
            <p className="text-gray-400">Control how and when you receive notifications from CinemaxStream</p>
          </div>

          <div className="space-y-6">
            {notificationSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="settings-card bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg p-1"
              >
                <div className={`p-4 bg-gradient-to-r ${section.color} rounded-t-[20px] flex items-center gap-3 border-b border-white/5`}>
                  <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold text-white max-md:text-base">{section.title}</h2>
                </div>

                <div className="p-6 space-y-6">
                  {section.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between group">
                      <div className="flex-1 pr-4">
                        <Label className="text-base font-medium text-gray-200 group-hover:text-white transition-colors">{setting.label}</Label>
                        <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.value}
                        onCheckedChange={setting.onChange}
                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Browser Notification Permission */}
            <div className="settings-card bg-[#111] border border-white/5 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-xl">
                  <Smartphone className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Browser Permissions</h2>
                  <p className="text-sm text-gray-400">Manage system-level notification access</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <Label className="text-base font-medium text-white">Enable Browser Push</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Allow this site to send you notifications even when the app is closed
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-white/10 ${Notification?.permission === 'granted' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400' : 'hover:bg-white/10 text-white'}`}
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
                  {Notification?.permission === 'granted' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Active
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-6 settings-card">
              <Button
                onClick={handleSave}
                className="px-8 h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-base transition-all hover:scale-105"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationSettings;
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Volume2, CheckCircle2, ShieldCheck, Zap, Sparkles, Send, Megaphone } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('notif_email') !== 'false');
  const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem('notif_push') !== 'false');
  const [newContentAlert, setNewContentAlert] = useState(() => localStorage.getItem('notif_content') !== 'false');
  const [downloadComplete, setDownloadComplete] = useState(() => localStorage.getItem('notif_download') !== 'false');
  const [promotionalEmails, setPromotionalEmails] = useState(() => localStorage.getItem('notif_promo') === 'true');
  const [weeklyDigest, setWeeklyDigest] = useState(() => localStorage.getItem('notif_weekly') !== 'false');
  const [isSaving, setIsSaving] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    localStorage.setItem('notif_email', String(emailNotifications));
    localStorage.setItem('notif_push', String(pushNotifications));
    localStorage.setItem('notif_content', String(newContentAlert));
    localStorage.setItem('notif_download', String(downloadComplete));
    localStorage.setItem('notif_promo', String(promotionalEmails));
    localStorage.setItem('notif_weekly', String(weeklyDigest));

    setIsSaving(false);
    toast.success('Your communication matrix has been updated');
  };

  const notificationSections = [
    {
      title: 'Infrastructure Alerts',
      icon: <Bell className="w-5 h-5 text-blue-400" />,
      tag: "Critical",
      settings: [
        {
          label: 'Direct Email Dispatch',
          description: 'High-priority system status and security updates',
          icon: <Mail className="w-4 h-4" />,
          value: emailNotifications,
          onChange: setEmailNotifications
        },
        {
          label: 'Real-time Push Hooks',
          description: 'Instant synchronization notifications across devices',
          icon: <Send className="w-4 h-4" />,
          value: pushNotifications,
          onChange: setPushNotifications
        }
      ]
    },
    {
      title: 'Curation Engine',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      tag: "Content",
      settings: [
        {
          label: 'Premier Release Alerts',
          description: 'Be the first to know when masterpieces arrive',
          icon: <Zap className="w-4 h-4" />,
          value: newContentAlert,
          onChange: setNewContentAlert
        },
        {
          label: 'Pipeline Completion',
          description: 'Immediate notification upon successful asset download',
          icon: <Volume2 className="w-4 h-4" />,
          value: downloadComplete,
          onChange: setDownloadComplete
        }
      ]
    },
    {
      title: 'Intelligence & Insights',
      icon: <Megaphone className="w-5 h-5 text-purple-400" />,
      tag: "Social",
      settings: [
        {
          label: 'Executive Briefings',
          description: 'Exclusive offers and premium partner invitations',
          icon: <Smartphone className="w-4 h-4" />,
          value: promotionalEmails,
          onChange: setPromotionalEmails
        },
        {
          label: 'Weekly Intelligence Digest',
          description: 'Curated overview of the week\'s cinematic highlights',
          icon: <ShieldCheck className="w-4 h-4" />,
          value: weeklyDigest,
          onChange: setWeeklyDigest
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[45%] h-[45%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <motion.div
            className="settings-header mb-16 px-4"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Bell className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Connectivity Matrix</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
              Notifications
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl">
              Calibrate your connectivity. Control the frequency and medium of your intelligent updates.
            </p>
          </motion.div>

          <div className="space-y-12">
            {notificationSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                className="settings-card space-y-6"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: sectionIndex * 0.1 }}
              >
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                      {section.icon}
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">{section.title}</h2>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/5 text-gray-500">
                    {section.tag}
                  </span>
                </div>

                <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {section.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="p-6 md:p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                        <div className="flex gap-6 items-start">
                          <div className="mt-1 p-2.5 bg-white/5 rounded-xl text-gray-500 group-hover:text-white group-hover:bg-blue-500/10 transition-all">
                            {setting.icon}
                          </div>
                          <div>
                            <Label className="text-lg font-black text-gray-100 uppercase tracking-tighter cursor-pointer block mb-1">
                              {setting.label}
                            </Label>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">{setting.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={setting.value}
                          onCheckedChange={setting.onChange}
                          className="data-[state=checked]:bg-blue-500 h-7 w-12"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Browser Notification Permission */}
            <motion.div
              className="settings-card"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="p-8 md:p-10 bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Smartphone size={150} className="text-white" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center border border-white/10 shrink-0">
                    <Smartphone className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Browser Interface Protocol</h2>
                    <p className="text-gray-400 font-medium leading-relaxed">
                      Establish a direct system-level link for critical background synchronizations.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className={`h-14 px-10 rounded-2xl border-white/10 text-base font-black uppercase tracking-widest transition-all ${Notification?.permission === 'granted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white text-black hover:bg-cinemax-500 hover:text-white border-0 shadow-xl shadow-white/5'}`}
                    onClick={() => {
                      if ('Notification' in window) {
                        Notification.requestPermission().then((permission) => {
                          if (permission === 'granted') {
                            toast.success('Protocol established');
                          } else {
                            toast.error('Protocol rejected');
                          }
                        });
                      }
                    }}
                  >
                    {Notification?.permission === 'granted' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        Synchronized
                      </>
                    ) : (
                      'Initialize Link'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-center pt-10 settings-card"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
            >
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto px-16 h-16 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-[24px] font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
              >
                {isSaving ? (
                  <>
                    <Zap className="mr-3 h-5 w-5 animate-pulse text-blue-500" />
                    Synchronizing...
                  </>
                ) : (
                  'Apply Preferences'
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationSettings;

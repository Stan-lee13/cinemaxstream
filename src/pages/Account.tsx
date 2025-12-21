import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, CreditCard, Download, Bell, Shield, FileText, Trash2, Mail, ChevronRight, LogOut, History, Bookmark, Sparkles, Calendar } from 'lucide-react';
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".account-header", {
        scale: 0.98,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.from(".section-title", {
        x: -10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        delay: 0.1,
        ease: "power2.out"
      });

      gsap.from(".settings-card", {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.04,
        delay: 0.15,
        ease: "power2.out"
      });

      gsap.from(".danger-zone", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const accountSections = [
    {
      group: "General",
      items: [
        {
          icon: User,
          title: "Profile Information",
          description: "Manage your personal information",
          route: "/edit-profile",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20"
        },
        {
          icon: CreditCard,
          title: "Subscription & Billing",
          description: "View plan and billing details",
          route: "/manage-billing",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20"
        }
      ]
    },
    {
      group: "Content & Activity",
      items: [
        {
          icon: History,
          title: "Watch History",
          description: "View and clear history",
          route: "/history",
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20"
        },
        {
          icon: Bookmark,
          title: "Watch List",
          description: "Your saved collection",
          route: "/watchlist",
          color: "text-pink-500",
          bgColor: "bg-pink-500/10",
          borderColor: "border-pink-500/20"
        },
        {
          icon: Download,
          title: "Downloads",
          description: "Manage offline content",
          route: "/downloads",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20"
        }
      ]
    },
    {
      group: "Preferences",
      items: [
        {
          icon: Bell,
          title: "Notifications",
          description: "Email and app alerts",
          route: "/notification-settings",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/20"
        },
        {
          icon: Settings,
          title: "App Preferences",
          description: "Customize viewing experience",
          route: "/app-settings",
          color: "text-indigo-500",
          bgColor: "bg-indigo-500/10",
          borderColor: "border-indigo-500/20"
        }
      ]
    },
    {
      group: "Security",
      items: [
        {
          icon: Shield,
          title: "Privacy & Security",
          description: "Password and security settings",
          route: "/security-settings",
          color: "text-cyan-500",
          bgColor: "bg-cyan-500/10",
          borderColor: "border-cyan-500/20"
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-[32px] p-10 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Identity Required</h1>
          <p className="text-gray-400 mb-10 leading-relaxed">Secure your journey. Please sign in to access your premium account settings and synchronization.</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          >
            Sign In to Account
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Return to Explorations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="account-header flex flex-col md:flex-row items-center gap-8 mb-16 p-8 md:p-10 rounded-[40px] bg-white/5 border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl shadow-black/40">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles size={160} className="text-blue-500/30" />
            </div>

            <div className="relative">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[48px] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-3xl transform group-hover:scale-105 transition-transform duration-500">
                <span className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-full border-4 border-[#0a0a0a] shadow-lg flex items-center justify-center" title="Active Account">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1 z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                  {user.email?.split('@')[0]}
                </h1>
              </div>
              <p className="text-white/60 text-xl font-medium mb-8 select-all decoration-blue-500 underline-offset-4 decoration-2">{user.email}</p>

              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <Calendar size={18} className="text-gray-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joined On</span>
                    <span className="text-sm font-black text-white">
                      {new Date(user.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="px-8 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 font-black text-sm uppercase tracking-widest shadow-lg active:scale-95"
                >
                  <LogOut size={18} />
                  Terminate Session
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-14">
            {accountSections.map((section, idx) => (
              <div key={idx} className="space-y-8">
                <h2 className="section-title text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-4">
                  {section.group}
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    const isBilling = item.title.includes("Billing");
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(item.route)}
                        className={`settings-card group p-8 rounded-[32px] border transition-all cursor-pointer flex items-center gap-6 relative overflow-hidden backdrop-blur-xl ${isBilling ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500' : 'bg-[#161616] border-white/10 hover:border-white/20 hover:bg-[#1a1a1a]'}`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        {isBilling && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-black px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">
                            Active Subscription
                          </div>
                        )}

                        <div className={`w-16 h-16 rounded-2xl ${item.bgColor} ${item.color} ${item.borderColor} border flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          <Icon size={32} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-black text-xl mb-1 uppercase tracking-tight transition-colors ${isBilling ? 'text-amber-400' : 'text-white group-hover:text-blue-400'}`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className={`transition-all duration-300 ${isBilling ? 'text-amber-500' : 'text-gray-500 group-hover:text-white'} group-hover:translate-x-2`} size={28} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-12 border-t border-white/5 danger-zone">
            <div className="flex items-center gap-3 mb-8 px-2">
              <Shield size={20} className="text-red-500" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Advanced Security & Controls</h3>
            </div>
            <div className="flex flex-wrap gap-4 px-2">
              <button
                onClick={() => navigate('/export-data')}
                className="px-6 py-4 rounded-2xl bg-[#111] border border-white/5 hover:bg-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-3 text-sm font-black uppercase tracking-widest flex-1 min-w-[200px] justify-center"
              >
                <FileText size={18} />
                Export Archive
              </button>
              <button
                onClick={() => navigate('/contact-support')}
                className="px-6 py-4 rounded-2xl bg-[#111] border border-white/5 hover:bg-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-3 text-sm font-black uppercase tracking-widest flex-1 min-w-[200px] justify-center"
              >
                <Mail size={18} />
                Concierge Support
              </button>
              <button
                onClick={() => navigate('/delete-account')}
                className="px-6 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all flex items-center gap-3 text-sm font-black uppercase tracking-widest flex-1 min-w-[200px] justify-center group/del"
              >
                <Trash2 size={18} className="group-hover/del:animate-bounce" />
                Terminate Account
              </button>
            </div>

            <p className="mt-12 text-center text-xs text-gray-600 font-bold uppercase tracking-[0.2em]">
              Cinemax Stream • Premium Experience • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;

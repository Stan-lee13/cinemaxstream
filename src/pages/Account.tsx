import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, CreditCard, Download, Bell, Shield, FileText, Trash2, Mail, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react';
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
        delay: 0.3,
        ease: "power2.out"
      });

      gsap.from(".action-button", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        delay: 0.6,
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
          bgColor: "bg-blue-500/10"
        },
        {
          icon: CreditCard,
          title: "Subscription & Billing",
          description: "View plan and billing details",
          route: "/manage-billing",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10"
        }
      ]
    },
    {
      group: "Content & Activity",
      items: [
        {
          icon: Download,
          title: "Downloads",
          description: "Manage offline content",
          route: "/downloads",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10"
        },
        {
          icon: LayoutDashboard,
          title: "Watch History",
          description: "View and clear history",
          route: "/watch-history",
          color: "text-purple-500",
          bgColor: "bg-purple-500/10"
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
          color: "text-pink-500",
          bgColor: "bg-pink-500/10"
        },
        {
          icon: Settings,
          title: "App Preferences",
          description: "Customize viewing experience",
          route: "/app-settings",
          color: "text-indigo-500",
          bgColor: "bg-indigo-500/10"
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
          bgColor: "bg-cyan-500/10"
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Access</h1>
          <p className="text-gray-400 mb-8">Please sign in to access your account settings and preferences.</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-500 hover:text-white text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="account-header flex flex-col md:flex-row items-center gap-6 mb-12 p-6 rounded-3xl bg-secondary/30 border border-white/10 backdrop-blur-md">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cinemax-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-purple-900/20">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{user.email?.split('@')[0]}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300 border border-white/5">
                  Member since {new Date(user.created_at || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-6 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {accountSections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-semibold text-gray-500 mb-4 px-2">{section.group}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(item.route)}
                        className="settings-card group p-4 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 hover:bg-[#161616] transition-all cursor-pointer flex items-center gap-4"
                      >
                        <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-12 border-t border-white/10">
            <h3 className="text-lg font-semibold text-gray-500 mb-6 px-2">Danger Zone</h3>
            <div className="flex flex-wrap gap-4 px-2">
              <button
                onClick={() => navigate('/export-data')}
                className="action-button px-5 py-2.5 rounded-xl bg-[#111] border border-white/10 hover:bg-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FileText size={16} />
                Export Data
              </button>
              <button
                onClick={() => navigate('/contact-support')}
                className="action-button px-5 py-2.5 rounded-xl bg-[#111] border border-white/10 hover:bg-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Mail size={16} />
                Contact Support
              </button>
              <button
                onClick={() => navigate('/delete-account')}
                className="action-button px-5 py-2.5 rounded-xl bg-red-950/10 border border-red-900/20 hover:bg-red-900/20 hover:border-red-500/30 text-red-500 transition-all flex items-center gap-2 text-sm font-medium ml-auto"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;

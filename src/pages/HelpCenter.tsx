import React, { useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  PlayCircle,
  Download,
  Settings,
  CreditCard,
  Shield,
  MessageCircle,
  Book,
  Video,
  Search,
  ChevronRight,
  LifeBuoy,
  FileText,
  Sparkles
} from 'lucide-react';
import BackButton from "@/components/BackButton";
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const HelpCenter = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".help-header", {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".topic-card", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".support-banner", {
        scale: 0.98,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const helpTopics = [
    {
      icon: <PlayCircle className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "First Expeditions",
      description: "Fundamental navigational protocols",
      items: [
        { title: "Initialization Protocol", action: () => navigate('/auth') },
        { title: "Navigation Logic", action: () => navigate('/') },
        { title: "Intelligence Search", action: () => navigate('/') },
        { title: "Collection Management", action: () => navigate('/favorites') }
      ]
    },
    {
      icon: <Download className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      title: "Off-grid Archives",
      description: "Asynchronous asset synchronization",
      items: [
        { title: "Synchronization Guide", action: () => navigate('/downloads') },
        { title: "Cache Management", action: () => navigate('/downloads') },
        { title: "Quota Thresholds", action: () => navigate('/manage-billing') },
        { title: "High-Tier Distribution", action: () => navigate('/manage-billing') }
      ]
    },
    {
      icon: <Settings className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      title: "Identity Controls",
      description: "Personalize your existence",
      items: [
        { title: "Manifest Modification", action: () => navigate('/edit-profile') },
        { title: "Cloaking Settings", action: () => navigate('/security-settings') },
        { title: "Event Streams", action: () => navigate('/notification-settings') },
        { title: "Core Preferences", action: () => navigate('/app-settings') }
      ]
    },
    {
      icon: <CreditCard className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      title: "Subscriptions",
      description: "Financial tier management",
      items: [
        { title: "Tier Comparison", action: () => navigate('/manage-billing') },
        { title: "Priority Upgrades", action: () => navigate('/manage-billing') },
        { title: "Premium Access Codes", action: () => navigate('/') },
        { title: "Termination Protocol", action: () => navigate('/manage-billing') }
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan-500" />,
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      title: "Security & Safety",
      description: "Fortify your account matrix",
      items: [
        { title: "Key Rotation", action: () => navigate('/security-settings') },
        { title: "Access Layering", action: () => navigate('/security-settings') },
        { title: "Privacy Manifest", action: () => navigate('/privacy') },
        { title: "Terms of Engagement", action: () => navigate('/terms') }
      ]
    },
    {
      icon: <Video className="w-6 h-6 text-pink-500" />,
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      title: "Stream Pulse",
      description: "Optimizing the visual stream",
      items: [
        { title: "Bitrate Configuration", action: () => navigate('/app-settings') },
        { title: "Signal Disruptions", action: () => navigate('/contact-support') },
        { title: "Neural Compatibility", action: () => navigate('/faq') },
        { title: "Latency Reduction", action: () => navigate('/faq') }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[5%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="help-header mb-20 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <LifeBuoy size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Global Assistance Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-600 tracking-tighter max-w-4xl">
              Cinematic Intelligence Support
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mb-12">
              Our neural network of documentation and human specialists is ready to optimize your experience.
            </p>

            <div className="w-full max-w-2xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={24} />
              <Input
                placeholder="Search the intelligence database..."
                className="w-full h-16 bg-white/5 border-white/10 focus:border-blue-500/30 rounded-[24px] pl-16 pr-6 text-lg font-medium transition-all shadow-2xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-widest hidden md:block">
                Press / to find
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="topic-card bg-[#111]/80 border border-white/5 hover:border-white/10 p-8 rounded-[40px] group transition-all backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Sparkles size={80} className="text-blue-500" />
                </div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={`p-4 ${topic.bg} ${topic.border} border rounded-[24px] shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{topic.title}</h3>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed relative z-10">{topic.description}</p>
                <div className="space-y-4 relative z-10">
                  {topic.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className="flex items-center justify-between w-full group/item text-left"
                    >
                      <span className="text-sm font-bold text-gray-400 group-hover/item:text-blue-400 transition-colors uppercase tracking-widest">
                        {item.title}
                      </span>
                      <ChevronRight size={14} className="text-gray-700 group-hover/item:text-white transition-all transform translate-x-0 group-hover/item:translate-x-1" />
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="support-banner bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-[48px] p-10 md:p-16 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-700">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">Human Intelligence Required?</h3>
              <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
                Our elite support specialists are standing by for direct assistance with complex system interactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={() => navigate('/contact-support')}
                  className="h-16 px-10 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
                >
                  <MessageCircle className="mr-3 h-5 w-5" />
                  Contact Support
                </Button>
                <Button
                  onClick={() => navigate('/faq')}
                  variant="outline"
                  className="h-16 px-10 border-white/10 hover:bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Access Full FAQ
                </Button>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 w-full text-center">
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em]">Current Connection State: Secure • Latency: 24ms • Priority: High</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;

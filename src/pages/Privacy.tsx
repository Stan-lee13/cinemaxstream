import React, { useRef, useEffect } from 'react';
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';
import { Card } from '@/components/ui/card';
import { Shield, Eye, Database, Lock, UserCheck, Mail, ChevronRight, Activity } from 'lucide-react';

const Privacy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".privacy-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".privacy-section", {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="privacy-header mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Security Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
              Privacy Policy
            </h1>
            <p className="text-gray-400 font-medium">Last Synchronized: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            <Card className="privacy-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Intelligence Introduction</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                At CinemaxStream, we respect your digital sovereignty and are committed to protecting your
                neural metadata. This policy explains how we synthesize, index, and safeguard your
                information when you synchronize with our service.
              </p>
            </Card>

            <Card className="privacy-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Database className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Information Indexing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Identity Parameters</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    We collect variables you provide directly, such as account credentials,
                    subscription tiers, and support transmissions.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Usage Telemetry</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    We monitor interaction patterns, viewing frequencies, and preference matrices
                    to optimize your cinematic stream.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="privacy-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Protocol Usage</h2>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Maintaining high-fidelity asset streams",
                  "Personalizing cinematic recommendation matrices",
                  "Processing encrypted subscription blocks",
                  "Establishing secure communication uplinks",
                  "Synthesizing system improvements"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400 font-medium text-sm">
                    <ChevronRight size={14} className="text-emerald-500 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="privacy-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Cryptographic Defense</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                We implement elite defensive layers to protect your metadata against
                unauthorized extraction or modification. Your history is sharded and
                stored across our secure network using industry-standard protocols.
              </p>
            </Card>

            <Card className="privacy-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <UserCheck className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">User Rights</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                You retain the right to query, update, or purge your information index.
                Full transparency of your digital footprint is available via the Identity Hub.
              </p>
            </Card>

            <div className="privacy-section bg-gradient-to-br from-emerald-900/10 to-blue-900/10 border border-white/10 rounded-[32px] p-10 text-center">
              <Mail className="w-10 h-10 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">Privacy Synchronization</h3>
              <p className="text-gray-400 mb-8 font-medium">
                For deeper inquiries into our defensive protocols, initiate a secure mail stream.
              </p>
              <a
                href="mailto:stanleyvic13@gmail.com"
                className="inline-flex items-center h-14 px-10 bg-white text-black hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/5 hover:scale-[1.02]"
              >
                Inquire via Signal
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;

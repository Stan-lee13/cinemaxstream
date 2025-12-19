import React, { useRef, useEffect } from 'react';
import { DMCA_CONTACT } from '@/data/dmcaData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Mail, FileText, AlertTriangle, Scale, Hammer, Clock, Send, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export default function DMCA() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dmca-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".dmca-section", {
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
        <div className="absolute top-[10%] right-[10%] w-[45%] h-[45%] bg-blue-900/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] bg-purple-900/5 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="dmca-header mb-16 px-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Copyright Protection Unit</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
              DMCA Policy
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-2xl">
              Compliance protocols and content indexing regulations in accordance with the Digital Millennium Copyright Act.
            </p>
          </div>

          <div className="space-y-8">
            {/* Overview */}
            <Card className="dmca-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Overview</h2>
                </div>
                <p className="text-gray-400 leading-relaxed font-bold mb-8">
                  CinemaxStream operating as an intelligence aggregator for digital assets.
                  We respect the creative sovereignty of originators and respond to validated takedown
                  signals when properly transmitted through our secure channels.
                </p>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-500/10 rounded-xl mt-1">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-amber-500 font-black uppercase tracking-widest text-xs mb-2">Aggregator Protocol Notice</p>
                      <p className="text-gray-300 text-sm leading-relaxed font-medium">
                        CinemaxStream is an automated indexing matrix. We do not host raw asset files on local storage nodes.
                        We facilitate access to decentralized content buffers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filing a DMCA Notice */}
            <Card className="dmca-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Scale className="w-6 h-6 text-gray-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Signal Transmission</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium mb-8">
                To initiate a content de-indexing sequence, the following neural parameters are required:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[
                  "Verified Identity & Uplink Address",
                  "Asset description claiming sovereignty",
                  "Direct URL of the infringing index",
                  "Good-faith assertion signature",
                  "Accuracy validation statement",
                  "Cryptographic or physical signature"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/row hover:bg-white/5 transition-colors">
                    <ChevronRight size={14} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 text-center">
                *Section 512(f) constraints apply to all transmissions.
              </p>
            </Card>

            {/* Contact Information */}
            <Card className="dmca-section bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Command Contact</h2>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-3xl p-8 mb-8 relative z-10 backdrop-blur-md">
                <div className="space-y-6">
                  {[
                    { label: 'DMCA AGENT', value: DMCA_CONTACT.agent, icon: Scale },
                    { label: 'UPLINK MAIL', value: DMCA_CONTACT.email, icon: Send },
                    { label: 'HQ LOCATION', value: DMCA_CONTACT.address, icon: Hammer },
                    { label: 'DIRECT SIGNAL', value: DMCA_CONTACT.phone, icon: Clock }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 md:mb-0">{item.label}</span>
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full h-16 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 group relative z-10"
                onClick={() => window.location.href = `mailto:${DMCA_CONTACT.email}?subject=DMCA Takedown Notice`}
              >
                Launch Transmission Protocol
              </Button>
            </Card>

            {/* Response Time */}
            <div className="dmca-section grid md:grid-cols-2 gap-8">
              <Card className="bg-[#111]/80 border border-white/5 p-8 rounded-[32px] hover:border-blue-500/30 transition-colors group">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 w-fit mb-6 group-hover:rotate-6 transition-transform">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Latent Response</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Validation of signals typically occurs within 24-48 standard cycles.
                </p>
              </Card>
              <Card className="bg-[#111]/80 border border-white/5 p-8 rounded-[32px] hover:border-emerald-500/30 transition-colors group">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 w-fit mb-6 group-hover:rotate-6 transition-transform">
                  <Hammer className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Asset Removal</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Infringing indices are purged from the aggregator matrix immediately upon verification.
                </p>
              </Card>
            </div>

            {/* Last Updated */}
            <div className="dmca-section text-center py-10">
              <div className="w-12 h-px bg-white/10 mx-auto mb-6" />
              <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px] mb-1">Matrix Synchronized</p>
              <p className="text-gray-400 text-xs font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
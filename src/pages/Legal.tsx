import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Scale, FileText, Globe, Shield, AlertCircle, Mail, MapPin, Briefcase, Landmark, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const Legal = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[45%] h-[45%] bg-blue-900/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-indigo-900/5 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <motion.div
            className="legal-header mb-16"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <Scale className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Governance Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
              Legal Information
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-2xl">
              Official disclosures, company parameters, and the regulatory framework of CinemaxStream.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Service Disclaimer */}
            <motion.div
              className="legal-section"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Service Disclaimer</h2>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 mb-8">
                  <p className="text-amber-500 font-black uppercase tracking-widest text-xs mb-3">Host Integration Notice</p>
                  <p className="text-gray-300 leading-relaxed font-bold">
                    CinemaxStream is a decentralized content aggregation matrix. We index and facilitate
                    neural links to digital assets across the global network. No proprietary copyrighted
                    sequences are stored on local nodes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Publicly available streaming buffers",
                    "Verified DMCA takedown synchronization",
                    "User-maintained licensing compliance",
                    "As-is architectural delivery protocol"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-gray-400 font-medium">
                      <ChevronRight size={16} className="text-amber-500 shrink-0 mt-1" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Company Information */}
            <motion.div
              className="legal-section"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
            >
              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Entity Logic</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Business Parameters</h3>
                    <div className="space-y-4">
                      {[
                        { l: 'IDENTITY', v: 'CinemaxStream LLC' },
                        { l: 'VECTOR', v: 'Delaware, USA' },
                        { l: 'CORE ID', v: 'CMS-2024-001' },
                        { l: 'VAT BLOCK', v: 'US123456789' }
                      ].map(i => (
                        <div key={i.l} className="flex flex-col gap-1 border-l-2 border-white/5 pl-4 hover:border-blue-500/50 transition-colors">
                          <span className="text-[10px] font-black text-gray-600">{i.l}</span>
                          <span className="text-sm font-bold text-white">{i.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">HQ Coordinate</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
                        <div className="text-sm font-bold text-gray-400 leading-relaxed">
                          123 Streaming Avenue<br />
                          Digital City, DC 12345<br />
                          United States
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600 shrink-0" />
                        <span className="text-sm font-bold text-blue-500">legal@cinemaxstream.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              className="legal-section"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12 group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">IP Sovereignty</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { t: 'Original Assets', d: 'Design systems, neural branding, and architectural logic are proprietary.', i: FileText },
                    { t: 'Third-Party Metadata', d: 'Asset visuals and descriptions remain property of respective studios (TMDB Sync).', i: Globe },
                    { t: 'User Transmissions', d: 'Intelligence contributed via reviews remains property of the originator.', i: Lock }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-colors">
                      <div className="p-2 bg-blue-500/10 rounded-xl w-fit mb-4">
                        <item.i className="w-4 h-4 text-blue-500" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{item.t}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.d}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Jurisdiction */}
            <motion.div
              className="legal-section grid md:grid-cols-2 gap-8"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 p-10 rounded-[40px]">
                <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit mb-6">
                  <Landmark className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">Governing Law</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">
                  All matrix operations are governed by the laws of Delaware, United States.
                  Neural disputes are resolved via binding arbitration.
                </p>
                <div className="flex items-center gap-2 text-indigo-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Delaware Jurisdiction</span>
                  <ChevronRight size={14} />
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 p-10 rounded-[40px]">
                <div className="p-3 bg-purple-500/10 rounded-2xl w-fit mb-6">
                  <Globe className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">Global Protocol</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">
                  International synchronizations are performed at user risk. Local regulatory
                  compliance remains a user-side responsibility.
                </p>
                <div className="flex items-center gap-2 text-purple-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Global Compliance</span>
                  <ChevronRight size={14} />
                </div>
              </Card>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              className="legal-section"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-10 text-center">Core Legal Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { l: 'Terms of Service', u: '/terms', i: FileText, c: 'blue' },
                    { l: 'Privacy Policy', u: '/privacy', i: Shield, c: 'emerald' },
                    { l: 'DMCA Policy', u: '/dmca', i: Scale, c: 'indigo' },
                    { l: 'Cookie Policy', u: '/cookies', i: Globe, c: 'purple' }
                  ].map((link, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-24 justify-between px-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 rounded-3xl transition-all group"
                      onClick={() => window.location.href = link.u}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-${link.c}-500/10 rounded-2xl group-hover:scale-110 transition-transform`}>
                          <link.i className={`w-5 h-5 text-${link.c}-500`} />
                        </div>
                        <span className="text-lg font-black text-white uppercase tracking-tight">{link.l}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="legal-section"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
            >
              <div className="bg-gradient-to-br from-blue-900/10 to-transparent border border-white/10 rounded-[40px] p-12 text-center group">
                <Mail className="w-12 h-12 text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Legal Inquiries</h3>
                <p className="text-gray-400 mb-10 max-w-lg mx-auto font-medium">
                  Direct all neural complaints or business inquiries to our command deck.
                  Standard response latency: 2-3 business cycles.
                </p>
                <Button
                  className="h-16 px-12 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5"
                  onClick={() => window.location.href = 'mailto:legal@cinemaxstream.com'}
                >
                  Launch Inquiry Protocol
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="legal-section text-center py-6"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            >
              <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Matrix Synchronized: {new Date().toLocaleDateString()}</p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;

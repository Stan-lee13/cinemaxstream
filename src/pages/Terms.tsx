import React from 'react';
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from '@/components/ui/card';
import { Shield, Lock, Scale, Fingerprint, FileText, ChevronRight } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="terms-header mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Legal Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
              Terms of Service
            </h1>
            <p className="text-gray-400 font-medium">Last Synchronized: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            <Card className="terms-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Acceptance of Terms</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                By accessing and using CinemaxStream, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, you should not
                use this service. Your continued interaction constitutes neural synchronization with our protocols.
              </p>
            </Card>

            <Card className="terms-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Scale className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Use License</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium mb-6">
                Permission is granted to temporarily access CinemaxStream for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Prohibited Operations</h3>
              <ul className="space-y-4">
                {[
                  "Modification or replication of proprietary source buffers",
                  "Commercial exploitation of asset streams",
                  "Reverse engineering of application logic or encryption layers",
                  "Removal of cryptographic signatures or copyright notices"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400 font-medium">
                    <ChevronRight size={16} className="text-blue-500 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="terms-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">User Accounts</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                You are responsible for safeguarding the credentials and for maintaining the confidentiality
                of your account access keys. You agree to accept responsibility for all activities that occur under
                your identity within our network.
              </p>
            </Card>

            <Card className="terms-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Integrity</h2>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                In no case shall CinemaxStream, nor its directors, employees, or affiliates, be liable for any
                indirect, incidental, or consequential damages arising out of your interaction with our stream.
              </p>
            </Card>

            <div className="terms-section bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-white/10 rounded-[32px] p-10 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Direct Communication</h3>
              <p className="text-gray-400 mb-6 font-medium">
                If you require clarification on these protocols, please establish an uplink via email.
              </p>
              <a
                href="mailto:stanleyvic13@gmail.com"
                className="inline-flex items-center h-12 px-8 bg-white text-black hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-all"
              >
                stanleyvic13@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;

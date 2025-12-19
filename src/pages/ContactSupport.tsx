import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, Clock, CheckCircle, HelpCircle, User, AtSign, Tag, Info, ChevronRight, Activity, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import gsap from 'gsap';
import { Card } from '@/components/ui/card';

const ContactSupport: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".support-header", {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".support-form-container", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power4.out"
      });

      gsap.from(".sidebar-card", {
        x: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Subscription' },
    { value: 'content', label: 'Content Request' },
    { value: 'account', label: 'Account Issue' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Efficiency', color: 'text-emerald-400', dot: 'bg-emerald-500' },
    { value: 'medium', label: 'Standard Pulse', color: 'text-amber-400', dot: 'bg-amber-500' },
    { value: 'high', label: 'Critical Override', color: 'text-red-400', dot: 'bg-red-500' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message || !formData.category) {
      toast.error('Required neural parameters missing');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: `[${formData.category.toUpperCase()}] ${formData.subject}`,
          message: `Priority: ${formData.priority.toUpperCase()}\n\n${formData.message}`
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Communication uplink established');

      setFormData({
        name: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Support submission error:', error);
      toast.error('Uplink failed. Retrying in next cycle...');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <Navbar />

        <div className="max-w-xl w-full bg-[#111]/80 border border-white/5 backdrop-blur-2xl rounded-[48px] p-12 md:p-20 text-center relative z-10 shadow-2xl">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-in zoom-in duration-700" />
          </div>
          <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Uplink Success</h2>
          <p className="text-gray-400 text-lg font-medium mb-12 leading-relaxed">
            Your transmission has been indexed. A synchronization specialist will respond within the next 24-48 cycles.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            className="w-full h-16 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95"
          >
            New Transmission
          </Button>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 px-4">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="support-header mb-16 px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Technical Uplink</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-600 tracking-tighter">
              Contact Support
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-3xl">
              Initiate a direct communication stream with our elite tech operatives. We prioritize system integrity and user experience above all.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
            {/* Contact Form */}
            <div className="lg:col-span-8 support-form-container">
              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-2xl rounded-[40px] overflow-hidden p-8 md:p-12 relative shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Agent Identity</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="bg-white/5 border-white/5 text-white focus:border-blue-500/30 h-14 rounded-2xl pl-12 font-bold transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Uplink Address</Label>
                      <div className="relative group">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="bg-white/5 border-white/5 text-white focus:border-blue-500/30 h-14 rounded-2xl pl-12 font-bold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Stream Sector</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-white/5 border-white/5 text-white h-14 rounded-2xl focus:ring-blue-500/20 px-6 font-bold">
                          <SelectValue placeholder="Select Protocol" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white rounded-[24px]">
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="focus:bg-blue-500 focus:text-white rounded-xl mx-1 mt-1 font-bold">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="priority" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Pulse Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="bg-white/5 border-white/5 text-white h-14 rounded-2xl focus:ring-blue-500/20 px-6 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white rounded-[24px]">
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value} className="focus:bg-blue-500 focus:text-white rounded-xl mx-1 mt-1 font-bold">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                                <span className={priority.color}>{priority.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Signal Header</Label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Neural interface latency issue..."
                        required
                        className="bg-white/5 border-white/5 text-white focus:border-blue-500/30 h-14 rounded-2xl pl-12 font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Encoded Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Transmission details..."
                      className="min-h-[220px] bg-white/5 border-white/5 text-white focus:border-blue-500/30 rounded-3xl p-6 font-medium resize-none text-lg transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Zap className="w-4 h-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Encrypted Stream Enabled</p>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto h-16 px-12 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Activity className="w-5 h-5 mr-3 animate-spin" />
                          Indexing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3" />
                          Broadcast Signal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="sidebar-card bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Clock size={80} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Response Latency</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Critical Sector', time: '2-4 cycles', dot: 'bg-red-500 shadow-red-500/50' },
                    { label: 'Standard Sector', time: '12-24 cycles', dot: 'bg-amber-500 shadow-amber-500/50' },
                    { label: 'Maintenance Sector', time: '24-48 cycles', dot: 'bg-emerald-500 shadow-emerald-500/50' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/row hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.dot} shadow-[0_0_8px]`} />
                        <span className="text-xs font-bold text-gray-500 group-hover/row:text-gray-300 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-white">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="sidebar-card bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Globe size={80} className="text-purple-500" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Alternate Uplinks</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4 items-center group/item cursor-pointer">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-all group-hover/item:scale-110">
                      <Mail className="w-6 h-6 text-gray-400 group-hover/item:text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Secure Mail</p>
                      <p className="text-sm font-bold text-white">support@cinemax.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center group/item cursor-pointer">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-all group-hover/item:scale-110">
                      <MessageCircle className="w-6 h-6 text-gray-400 group-hover/item:text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Live Interface</p>
                      <p className="text-sm font-bold text-white">Available 09:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="sidebar-card bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent border border-white/10 rounded-[40px] p-10 text-center shadow-2xl group hover:scale-[1.02] transition-all duration-500">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:rotate-12 transition-transform">
                  <Info className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">Pre-Submission Check</h3>
                <p className="text-sm text-gray-500 mb-8 font-medium">
                  Optimized documentation often contains the required intelligence parameters.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-14 border-white/10 hover:bg-white/5 text-white rounded-xl font-black uppercase tracking-widest transition-all"
                  onClick={() => window.location.href = '/faq'}
                >
                  Query Hub FAQ
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactSupport;
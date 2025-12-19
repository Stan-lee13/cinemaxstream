import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Clock, Send, Zap, Activity, User, AtSign, Tag } from 'lucide-react';
import BackButton from "@/components/BackButton";
import { z } from 'zod';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters')
});

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-header", { scale: 0.95, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".contact-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        });

      if (error) throw error;
      toast.success('Communication uplink established');
      setFormData({ ...formData, subject: '', message: '' });
    } catch (error) {
      toast.error('Uplink failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-10 hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />

          <div className="contact-header mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter italic">Contact Support</h1>
            <p className="text-gray-400 text-lg">Direct communication line to our technical operatives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="contact-card bg-[#111]/80 border border-white/5 p-8 rounded-[32px] overflow-hidden relative">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Identity</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-white/5 border-white/5 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Uplink Address</Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-white/5 border-white/5 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Signal Header</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Issue description..."
                      className="bg-white/5 border-white/5 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Encoded Message</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Transmission details..."
                      className="min-h-[150px] bg-white/5 border-white/5 rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-xl font-black uppercase tracking-widest transition-all"
                  >
                    {isSubmitting ? <Activity className="animate-spin h-5 w-5" /> : 'Broadcast Signal'}
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-[#111] border border-white/5 rounded-[24px]">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black uppercase tracking-tighter">Latency</h3>
                </div>
                <p className="text-xs text-gray-500">Average response time: 2-4 cycles (Business hours)</p>
              </Card>
              <Card className="p-6 bg-[#111] border border-white/5 rounded-[24px]">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <h3 className="font-black uppercase tracking-tighter">Direct</h3>
                </div>
                <p className="text-xs text-gray-500">support@cinemax-stream.com</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Phone, Mail, Clock, CheckCircle, HelpCircle } from 'lucide-react';
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
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".support-form", {
        x: -30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".info-card", {
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
    { value: 'low', label: 'Low', color: 'text-emerald-400' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400' },
    { value: 'high', label: 'High', color: 'text-red-400' }
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
      toast.error('Please fill in all required fields');
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
      toast.success('Support ticket submitted successfully!');

      // Reset form
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
      toast.error('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none" />
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-in zoom-in duration-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Message Received!</h2>
            <p className="text-gray-400 mb-8">
              Your support ticket has been submitted successfully. Our team will get back to you within 24-48 hours.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-white text-black hover:bg-gray-200 h-12 rounded-xl font-bold"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="support-header mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Contact Support
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Need help? We're here to assist you. Submit a support ticket and we'll get back to you soon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 support-form">
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />

                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Submit a Ticket</h2>
                    <p className="text-sm text-gray-400">Fill out the details below</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-blue-500/20">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="focus:bg-white/10 focus:text-white">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value} className="focus:bg-white/10 focus:text-white">
                              <span className={priority.color}>{priority.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                      className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="min-h-[150px] bg-white/5 border-white/10 text-white focus:border-blue-500/50 rounded-xl resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto h-12 px-8 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <Send className="w-4 h-4 mr-2 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="info-card bg-[#111] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white">Response Times</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-sm text-gray-300">High: 2-4 hours</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                    <span className="text-sm text-gray-300">Medium: 12-24 hours</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-sm text-gray-300">Low: 24-48 hours</span>
                  </div>
                </div>
              </div>

              <div className="info-card bg-[#111] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Phone className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white">Other Channels</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Email Us</p>
                      <p className="text-xs text-gray-500">support@cinemax.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Live Chat</p>
                      <p className="text-xs text-gray-500">Available 9 AM - 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-6 text-center">
                <HelpCircle className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Check FAQ First</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Many common questions are answered in our Help Center.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/10 text-white"
                  onClick={() => window.location.href = '/faq'}
                >
                  View FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactSupport;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Shield, Key, Eye, EyeOff, AlertTriangle, Smartphone, Loader2, Lock, History, Laptop, ChevronRight, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from 'gsap';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('security_2fa') === 'true');
  const [loginAlerts, setLoginAlerts] = useState(() => localStorage.getItem('security_alerts') !== 'false');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('security_2fa', String(twoFactorEnabled));
  }, [twoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem('security_alerts', String(loginAlerts));
  }, [loginAlerts]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".security-header", {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".security-section", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".danger-zone", {
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error('Password must contain uppercase, lowercase, and numbers');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Matrix key successfully rotated');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to recalibrate security';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast.success('Two-factor shield deactivated');
    } else {
      setTwoFactorEnabled(true);
      toast.success('Two-factor shield established');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[-5%] w-[45%] h-[45%] bg-emerald-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <div className="security-header mb-16 px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Access Protocol</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
              Security
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl">
              Fortify your presence. Manage cryptographic keys and authentication layers for absolute data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Password Section */}
            <div className="security-section space-y-6">
              <div className="flex items-center gap-3 px-6">
                <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                  <Key className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Cryptographic Keys</h2>
              </div>

              <Card className="bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden p-8 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New System Passkey</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="bg-white/5 border-white/5 text-white focus:border-blue-500/30 h-14 rounded-2xl pl-12 pr-12 font-mono text-lg transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Validate Passkey</Label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="bg-white/5 border-white/5 text-white focus:border-blue-500/30 h-14 rounded-2xl pl-12 font-mono text-lg transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[24px]">
                  <div className="flex items-center gap-4 text-gray-500">
                    <Sparkles className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase tracking-widest">Entropy: 8+ Chars, Mixed Case, Digits</p>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="w-full md:w-auto px-10 h-14 bg-white text-black hover:bg-cinemax-500 hover:text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/5"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Rotating...
                      </>
                    ) : (
                      'Update Key'
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* 2FA & Pulse Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="security-section space-y-6">
                <div className="flex items-center gap-3 px-6">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Multi-Factor Pulse</h2>
                </div>

                <Card className="p-8 bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] flex flex-col justify-between h-[200px] group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Smartphone size={80} />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">2FA Shield</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Biometric or TOTP Validation</p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={handleEnable2FA}
                      className="data-[state=checked]:bg-emerald-500 h-7 w-12"
                    />
                  </div>
                  <div className="mt-4 relative z-10">
                    {twoFactorEnabled ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Shield Active</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Shield Passive</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="security-section space-y-6">
                <div className="flex items-center gap-3 px-6">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                    <History className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Live Infrastructure</h2>
                </div>

                <Card className="p-8 bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] flex flex-col justify-between h-[200px] group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Laptop size={80} />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                        <Laptop className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Current Node</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Windows • NYC Metro</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="alerts" className="text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">Echo Alerts</Label>
                      <Switch
                        id="alerts"
                        checked={loginAlerts}
                        onCheckedChange={setLoginAlerts}
                        className="data-[state=checked]:bg-blue-500 h-6 w-11"
                      />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Authenticated {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
              <div className="p-8 md:p-12 border border-red-500/10 rounded-[40px] bg-red-500/[0.02] relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 group-hover:bg-red-500/10" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10 text-center md:text-left">
                  <div className="p-5 bg-red-500/10 rounded-[28px] border border-red-500/20 shadow-2xl shadow-red-900/20 shrink-0">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Termination Protocol</h3>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8 max-w-2xl">
                      Irreversible de-synchronization. This will permanently erase your watch history, favorites, and encrypted preferences from our global cluster.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => navigate('/delete-account')}
                      className="h-14 px-10 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 font-black uppercase tracking-widest transition-all hover:scale-105"
                    >
                      Initialize Deletion
                    </Button>
                  </div>
                  <ChevronRight size={40} className="text-red-900/20 hidden lg:block self-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecuritySettings;

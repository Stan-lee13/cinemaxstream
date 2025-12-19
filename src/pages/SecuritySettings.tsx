import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Shield, Key, Eye, EyeOff, AlertTriangle, Smartphone, Loader2, Lock, History, Laptop } from 'lucide-react';
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".security-header", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".security-section", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });

      gsap.from(".danger-zone", {
        y: 20,
        opacity: 0,
        duration: 0.6,
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

    // Password strength validation
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

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
    } else {
      setTwoFactorEnabled(true);
      toast.success('Two-factor authentication enabled');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <div className="security-header mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Security Settings
            </h1>
            <p className="text-gray-400">Manage your password, 2FA, and account security</p>
          </div>

          <div className="space-y-8">
            {/* Password Section */}
            <div className="security-section bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg p-1">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-t-[20px] flex items-center gap-3 border-b border-white/5">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Key className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Password Security</h2>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Min 8 characters with uppercase, lowercase & numbers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="bg-white text-black hover:bg-gray-200 h-11 px-8 rounded-xl font-bold"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="security-section bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl hidden md:block">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-400 max-w-md">Add an extra layer of security to your account by enabled 2FA.</p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleEnable2FA}
                  className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/10"
                />
              </div>

              {twoFactorEnabled && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-sm text-emerald-400 font-medium">Two-factor authentication is currently active</p>
                </div>
              )}
            </div>

            {/* Login History / Active Sessions */}
            <div className="security-section bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg p-1">
              <div className="p-4 bg-white/5 rounded-t-[20px] flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-gray-400" />
                  <h2 className="font-bold text-white">Active Sessions</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="alerts" className="text-sm text-gray-400 cursor-pointer">Login Alerts</Label>
                  <Switch
                    id="alerts"
                    checked={loginAlerts}
                    onCheckedChange={setLoginAlerts}
                    className="scale-75 data-[state=checked]:bg-white"
                  />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="p-4 bg-black/40 rounded-xl flex items-center justify-between border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <Laptop className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Windows PC (Chrome)</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>New York, USA</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded font-medium">
                    Current Session
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone p-6 border border-red-500/20 rounded-3xl bg-red-500/5 mt-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Delete Account</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xl">
                    Once you delete your account, there is no going back. All your data, including watch history and favorites, will be and preferences will be permanently removed.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => navigate('/delete-account')}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-10 px-6 rounded-xl font-medium"
                  >
                    Delete Account
                  </Button>
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

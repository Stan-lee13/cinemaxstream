import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from '@/contexts/authHooks';
import { useUserProfile } from '@/hooks/useUserProfile';
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { User, Mail, Calendar, Upload, Camera, Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EditProfile = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfile } = useUserProfile();
  const [username, setUsername] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || '');
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const result = await updateProfile({ avatar: file });
      if (result?.avatar_url) {
        setAvatarPreview(result.avatar_url);
        toast.success('Profile photo updated successfully');
      }
    } catch (error) {
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ username });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cinemax-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <BackButton className="hover:bg-white/10 text-gray-400 hover:text-white border-white/10" />
          </div>

          <motion.div
            className="profile-header mb-8"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Edit Profile
            </h1>
            <p className="text-gray-400">Manage your personal information and public profile</p>
          </motion.div>

          <motion.div
            className="profile-card bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Banner/Header of Card */}
            <div className="h-32 bg-gradient-to-r from-cinemax-900/40 to-purple-900/40 relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
            </div>

            <div className="px-8 pb-8 -mt-16">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full p-1 bg-[#111] ring-4 ring-[#1a1a1a]">
                      <Avatar className="w-full h-full border-4 border-[#111]">
                        <AvatarImage src={avatarPreview || profileData?.avatar_url || ''} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-cinemax-500 to-purple-600 text-3xl font-bold text-white">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <button
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-2.5 bg-blue-500 rounded-full text-white shadow-lg hover:bg-blue-600 transition-colors border-4 border-[#111] group-hover:scale-110 duration-200"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Max size 5MB</p>
                </div>

                {/* Form Section */}
                <div className="flex-1 w-full space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300 ml-1">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your username"
                          className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="pl-10 bg-white/5 border-white/5 text-gray-400 h-11 rounded-xl cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300 ml-1">Member Since</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          value={profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                          disabled
                          className="pl-10 bg-white/5 border-white/5 text-gray-400 h-11 rounded-xl cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 ml-1">Plan Status</Label>
                      <div className="h-11 px-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-400 capitalize">{profileData?.subscription_tier || 'Free'} Plan</span>
                        </div>
                        {profileData?.subscription_tier === 'free' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                            onClick={() => navigate('/manage-billing')}
                          >
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                    <Button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-white text-black hover:bg-gray-200 h-11 rounded-xl font-bold"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.history.back()}
                      className="border-white/10 text-white hover:bg-white/10 h-11 rounded-xl px-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;

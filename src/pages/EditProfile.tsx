import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from '@/contexts/authHooks';
import { useUserProfile } from '@/hooks/useUserProfile';
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { User, Mail, Calendar, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfile } = useUserProfile();
  const [username, setUsername] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || '');
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
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
    try {
      await updateProfile({ username });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
          
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col items-center mb-8">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={avatarPreview || profileData?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-xl">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="mt-2 opacity-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input
                  value={profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                  disabled
                  className="mt-2 opacity-50"
                />
              </div>

              <div>
                <Label>Subscription Status</Label>
                <div className="mt-2 p-3 bg-secondary/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {profileData?.subscription_tier || 'Free'} Plan
                    </span>
                    {profileData?.subscription_tier === 'free' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/manage-billing')}
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSaveProfile} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthState';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profileData, isLoading, updateProfile } = useUserProfile();
  const [username, setUsername] = useState('');
  const [hideActivity, setHideActivity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || '');
      setHideActivity(profileData.hide_activity || false);
    }
  }, [profileData]);

  const handleSaveProfile = async () => {
    await updateProfile({
      username,
      hide_activity: hideActivity
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-gray-700 mb-4"></div>
            <div className="h-8 w-48 bg-gray-700 mb-4 rounded"></div>
            <div className="h-4 w-64 bg-gray-700 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 rounded-xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData?.avatar_url || ''} />
                  <AvatarFallback className="bg-cinemax-500 text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4">
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-cinemax-500" onClick={handleSaveProfile}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div>
                  <h1 className="text-2xl font-bold">Profile Settings</h1>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    {isEditing ? (
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-background"
                      />
                    ) : (
                      <p className="text-gray-300">{profileData?.username || user?.email?.split('@')[0] || 'User'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <p className="text-gray-300">{user?.email}</p>
                  </div>

                  <div>
                    <Label htmlFor="subscription">Subscription</Label>
                    <p className="text-gray-300 capitalize">{profileData?.subscription_tier || 'Free'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="privacy">Hide Viewing Activity</Label>
                      <p className="text-sm text-gray-400">
                        When enabled, your viewing history will be hidden from recommendations
                      </p>
                    </div>
                    <Switch
                      id="privacy"
                      checked={hideActivity}
                      onCheckedChange={setHideActivity}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await signOut();
                    }}
                  >
                    Sign Out
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

export default UserProfile;

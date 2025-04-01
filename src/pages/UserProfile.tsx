
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Shield, Eye, EyeOff, Clock, Film, Tv } from "lucide-react";

interface UserProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  subscription_tier: string;
  hide_activity: boolean;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [username, setUsername] = useState("");
  const [hideActivity, setHideActivity] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      // Check if profile exists
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setUsername(data.username || "");
        setHideActivity(data.hide_activity || false);
        setAvatarUrl(data.avatar_url || "");
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          username: user?.email?.split('@')[0] || null,
          avatar_url: null,
          subscription_tier: 'free',
          hide_activity: false
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertError) throw insertError;

        setProfile(newData);
        setUsername(newData.username || "");
        setHideActivity(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      if (!user) return;

      const updates = {
        username,
        hide_activity: hideActivity,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload the file to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update the user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      toast.success("Avatar uploaded successfully");
      fetchProfile();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
            <p className="text-gray-400 mb-8">You need to be signed in to view this page.</p>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-800 rounded-lg"></div>
              <div className="h-20 bg-gray-800 rounded-lg"></div>
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-card border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-cinemax-500">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={username || user.email || "User"} />
                        ) : (
                          <AvatarFallback className="bg-cinemax-500/20 text-cinemax-500">
                            {username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-cinemax-500 hover:bg-cinemax-600 rounded-full p-1 cursor-pointer"
                      >
                        <Settings className="h-4 w-4" />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={uploadAvatar}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    
                    <h3 className="mt-4 text-xl font-semibold">{username || user.email?.split('@')[0]}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-300 py-2 border-b border-gray-800">
                      <User className="h-5 w-5 text-cinemax-500" />
                      <span>Account Settings</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 py-2 border-b border-gray-800">
                      <Shield className="h-5 w-5 text-cinemax-500" />
                      <span>Privacy & Security</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 py-2 border-b border-gray-800">
                      <Clock className="h-5 w-5 text-cinemax-500" />
                      <span>Watch History</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 py-2">
                      <Film className="h-5 w-5 text-cinemax-500" />
                      <span>My List</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Subscription</span>
                      <span className="text-xs bg-cinemax-500/20 text-cinemax-400 px-2 py-1 rounded capitalize">
                        {profile?.subscription_tier || "Free"}
                      </span>
                    </div>
                    <Button className="w-full" variant="outline">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="bg-card border border-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          placeholder="Username"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          value={user.email || ""} 
                          disabled 
                          className="mt-1 bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mt-8 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {hideActivity ? (
                            <EyeOff className="h-4 w-4 text-cinemax-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-cinemax-500" />
                          )}
                          <Label htmlFor="hide-activity" className="text-base font-medium">
                            Hide Viewing Activity
                          </Label>
                        </div>
                        <p className="text-sm text-gray-400">
                          When enabled, your viewing history will be private
                        </p>
                      </div>
                      <Switch 
                        id="hide-activity" 
                        checked={hideActivity} 
                        onCheckedChange={setHideActivity}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications" className="text-base font-medium flex items-center gap-2">
                          <Tv className="h-4 w-4 text-cinemax-500" />
                          <span>Email Notifications</span>
                        </Label>
                        <p className="text-sm text-gray-400">
                          Receive emails about new releases and recommendations
                        </p>
                      </div>
                      <Switch id="notifications" defaultChecked />
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end">
                    <Button 
                      onClick={updateProfile} 
                      className="bg-cinemax-500 hover:bg-cinemax-600"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;

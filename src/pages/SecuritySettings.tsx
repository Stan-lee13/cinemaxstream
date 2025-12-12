import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import BackButton from "@/components/BackButton";
import { toast } from 'sonner';
import { Shield, Key, Eye, EyeOff, AlertTriangle, Smartphone, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      setCurrentPassword('');
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

  const handleDeleteAccount = () => {
    navigate('/delete-account');
  };

  const securitySections = [
    {
      title: 'Password Security',
      icon: <Key className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-2">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-2"
              />
            </div>
          </div>

          <Button 
            onClick={handlePasswordChange} 
            className="w-full md:w-auto"
            disabled={isChangingPassword}
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
      )
    },
    {
      title: 'Two-Factor Authentication',
      icon: <Smartphone className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleEnable2FA}
            />
          </div>
          
          {twoFactorEnabled && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600">
                Two-factor authentication is enabled for your account
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Login Security',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login Alerts</p>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for new login attempts
              </p>
            </div>
            <Switch
              checked={loginAlerts}
              onCheckedChange={setLoginAlerts}
            />
          </div>

          <div>
            <p className="font-medium mb-2">Active Sessions</p>
            <div className="space-y-2">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()} • This device
                    </p>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your account security and privacy</p>

          <div className="space-y-6">
            {securitySections.map((section, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                {section.content}
              </Card>
            ))}
          </div>

          {/* Account Deletion Warning */}
          <Card className="p-6 bg-red-500/5 border-red-500/20 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

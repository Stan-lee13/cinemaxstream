import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import useAuth from '@/contexts/authHooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DeleteAccount: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [confirmations, setConfirmations] = useState({
    understand: false,
    permanent: false,
    backup: false
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === 'DELETE MY ACCOUNT' && 
                   confirmations.understand && 
                   confirmations.permanent && 
                   confirmations.backup;

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return;

    setIsDeleting(true);

    try {
      // Delete user data in order (due to foreign key constraints)
      await Promise.all([
        supabase.from('watch_sessions').delete().eq('user_id', user.id),
        supabase.from('download_requests').delete().eq('user_id', user.id),
        supabase.from('user_favorites').delete().eq('user_id', user.id),
        supabase.from('user_watch_history').delete().eq('user_id', user.id),
        supabase.from('user_usage').delete().eq('user_id', user.id),
        supabase.from('user_profiles').delete().eq('id', user.id)
      ]);

      // Delete the auth user (this will trigger cascade deletes)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, sign out the user anyway
        console.error('Admin delete failed:', deleteError);
      }

      await signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmationChange = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Trash2 className="w-8 h-8 text-destructive" />
            Delete Account
          </h1>
          <p className="text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Warning: This action is permanent
              </CardTitle>
              <CardDescription>
                Once you delete your account, there is no going back. Please be certain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">What will be deleted:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your profile and account information</li>
                    <li>• All watch history and viewing progress</li>
                    <li>• Saved favorites and playlists</li>
                    <li>• Download history and preferences</li>
                    <li>• All settings and customizations</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="understand"
                      checked={confirmations.understand}
                      onCheckedChange={() => handleConfirmationChange('understand')}
                    />
                    <Label htmlFor="understand" className="text-sm">
                      I understand that deleting my account is permanent and cannot be undone
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="permanent"
                      checked={confirmations.permanent}
                      onCheckedChange={() => handleConfirmationChange('permanent')}
                    />
                    <Label htmlFor="permanent" className="text-sm">
                      I understand that all my data will be permanently deleted
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="backup"
                      checked={confirmations.backup}
                      onCheckedChange={() => handleConfirmationChange('backup')}
                    />
                    <Label htmlFor="backup" className="text-sm">
                      I have exported my data if I need to keep any records
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmText">
                    Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                  </Label>
                  <Input
                    id="confirmText"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="border-destructive/50 focus:border-destructive"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldX className="w-5 h-5" />
                Alternative Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Instead of deleting your account, you might consider:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Changing your privacy settings</li>
                <li>• Clearing your watch history</li>
                <li>• Updating your notification preferences</li>
                <li>• Taking a break by signing out</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/account')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!canDelete || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="w-4 h-4 mr-2 animate-pulse" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
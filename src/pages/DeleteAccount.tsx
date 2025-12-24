import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldX, ArrowLeft, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import useAuth from '@/contexts/authHooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const DeleteAccount: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [confirmations, setConfirmations] = useState({
    understand: false,
    permanent: false,
    backup: false
  });
  const [isDeleting, setIsDeleting] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const canDelete = confirmText === 'DELETE MY ACCOUNT' &&
    confirmations.understand &&
    confirmations.permanent &&
    confirmations.backup;

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return;

    setIsDeleting(true);

    try {
      // Delete user data in order (due to foreign key constraints)
      const tables = ['watch_sessions', 'download_requests', 'user_favorites', 'user_watch_history', 'user_usage'];

      for (const table of tables) {
        await supabase.from(table as 'watch_sessions' | 'download_requests' | 'user_favorites' | 'user_watch_history' | 'user_usage').delete().eq('user_id', user.id);
      }

      // Deactivate profile (soft delete fallback)
      await supabase.from('user_profiles').update({
        username: '[DELETED_USER]',
        subscription_tier: 'free',
        avatar_url: null
      }).eq('id', user.id);

      toast.success('Account deactivated and data purged');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Automated purge failed. Please contact terminal support for manual override.');
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-orange-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Security
          </Button>

          <motion.div
            className="delete-header mb-8 text-center"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 border border-red-500/20 shadow-lg shadow-red-900/20">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Delete Account</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Permanently remove your account and all associated data from CinemaxStream.
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              className="warning-card bg-[#111] border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/10"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="p-6 bg-gradient-to-b from-red-500/10 to-transparent border-b border-red-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h2 className="text-lg font-bold text-white">Warning: This action is permanent</h2>
                </div>
                <p className="text-red-200/80 text-sm">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                  <h4 className="font-bold text-red-500 mb-3 text-sm uppercase tracking-wide">What will be lost:</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Your profile and account information</li>
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> All watch history and viewing progress</li>
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Saved favorites and playlists</li>
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Download history and preferences</li>
                    <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> All settings and customizations</li>
                  </ul>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="confirmation-step flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleConfirmationChange('understand')}>
                    <Checkbox
                      id="understand"
                      checked={confirmations.understand}
                      onCheckedChange={() => handleConfirmationChange('understand')}
                      className="mt-1 border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <Label htmlFor="understand" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
                      I understand that deleting my account is <span className="text-white font-bold">permanent</span> and cannot be undone.
                    </Label>
                  </div>

                  <div className="confirmation-step flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleConfirmationChange('permanent')}>
                    <Checkbox
                      id="permanent"
                      checked={confirmations.permanent}
                      onCheckedChange={() => handleConfirmationChange('permanent')}
                      className="mt-1 border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <Label htmlFor="permanent" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
                      I understand that all my data will be <span className="text-white font-bold">permanently deleted</span> from the servers.
                    </Label>
                  </div>

                  <div className="confirmation-step flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleConfirmationChange('backup')}>
                    <Checkbox
                      id="backup"
                      checked={confirmations.backup}
                      onCheckedChange={() => handleConfirmationChange('backup')}
                      className="mt-1 border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <Label htmlFor="backup" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
                      I confirm I have exported my data if I need to keep any records, or I don't need it.
                    </Label>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label htmlFor="confirmText" className="text-gray-400">
                    Type <strong className="text-white">DELETE MY ACCOUNT</strong> to confirm:
                  </Label>
                  <Input
                    id="confirmText"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-12 rounded-xl font-mono text-center tracking-wider uppercase"
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col-reverse sm:flex-row gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/account')}
                  className="flex-1 h-12 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!canDelete || isDeleting}
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 animate-bounce" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            <div className="flex items-center gap-4 bg-[#111] border border-white/5 rounded-2xl p-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShieldX className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">Consider alternatives?</h3>
                <p className="text-xs text-gray-500">You can temporarily sign out or export your data instead.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white/10 hover:bg-white/10 text-white text-xs h-8"
                onClick={() => navigate('/export-data')}
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeleteAccount;

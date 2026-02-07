import React, { useState, memo, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, CheckCircle, Wifi, X, Sparkles, Crown, Lock } from 'lucide-react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  contentId?: string;
}

interface DownloadResult {
  success: boolean;
  downloadLink?: string;
  error?: string;
}

/**
 * Download Modal — uses dl.vidsrc.vip directly and tracks every download in DB.
 * Free users are blocked. Pro/Premium users get direct download + DB record.
 */
const DownloadModal: React.FC<DownloadModalProps> = memo(({
  isOpen,
  onClose,
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  year,
  contentId
}) => {
  const { user } = useAuth();
  const { deductDownloadCredit } = useCreditSystem();
  const { tier, isPro, isPremium } = useUserTier(user?.id);
  const navigate = useNavigate();
  
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canDownload = isPro || isPremium;

  const getDownloadUrl = useCallback(() => {
    if (!contentId) return null;
    if (contentType === 'movie') {
      return `https://dl.vidsrc.vip/movie/${contentId}`;
    }
    if (contentType === 'tv' || contentType === 'series' || contentType === 'anime') {
      const season = seasonNumber ?? 1;
      const episode = episodeNumber ?? 1;
      return `https://dl.vidsrc.vip/tv/${contentId}/${season}/${episode}`;
    }
    return null;
  }, [contentId, contentType, seasonNumber, episodeNumber]);

  const handleDownload = useCallback(async () => {
    if (!canDownload || !contentId || !user) return;

    setIsProcessing(true);
    const downloadUrl = getDownloadUrl();

    if (!downloadUrl) {
      setDownloadResult({ success: false, error: 'Could not generate download URL' });
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Record download in database FIRST
      const { error: dbError } = await supabase
        .from('download_requests')
        .insert({
          user_id: user.id,
          content_title: contentTitle,
          content_type: contentType,
          season_number: seasonNumber ?? null,
          episode_number: episodeNumber ?? null,
          year: year ?? null,
          download_url: downloadUrl,
          quality: 'HD',
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Download tracking error:', dbError);
        // Still allow download even if tracking fails
      } else {
        console.log('Download tracked successfully for user:', user.id);
      }

      // 2. Deduct credit
      await deductDownloadCredit();

      // 3. Open download in new tab
      window.open(downloadUrl, '_blank');

      setDownloadResult({ success: true, downloadLink: downloadUrl });
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadResult({ success: false, error: 'Download failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  }, [canDownload, contentId, user, getDownloadUrl, contentTitle, contentType, seasonNumber, episodeNumber, year, deductDownloadCredit]);

  const resetModal = useCallback(() => {
    setDownloadResult(null);
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const handleUpgrade = useCallback(() => {
    resetModal();
    navigate('/upgrade');
  }, [resetModal, navigate]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-50%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[80px]" />
          </div>

          <button
            onClick={resetModal}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Download Content</h2>
                <p className="text-xs text-gray-400">Save for offline viewing</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-1 line-clamp-1">{contentTitle}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {year && <span className="bg-white/10 px-1.5 py-0.5 rounded">{year}</span>}
                {seasonNumber && episodeNumber && <span>S{seasonNumber} E{episodeNumber}</span>}
                <span className="capitalize">{contentType}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!canDownload ? (
                  <motion.div
                    key="upgrade"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <h3 className="font-bold text-white text-lg">Pro Feature</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                      Downloads are exclusively available for Pro and Premium members.
                    </p>
                    <Button
                      onClick={handleUpgrade}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold shadow-lg shadow-amber-500/20"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center py-4"
                  >
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Download className="h-8 w-8 text-blue-400 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Starting Download...</h3>
                      <p className="text-xs text-gray-500">Recording to your library</p>
                    </div>
                  </motion.div>
                ) : downloadResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {downloadResult.success ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-7 w-7 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">Download Started</h3>
                        <p className="text-sm text-gray-400 mb-4">Check your Downloads page for history</p>
                        <Button
                          variant="outline"
                          onClick={() => { resetModal(); navigate('/downloads'); }}
                          className="border-white/10 hover:bg-white/5 text-white"
                        >
                          View Downloads
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="h-7 w-7 text-red-500" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">Download Failed</h3>
                        <p className="text-sm text-gray-400 mb-4">{downloadResult.error}</p>
                        <Button variant="outline" onClick={() => setDownloadResult(null)} className="border-white/10 hover:bg-white/5 text-white">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="action"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-2">
                      <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center gap-2">
                        <Wifi className="h-4 w-4 text-blue-400" />
                        <span>High Speed</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Tracked</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDownload}
                      disabled={!contentId}
                      className="w-full h-14 text-lg bg-white text-black hover:bg-gray-200 font-bold shadow-lg shadow-white/10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles size={20} className="mr-2 text-amber-500" />
                      Download HD
                    </Button>

                    <p className="text-center text-xs text-gray-500">
                      {isPremium ? 'Premium: Unlimited HD downloads' : 'Pro: Downloads tracked in your library'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

DownloadModal.displayName = 'DownloadModal';

export default DownloadModal;
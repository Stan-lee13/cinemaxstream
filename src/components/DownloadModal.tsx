import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, ExternalLink, AlertCircle, CheckCircle, Loader2, Play, FileVideo, HardDrive, Wifi, X, Sparkles } from 'lucide-react';
import { useSmartDownload, DownloadResult } from '@/hooks/useSmartDownload';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  contentId?: string;
  fallbackUrl?: string;
  onLegacyDownload?: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  year,
  contentId,
  fallbackUrl,
  onLegacyDownload
}) => {
  const { initiateDownload, isProcessing } = useSmartDownload();
  const { userProfile, canDownload, getDownloadsRemaining } = useCreditSystem();
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'initial' | 'searching' | 'scraping' | 'complete'>('initial');

  const handleDownload = async () => {
    if (!canDownload()) return;

    if (fallbackUrl && onLegacyDownload) {
      onLegacyDownload();
      return;
    }

    setCurrentStep('searching');
    const result = await initiateDownload(contentTitle, contentType, seasonNumber, episodeNumber, year, contentId);

    setCurrentStep('complete');
    setDownloadResult(result);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'initial': return 0;
      case 'searching': return 45;
      case 'scraping': return 80;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const resetModal = () => {
    setCurrentStep('initial');
    setDownloadResult(null);
    onClose();
  };

  if (!userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl min-h-[400px]">
          {/* Ambient Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-50%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[80px]" />
          </div>

          <button
            onClick={resetModal}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>

          <div className="relative z-10 p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Download Content</h2>
                <p className="text-xs text-gray-400">Save for offline viewing</p>
              </div>
            </div>

            {/* Content Info Card */}
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
                {/* STATE 1: BLOCKED / UPGRADE NEEDED */}
                {userProfile.role === 'free' ? (
                  <motion.div
                    key="upgrade"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Pro Feature</h3>
                    <p className="text-sm text-gray-400 mb-4">Downloads are exclusively available for Pro members.</p>
                    <Button
                      onClick={() => window.location.href = '/upgrade'}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold"
                    >
                      Upgrade Plan
                    </Button>
                  </motion.div>
                ) : !canDownload() ? (
                  <motion.div
                    key="limit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center p-4 border border-red-500/20 bg-red-500/5 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Daily Limit Reached</h3>
                    <p className="text-sm text-gray-400">You've reached your download limit for today.</p>
                  </motion.div>
                ) : isProcessing ? (
                  /* STATE 2: PROCESSING */
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
                        <span className="text-xl font-bold text-blue-400">{getStepProgress()}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">
                        {currentStep === 'searching' ? 'Searching Servers...' : 'Generating Secure Link...'}
                      </h3>
                      <p className="text-xs text-gray-500">Please wait while we prepare your file</p>
                    </div>
                  </motion.div>
                ) : downloadResult ? (
                  /* STATE 3: RESULT */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {downloadResult.success ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Ready to Download</h3>
                        <div className="flex justify-center gap-4 text-xs text-emerald-400/80 mb-6">
                          {downloadResult.quality && <span className="flex items-center gap-1"><FileVideo size={12} /> {downloadResult.quality}</span>}
                          {downloadResult.fileSize && <span className="flex items-center gap-1"><HardDrive size={12} /> {downloadResult.fileSize}</span>}
                        </div>

                        {downloadResult.downloadLink && downloadResult.downloadLink !== downloadResult.nkiriUrl ? (
                          <Button
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-900/20 font-bold"
                            onClick={() => downloadResult.downloadLink && window.open(downloadResult.downloadLink, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Now
                          </Button>
                        ) : (
                          <Button
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold"
                            onClick={() => downloadResult.nkiriUrl && window.open(downloadResult.nkiriUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open External Link
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                          <Wifi className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="font-bold text-white mb-2">Download Unavailable</h3>
                        <p className="text-sm text-gray-400 mb-4">{downloadResult.error || 'Connection timed out'}</p>
                        <Button variant="outline" onClick={resetModal} className="border-white/10 hover:bg-white/5 text-white">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* STATE 0: INITIAL ACTION */
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
                        <span>Secure</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDownload}
                      disabled={!canDownload()}
                      className="w-full h-14 text-lg bg-white text-black hover:bg-gray-200 font-bold shadow-lg shadow-white/10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {fallbackUrl ? (
                        <span className="flex items-center gap-2"><Download size={20} /> Direct Download</span>
                      ) : (
                        <span className="flex items-center gap-2"><Sparkles size={20} className="text-amber-500" /> Smart Download</span>
                      )}
                    </Button>

                    <p className="text-center text-xs text-gray-500">
                      {userProfile.role === 'premium' || userProfile.role === 'pro'
                        ? 'Unlimited high-speed downloads active'
                        : `${getDownloadsRemaining()} remaining downloads today`
                      }
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
};

export default DownloadModal;

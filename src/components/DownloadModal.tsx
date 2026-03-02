import React, { useState, memo, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, CheckCircle, X, Sparkles, Crown, Lock, FileVideo, Upload, Trash2, Play } from 'lucide-react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEventNotifications } from '@/hooks/useEventNotifications';

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

const MIN_FILE_SIZE_MB = 50;

/**
 * Download Modal — Mode A: External Download + File Confirmation
 * 1. Opens download link in new tab
 * 2. User confirms by attaching the downloaded file
 * 3. File validated (size > 50MB, name fuzzy-matches title)
 * 4. Stored in IndexedDB for offline playback
 * 5. Credits deducted only after confirmation
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
  const { notifyDownloadComplete } = useEventNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  type ModalStep = 'action' | 'awaiting_file' | 'validating' | 'confirmed' | 'error';
  const [step, setStep] = useState<ModalStep>('action');
  const [errorMessage, setErrorMessage] = useState('');
  const [dbRowId, setDbRowId] = useState<string | null>(null);
  const [confirmedFileName, setConfirmedFileName] = useState('');
  const [confirmedFileSize, setConfirmedFileSize] = useState('');

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

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  };

  // Step 1: Open external download link + record as "awaiting_file_confirmation"
  const handleStartDownload = useCallback(async () => {
    if (!canDownload || !contentId || !user) return;

    const downloadUrl = getDownloadUrl();
    if (!downloadUrl) {
      setErrorMessage('Could not generate download URL');
      setStep('error');
      return;
    }

    try {
      // Record in DB as awaiting confirmation
      const { data: insertedRow, error: dbError } = await supabase
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
          status: 'pending',
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Download tracking error:', dbError);
        setErrorMessage('Failed to record download. Please try again.');
        setStep('error');
        return;
      }

      setDbRowId(insertedRow?.id || null);

      // Open in new tab
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setStep('awaiting_file');
      toast.success('Download opened in new tab');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed. Please try again.';
      setErrorMessage(message);
      setStep('error');
    }
  }, [canDownload, contentId, user, getDownloadUrl, contentTitle, contentType, seasonNumber, episodeNumber, year]);

  // Step 2: User attaches downloaded file for validation
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('validating');

    // Validate file size (must be > 50MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB < MIN_FILE_SIZE_MB) {
      setErrorMessage(`File too small (${fileSizeMB.toFixed(1)} MB). Video files should be larger than ${MIN_FILE_SIZE_MB} MB.`);
      setStep('error');
      return;
    }

    // Fuzzy name match: check if file name contains any word from content title (3+ chars)
    const titleWords = contentTitle.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    const fileNameLower = file.name.toLowerCase();
    const nameMatches = titleWords.length === 0 || titleWords.some(word => fileNameLower.includes(word));

    if (!nameMatches) {
      // Warn but don't block — file might have encoded name
      toast.warning('File name doesn\'t closely match the content title. Proceeding anyway.');
    }

    try {
      // Store in IndexedDB
      const db = await openOfflineDB();
      const tx = db.transaction('offline_media', 'readwrite');
      const store = tx.objectStore('offline_media');

      const record = {
        id: dbRowId || `offline-${Date.now()}`,
        title: contentTitle,
        contentType,
        seasonNumber,
        episodeNumber,
        fileName: file.name,
        fileSize: file.size,
        fileSizeLabel: formatBytes(file.size),
        mimeType: file.type || 'video/mp4',
        blob: file,
        createdAt: new Date().toISOString(),
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      tx.oncomplete = () => db.close();

      // Update DB status to completed
      if (dbRowId && user) {
        await supabase
          .from('download_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_size: formatBytes(file.size),
          })
          .eq('id', dbRowId);
      }

      // Deduct credit only after real file confirmed
      await deductDownloadCredit();

      setConfirmedFileName(file.name);
      setConfirmedFileSize(formatBytes(file.size));
      setStep('confirmed');
      notifyDownloadComplete(contentTitle);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save file offline.';
      setErrorMessage(message);
      setStep('error');
    }
  }, [dbRowId, user, contentTitle, contentType, seasonNumber, episodeNumber, deductDownloadCredit, notifyDownloadComplete]);

  const resetModal = useCallback(() => {
    setStep('action');
    setErrorMessage('');
    setDbRowId(null);
    setConfirmedFileName('');
    setConfirmedFileSize('');
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
                <p className="text-xs text-gray-400">Offline with file confirmation</p>
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

                ) : step === 'action' ? (
                  <motion.div
                    key="action"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 space-y-2">
                      <p><strong className="text-white">How it works:</strong></p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Click download — file opens in a new tab</li>
                        <li>Save the file from your browser</li>
                        <li>Come back and attach the file to confirm</li>
                        <li>File is stored offline for playback anytime</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleStartDownload}
                      disabled={!contentId}
                      className="w-full h-14 text-lg bg-white text-black hover:bg-gray-200 font-bold shadow-lg shadow-white/10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles size={20} className="mr-2 text-amber-500" />
                      Download HD
                    </Button>
                  </motion.div>

                ) : step === 'awaiting_file' ? (
                  <motion.div
                    key="awaiting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                      <FileVideo className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                      <h3 className="font-bold text-white text-lg mb-2">Download Started</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        The file is downloading in your browser. Once complete, attach it below to save for offline playback.
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*,.mkv,.avi,.mp4,.webm,.mov"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Attach Downloaded File
                      </Button>

                      <p className="text-[10px] text-gray-500 mt-3">
                        File must be &gt; {MIN_FILE_SIZE_MB} MB to be accepted as a valid video file.
                      </p>
                    </div>
                  </motion.div>

                ) : step === 'validating' ? (
                  <motion.div
                    key="validating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileVideo className="h-8 w-8 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-white font-medium">Validating & saving file...</p>
                  </motion.div>

                ) : step === 'confirmed' ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1">Saved Offline!</h3>
                      <p className="text-sm text-gray-400 mb-1">{confirmedFileName}</p>
                      <p className="text-xs text-gray-500 mb-4">{confirmedFileSize}</p>
                      <Button
                        variant="outline"
                        onClick={() => { resetModal(); navigate('/downloads'); }}
                        className="border-white/10 hover:bg-white/5 text-white"
                      >
                        View Offline Library
                      </Button>
                    </div>
                  </motion.div>

                ) : step === 'error' ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-7 w-7 text-red-500" />
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">Error</h3>
                      <p className="text-sm text-gray-400 mb-4">{errorMessage}</p>
                      <Button variant="outline" onClick={() => setStep('action')} className="border-white/10 hover:bg-white/5 text-white">
                        Try Again
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// IndexedDB helper
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cinemaxstream_offline', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline_media')) {
        db.createObjectStore('offline_media', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

DownloadModal.displayName = 'DownloadModal';

export default DownloadModal;

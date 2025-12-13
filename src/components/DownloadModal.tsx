import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSmartDownload, DownloadResult } from '@/hooks/useSmartDownload';
import { useCreditSystem } from '@/hooks/useCreditSystem';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  fallbackUrl?: string; // Add fallback URL prop
  onLegacyDownload?: () => void; // Add legacy download callback
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  year,
  fallbackUrl, // Receive fallback URL
  onLegacyDownload // Receive legacy download callback
}) => {
  const { initiateDownload, isProcessing } = useSmartDownload();
  const { userProfile, canDownload, getDownloadsRemaining } = useCreditSystem();
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'initial' | 'searching' | 'scraping' | 'complete'>('initial');

  const handleDownload = async () => {
    if (!canDownload()) {
      return;
    }

    // If we have a fallback URL, use it directly
    if (fallbackUrl && onLegacyDownload) {
      onLegacyDownload();
      return;
    }

    setCurrentStep('searching');
    const result = await initiateDownload(contentTitle, contentType, seasonNumber, episodeNumber, year);
    
    if (result.success) {
      if (result.downloadLink && result.downloadLink !== result.nkiriUrl) {
        setCurrentStep('complete');
      } else {
        setCurrentStep('complete');
      }
    }
    
    setDownloadResult(result);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'initial': return 0;
      case 'searching': return 33;
      case 'scraping': return 66;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case 'searching': return 'AI is searching for content...';
      case 'scraping': return 'Extracting download link...';
      case 'complete': return downloadResult?.success ? 'Ready to download!' : 'Search completed';
      default: return 'Ready to start';
    }
  };

  const resetModal = () => {
    setCurrentStep('initial');
    setDownloadResult(null);
    onClose();
  };

  if (!userProfile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Download className="h-5 w-5" />
            Download Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Info */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-white">{contentTitle}</h3>
            {seasonNumber && episodeNumber && (
              <p className="text-sm text-gray-400">Season {seasonNumber}, Episode {episodeNumber}</p>
            )}
            {year && <p className="text-sm text-gray-400">{year}</p>}
          </div>

          {/* Role Check */}
          {userProfile.role === 'free' ? (
            <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Upgrade Required</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Downloads are available for Pro and Premium users only.
              </p>
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => {
                  window.location.href = '/manage-billing';
                }}
              >
                Upgrade to Pro
              </Button>
            </div>
          ) : !canDownload() ? (
            <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Daily Limit Reached</span>
              </div>
              <p className="text-sm text-gray-300">
                You've reached your daily download limit. Try again tomorrow or upgrade to Premium for unlimited downloads.
              </p>
            </div>
          ) : (
            <>
              {/* Progress Section */}
              {isProcessing && (
                <div className="space-y-3">
                  <Progress value={getStepProgress()} className="h-2" />
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {getStepText()}
                  </div>
                </div>
              )}

              {/* Results Section */}
              {downloadResult && (
                <div className="space-y-4">
                  {downloadResult.success ? (
                    <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 mb-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Download Ready!</span>
                      </div>
                      
                      {downloadResult.quality && (
                        <div className="text-sm text-gray-300 mb-2">
                          Quality: {downloadResult.quality}
                        </div>
                      )}
                      
                      {downloadResult.fileSize && (
                        <div className="text-sm text-gray-300 mb-3">
                          Size: {downloadResult.fileSize}
                        </div>
                      )}

                      <div className="flex gap-2">
                      {downloadResult.downloadLink && downloadResult.downloadLink !== downloadResult.nkiriUrl ? (
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => downloadResult.downloadLink && window.open(downloadResult.downloadLink, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Now
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => downloadResult.nkiriUrl && window.open(downloadResult.nkiriUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open on Nkiri
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">Search Failed</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {downloadResult.error || 'Unable to find download link'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!isProcessing && !downloadResult && (
                <Button 
                  onClick={handleDownload}
                  className="w-full bg-cinemax-500 hover:bg-cinemax-600"
                  disabled={!canDownload()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {fallbackUrl ? 'Direct Download' : 'Start Smart Download'}
                </Button>
              )}
            </>
          )}

          {/* Credits Info */}
          {userProfile.role !== 'free' && (
            <div className="text-xs text-gray-400 text-center">
              {userProfile.role === 'premium' 
                ? 'Unlimited downloads' 
                : `Downloads remaining today: ${getDownloadsRemaining()}`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import UpgradeModal from '@/components/UpgradeModal';

interface DownloadButtonProps {
  contentId: string;
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg' | 'default';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  contentId,
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  year,
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const { user } = useAuth();
  const { tier, isPro, isPremium } = useUserTier(user?.id);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleDownload = () => {
    // Check if user has download permissions
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }

    if (!isPro) {
      // Show upgrade modal for free users
      setShowUpgradeModal(true);
      return;
    }

    let downloadUrl = '';
    
    if (contentType === 'movie') {
      downloadUrl = `https://dl.vidsrc.vip/movie/${contentId}`;
    } else if (contentType === 'tv' || contentType === 'series' || contentType === 'anime') {
      if (seasonNumber !== undefined && episodeNumber !== undefined) {
        downloadUrl = `https://dl.vidsrc.vip/tv/${contentId}/${seasonNumber}/${episodeNumber}`;
      } else {
        downloadUrl = `https://dl.vidsrc.vip/tv/${contentId}/1/1`;
      }
    }
    
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <>
      <Button
        onClick={handleDownload}
        variant={variant}
        size={size}
        className={`${className} ${variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        data-tour-id="download-button"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>

      {/* Upgrade modal for free users trying to download */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="download"
        currentRole={tier}
      />
    </>
  );
};

export default DownloadButton;
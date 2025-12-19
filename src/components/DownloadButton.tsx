import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useNavigate } from 'react-router-dom';
import DownloadModal from './DownloadModal';
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const navigate = useNavigate();

  const handleDownload = () => {
    // Check if user has download permissions
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isPro) {
      // Show upgrade modal for free users
      setShowUpgradeModal(true);
      return;
    }

    // Open smart download modal
    setShowDownloadModal(true);
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

      {/* Smart Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        contentTitle={contentTitle}
        contentType={contentType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        year={year}
        contentId={contentId} // Pass contentId
      />
    </>
  );
};

export default DownloadButton;
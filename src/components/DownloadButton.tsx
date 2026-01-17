import React, { useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Crown } from 'lucide-react';
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

/**
 * Download Button Component
 * 
 * Implements strict download access control:
 * - Not logged in: Redirect to login
 * - Free users: Show upgrade modal (canDownload = false)
 * - Pro/Premium users: Open download modal (canDownload = true)
 */
const DownloadButton: React.FC<DownloadButtonProps> = memo(({
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

  // Strict download access gate
  const canDownload = isPro || isPremium;

  const handleDownload = useCallback(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check download permissions
    if (!canDownload) {
      // Free users see upgrade modal
      setShowUpgradeModal(true);
      return;
    }

    // Pro/Premium users can download
    setShowDownloadModal(true);
  }, [user, canDownload, navigate]);

  return (
    <>
      <Button
        onClick={handleDownload}
        variant={variant}
        size={size}
        className={`${className} ${variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''} ${!canDownload && user ? 'relative' : ''}`}
        data-tour-id="download-button"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
        {!canDownload && user && (
          <Crown className="h-3 w-3 ml-1 text-amber-400" />
        )}
      </Button>

      {/* Upgrade modal for free users */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="download"
        currentRole={tier}
      />

      {/* Download Modal for Pro/Premium users */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        contentTitle={contentTitle}
        contentType={contentType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        year={year}
        contentId={contentId}
      />
    </>
  );
});

DownloadButton.displayName = 'DownloadButton';

export default DownloadButton;
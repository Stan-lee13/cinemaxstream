
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import DownloadModal from './DownloadModal';

interface DownloadButtonProps {
  contentTitle: string;
  contentType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  year?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  year,
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={`${className} ${variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>

      <DownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contentTitle={contentTitle}
        contentType={contentType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        year={year}
      />
    </>
  );
};

export default DownloadButton;

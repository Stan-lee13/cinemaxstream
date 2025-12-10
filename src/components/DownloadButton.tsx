
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
  const handleDownload = () => {
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
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className={`${className} ${variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      <Download className="h-4 w-4 mr-2" />
      Download
    </Button>
  );
};

export default DownloadButton;

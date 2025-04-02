
import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { QUALITY_OPTIONS, getDownloadUrl, hasPremiumAccess } from "@/utils/videoUtils";
import { toast } from 'sonner';
import PremiumBadge from './PremiumBadge';

interface DownloadOptionsProps {
  contentId: string;
  contentType: string;
  isPremium?: boolean;
  episodeId?: string;
}

const DownloadOptions = ({ 
  contentId, 
  contentType, 
  isPremium = false,
  episodeId
}: DownloadOptionsProps) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const canAccessPremium = hasPremiumAccess();

  const handleDownload = (quality: string) => {
    if (isPremium && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      return;
    }
    
    setDownloading(quality);
    const downloadUrl = getDownloadUrl(contentId, contentType, quality, episodeId);
    
    // Open download in new tab
    window.open(downloadUrl, '_blank');
    
    toast.success(`Starting download in ${quality}`);
    
    // Reset downloading state after 3 seconds
    setTimeout(() => {
      setDownloading(null);
    }, 3000);
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Available Downloads</h3>
        {isPremium && <PremiumBadge showLock={!canAccessPremium} />}
      </div>
      
      <div className="space-y-4">
        {Object.entries(QUALITY_OPTIONS).map(([key, option]) => (
          <div key={key} className="flex justify-between items-center pb-3 border-b border-gray-700">
            <div>
              <p className="font-medium">{option.label}</p>
              <p className="text-sm text-gray-400">File size: {option.size}</p>
            </div>
            <Button 
              size="sm" 
              className={`gap-1 ${
                downloading === option.quality 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-cinemax-500 hover:bg-cinemax-600"
              }`}
              onClick={() => handleDownload(option.quality)}
              disabled={downloading !== null}
            >
              {downloading === option.quality ? (
                <>
                  <Check size={14} />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download</span>
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadOptions;

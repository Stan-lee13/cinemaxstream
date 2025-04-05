
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { getDownloadUrl } from "@/utils/videoUtils";
import { QUALITY_OPTIONS } from "@/utils/streamingUtils";
import { hasPremiumAccess } from "@/utils/authUtils";

interface DownloadOptionsProps {
  contentId: string;
  title: string;
}

const DownloadOptions = ({ contentId, title }: DownloadOptionsProps) => {
  const [selectedQuality, setSelectedQuality] = useState<string>(QUALITY_OPTIONS[1].value);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasPremium = hasPremiumAccess();
  
  // Handle download
  const handleDownload = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent triggering parent click handlers
    e.preventDefault();
    e.stopPropagation();
    
    setIsDownloading(true);
    
    // Check if premium quality and user doesn't have premium
    const isPremium = selectedQuality === "4k";
    
    if (isPremium && !hasPremium) {
      toast.error("Premium subscription required for 4K downloads");
      setIsDownloading(false);
      return;
    }
    
    try {
      // Get download URL
      const downloadUrl = getDownloadUrl(contentId, selectedQuality);
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/\s+/g, '_')}_${selectedQuality}.mp4`;
      document.body.appendChild(link); // Append to body to ensure it works
      link.click();
      document.body.removeChild(link); // Clean up
      
      toast.success(`Download started: ${title} (${selectedQuality})`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to start download. Please try again.");
    } finally {
      // Add slight delay for UX
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    }
  };
  
  return (
    <div 
      className="flex items-center gap-2" 
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={selectedQuality}
        onValueChange={setSelectedQuality}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select quality" />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
          {QUALITY_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.value === "4k" && !hasPremium}
            >
              {option.label}
              {option.value === "4k" && !hasPremium && " (Premium)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Download size={16} />
        )}
      </Button>
    </div>
  );
};

export default DownloadOptions;

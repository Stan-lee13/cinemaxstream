
import { useState } from "react";
import { DownloadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QUALITY_OPTIONS, getDownloadUrl, hasPremiumAccess } from "@/utils/videoUtils";
import PremiumBadge from "./PremiumBadge";

interface DownloadOptionsProps {
  contentId: string;
  contentType?: string;
  isPremium?: boolean;
  episodeId?: string;
}

const DownloadOptions = ({ contentId, contentType = 'movie', isPremium = false, episodeId }: DownloadOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const canAccessPremium = hasPremiumAccess();
  
  const handleDownload = (quality: string) => {
    if (!contentId) return;
    
    if (isPremium && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      return;
    }
    
    const downloadUrl = getDownloadUrl(contentId, quality, contentType);
    window.open(downloadUrl, '_blank');
    
    toast.success(`Starting download in ${quality}`);
    setIsOpen(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gray-800 border-gray-700">
          <DownloadCloud size={16} className="opacity-70" />
          <span>Download</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-900 border-gray-800 text-white">
        <SheetHeader className="text-left">
          <SheetTitle className="text-white">Download Options</SheetTitle>
          <SheetDescription className="text-gray-400">
            Select video quality to download
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <div className="flex flex-col space-y-2">
            {QUALITY_OPTIONS.map((option) => (
              <Button
                key={option.quality}
                variant="ghost"
                className={`w-full justify-between py-6 px-4 bg-gray-800/50 hover:bg-gray-800 ${
                  option.premium && !canAccessPremium ? 'opacity-50' : ''
                }`}
                disabled={option.premium && !canAccessPremium}
                onClick={() => handleDownload(option.quality)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-sm text-gray-400">{option.size}</span>
                </div>
                {option.premium && <PremiumBadge showLock={!canAccessPremium} className="scale-75" />}
              </Button>
            ))}
          </div>
          
          <Separator className="my-4 bg-gray-800" />
          
          <div className="text-sm text-gray-400">
            <p>Downloads are for offline viewing only.</p>
            <p className="mt-2">Please respect copyright and do not redistribute.</p>
          </div>
        </div>
        
        <SheetFooter className="flex flex-col sm:flex-row gap-2">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto border-gray-700">
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DownloadOptions;

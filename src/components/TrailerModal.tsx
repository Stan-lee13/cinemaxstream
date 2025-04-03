
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrailerUrl } from "@/utils/videoUtils";
import { useEffect, useState } from "react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string | undefined;
  title: string;
}

const TrailerModal = ({ isOpen, onClose, trailerKey, title }: TrailerModalProps) => {
  const [trailerSrc, setTrailerSrc] = useState<string>("");
  
  useEffect(() => {
    // Only fetch trailer when modal is open and we have a key
    if (isOpen && trailerKey) {
      // Since getTrailerUrl might be async, handle it appropriately
      const fetchTrailer = async () => {
        try {
          const url = await getTrailerUrl(trailerKey, "movie");
          setTrailerSrc(url);
        } catch (error) {
          console.error("Error fetching trailer URL:", error);
          setTrailerSrc("");
        }
      };
      
      fetchTrailer();
    }
  }, [isOpen, trailerKey]);

  if (!trailerKey) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-transparent border-none">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose} 
            className="absolute right-2 top-2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X size={20} />
          </Button>
          
          <div className="aspect-video w-full">
            {trailerSrc ? (
              <iframe
                src={trailerSrc}
                title={`${title} Trailer`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;


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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only fetch trailer when modal is open and we have a key
    if (isOpen && trailerKey) {
      // Reset state
      setIsLoading(true);
      setError(null);
      
      // Fetch trailer URL
      const fetchTrailer = async () => {
        try {
          const url = await getTrailerUrl(trailerKey, "movie");
          setTrailerSrc(url);
        } catch (error) {
          console.error("Error fetching trailer URL:", error);
          setError("Failed to load trailer");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTrailer();
    } else {
      // Reset trailer source when modal is closed
      setTrailerSrc("");
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
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                <p className="text-red-500 mb-4">{error}</p>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            ) : trailerSrc ? (
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

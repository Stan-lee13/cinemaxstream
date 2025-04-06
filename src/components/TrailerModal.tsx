
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    // Only prepare trailer when modal is open and we have a key
    if (isOpen && trailerKey) {
      setIsLoading(true);
      setError(null);
      
      try {
        // If the key is already a full URL, extract the video ID
        if (trailerKey.includes('youtube.com') || trailerKey.includes('youtu.be')) {
          let videoId = trailerKey;
          
          if (trailerKey.includes('youtube.com/watch?v=')) {
            videoId = trailerKey.split('v=')[1].split('&')[0];
          } else if (trailerKey.includes('youtu.be/')) {
            videoId = trailerKey.split('youtu.be/')[1];
          }
          
          setTrailerSrc(`https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${window.location.origin}`);
        } else {
          // Assume trailerKey is already a video ID
          setTrailerSrc(`https://www.youtube.com/embed/${trailerKey}?autoplay=1&origin=${window.location.origin}`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up trailer URL:", error);
        setError("Failed to load trailer");
        setIsLoading(false);
      }
    } else {
      // Reset trailer source when modal is closed
      setTrailerSrc("");
    }
  }, [isOpen, trailerKey]);

  // If no trailer key is provided, don't render anything
  if (!trailerKey) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                key={`trailer-${trailerSrc}`}
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

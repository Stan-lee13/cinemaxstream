
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const cleanupIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
    setTrailerSrc('');
  };
  
  useEffect(() => {
    
    
    if (isOpen && trailerKey) {
      setIsLoading(true);
      setError(null);
      
      try {
        let videoId = trailerKey;
        
        // Handle different trailer key formats
        if (trailerKey.includes('youtube.com/watch?v=')) {
          videoId = trailerKey.split('v=')[1].split('&')[0];
        } else if (trailerKey.includes('youtu.be/')) {
          videoId = trailerKey.split('youtu.be/')[1];
        }
        
        // Use nocookie domain for better compatibility
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&origin=${encodeURIComponent(window.location.origin)}`;
        
        setTrailerSrc(embedUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up trailer URL:", error);
        setError("Failed to load trailer");
        setIsLoading(false);
      }
    } else if (!isOpen) {
      cleanupIframe();
    }
    
    return () => {
      if (!isOpen) {
        cleanupIframe();
      }
    };
  }, [isOpen, trailerKey, title]);

  if (!trailerKey) {
    return null;
  }

  const handleCloseModal = () => {
    cleanupIframe();
    onClose();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load trailer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-gray-800">
        <div className="relative bg-black">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCloseModal} 
            className="absolute right-2 top-2 z-50 bg-black/70 hover:bg-black/90 text-white rounded-full border border-gray-600"
            aria-label="Close trailer"
          >
            <X size={20} />
          </Button>
          
          <div className="aspect-video w-full bg-black">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black min-h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading trailer...</p>
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white min-h-[300px]">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-gray-400 mb-4">Unable to load trailer for "{title}"</p>
                <Button variant="outline" onClick={handleCloseModal}>Close</Button>
              </div>
            ) : trailerSrc ? (
              <iframe
                ref={iframeRef}
                key={`trailer-${trailerKey}-${isOpen}`}
                src={trailerSrc}
                title={`${title} Trailer`}
                className="w-full h-full min-h-[300px]"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black min-h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500 mx-auto mb-4"></div>
                  <p className="text-white">Preparing trailer...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;

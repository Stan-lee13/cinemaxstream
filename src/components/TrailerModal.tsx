
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrailerUrl } from "@/utils/videoUtils";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string | undefined;
  title: string;
}

const TrailerModal = ({ isOpen, onClose, trailerKey, title }: TrailerModalProps) => {
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
            <iframe
              src={getTrailerUrl(trailerKey)}
              title={`${title} Trailer`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;

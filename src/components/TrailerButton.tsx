
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Film } from 'lucide-react';
import TrailerModal from './TrailerModal';

interface TrailerButtonProps {
  trailerKey?: string;
  title: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const TrailerButton = ({ 
  trailerKey, 
  title,
  variant = 'outline',
  size = 'lg' 
}: TrailerButtonProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  
  // If no trailer key is provided, don't render the component
  if (!trailerKey) {
    return null;
  }

  const handleShowTrailer = (e: React.MouseEvent) => {
    // Prevent any parent elements from receiving the click event
    e.preventDefault();
    e.stopPropagation();
    setShowTrailer(true);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className="gap-2 border-gray-600 hover:bg-secondary hover:text-white px-6" 
        onClick={handleShowTrailer}
        aria-label="Watch Trailer"
      >
        <Film size={18} />
        <span>Watch Trailer</span>
      </Button>
      
      {showTrailer && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          trailerKey={trailerKey}
          title={`${title} - Official Trailer`}
        />
      )}
    </>
  );
};

export default TrailerButton;

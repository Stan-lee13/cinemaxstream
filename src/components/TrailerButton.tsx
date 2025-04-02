
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
  
  if (!trailerKey) {
    return null;
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className="gap-2 border-gray-600 hover:bg-secondary hover:text-white px-6" 
        onClick={() => setShowTrailer(true)}
      >
        <Film size={18} />
        <span>Watch Trailer</span>
      </Button>
      
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerKey={trailerKey}
        title={title}
      />
    </>
  );
};

export default TrailerButton;

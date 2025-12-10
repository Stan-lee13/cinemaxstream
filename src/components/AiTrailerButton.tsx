
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Film, Sparkles } from 'lucide-react';
import TrailerModal from './TrailerModal';
import { analyzeContentSentiment } from '@/utils/aiUtils';
import { toast } from 'sonner';

interface AiTrailerButtonProps {
  trailerKey?: string;
  title: string;
  contentId: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AiTrailerButton = ({ 
  trailerKey, 
  title,
  contentId,
  variant = 'outline',
  size = 'lg' 
}: AiTrailerButtonProps) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // If no trailer key is provided, don't render the component
  if (!trailerKey) {
    return null;
  }

  const handleAiAnalysis = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoadingAi(true);
    try {
      const sentiment = await analyzeContentSentiment(contentId);
      
      // Display sentiment analysis results
      toast.success(`AI Content Analysis: ${sentiment.overall} (${Math.round(sentiment.positive * 100)}% positive)`, {
        position: "bottom-center",
        duration: 5000,
        className: "bg-indigo-900",
      });
      
    } catch (error) {
      toast.error("Failed to analyze content with AI");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleShowTrailer = (e: React.MouseEvent) => {
    // Prevent any parent elements from receiving the click event
    e.preventDefault();
    e.stopPropagation();
    setShowTrailer(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
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
        
        <Button
          variant="secondary"
          size="icon"
          onClick={handleAiAnalysis}
          disabled={isLoadingAi}
          className="aspect-square h-10"
          title="AI Sentiment Analysis"
          aria-label="AI Sentiment Analysis"
        >
          {isLoadingAi ? (
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Sparkles size={18} />
          )}
        </Button>
      </div>
      
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

export default AiTrailerButton;

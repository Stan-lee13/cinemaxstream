import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, Info, Plus } from 'lucide-react';
import BackButton from "./BackButton";
import PremiumBadge from "./PremiumBadge";
import TrailerModal from "./TrailerModal";
import { toast } from "sonner";

interface Content {
  is_premium?: boolean;
  rating?: string | number;
  content_type?: string;
  type?: string;
  year?: string | number;
  duration?: string;
  image_url?: string;
  image?: string;
  title?: string;
  description?: string;
  trailer_key?: string;
}

interface MovieDetailProps {
  content: Content;
  liked: boolean;
  toggleFavorite: () => void;
  showTrailer: () => void;
  startWatching: () => void;
}

const MovieDetail = ({
  content,
  liked,
  toggleFavorite,
  showTrailer,
  startWatching
}: MovieDetailProps) => {
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const isPremiumContent = content?.is_premium || (content?.rating && parseFloat(String(content.rating)) > 8.0);

  const handleWatchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to content detail page
    
    try {
      startWatching();
    } catch (error) {
      // Log to production error tracking
      if (typeof window !== 'undefined') {
        const globalWindow = window as Window & { errorReporter?: { captureException?: (err: Error, context?: string, severity?: string) => void | Promise<void> } };
        if (globalWindow.errorReporter?.captureException) {
          void globalWindow.errorReporter.captureException(error as Error, 'MovieDetail', 'medium');
        }
      }
      toast.error("Failed to start watching. Please try again.");
    }
  };

  const handleTrailerButtonClick = () => {
    try {
      setShowTrailerModal(true);
    } catch (error) {
      // Log to production error tracking
      if (typeof window !== 'undefined') {
        const globalWindow = window as Window & { errorReporter?: { captureException?: (err: Error, context?: string, severity?: string) => void | Promise<void> } };
        if (globalWindow.errorReporter?.captureException) {
          void globalWindow.errorReporter.captureException(error as Error, 'MovieDetail', 'medium');
        }
      }
      toast.error("Failed to load trailer. Please try again.");
    }
  };

  const handleFavoriteButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Added to watchlist");
  };

  // Get trailer key for the content
  const getTrailerKey = () => {
    return content?.trailer_key || undefined;
  };

  return (
    <div className="relative h-[70vh]">
      <BackButton fixed />

      <div className="absolute inset-0">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={content.image_url || content.image || ''}
          alt={content.title || ''}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 relative h-full flex items-end pb-16">
        <div className="w-full lg:w-2/3 animate-fade-in">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-2 py-1 rounded-md bg-cinemax-500/20 text-cinemax-400 text-xs font-semibold">
              <div className="inline mr-1" />
              {content.content_type || content.type || 'movie'}
            </span>
            
            {isPremiumContent && (
              <PremiumBadge />
            )}

            <span className="text-gray-400 text-sm">{content.year || "—"}</span>
            <span className="text-gray-400 text-sm">{content.duration || "—"}</span>
            <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-yellow-500 text-xs font-medium">{content.rating || "—"}</span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title || "Untitled"}</h1>
          <p className="text-gray-300 mb-8 text-sm md:text-base max-w-2xl">
            {content.description || "No description available."}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600 gap-2 px-6" 
              size="lg"
              onClick={handleWatchButtonClick}
              aria-label="Watch Now"
            >
              <Play size={18} />
              <span>Watch Now</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 border-gray-600 hover:bg-secondary hover:text-white px-6" 
              onClick={handleTrailerButtonClick}
              aria-label="Watch Trailer"
              disabled={!content.trailer_key}
            >
              <Info size={18} />
              <span>{content.trailer_key ? 'Watch Trailer' : 'No Trailer'}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full border ${
                liked 
                  ? "bg-cinemax-500/20 border-cinemax-500 text-cinemax-500" 
                  : "border-gray-700 hover:bg-gray-700/50"
              }`}
              onClick={handleFavoriteButtonClick}
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full border border-gray-700 hover:bg-gray-700/50"
              onClick={handleAddToWatchlist}
              aria-label="Add to watchlist"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        trailerKey={getTrailerKey()}
        title={content.title || "Untitled"}
      />
    </div>
  );
};

export default MovieDetail;

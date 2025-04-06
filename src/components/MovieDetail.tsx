
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Download, Heart, Info, Plus } from 'lucide-react';
import BackButton from "./BackButton";
import PremiumBadge from "./PremiumBadge";
import { hasPremiumAccess } from "@/utils/videoUtils";
import DownloadOptions from "./DownloadOptions";
import { toast } from "sonner";
import AiTrailerButton from "./AiTrailerButton";

interface MovieDetailProps {
  content: any;
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
  const isPremiumContent = content?.is_premium || (content?.rating && parseFloat(content.rating) > 8.0);
  const canAccessPremium = hasPremiumAccess();
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  
  // Close download options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadOptions(false);
      }
    };
    
    if (showDownloadOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadOptions]);
  
  return (
    <div className="relative h-[70vh]">
      <BackButton fixed />
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.image_url || content.image || ''})` }}
      >
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
              <PremiumBadge showLock={!canAccessPremium} />
            )}
            
            <span className="text-gray-400 text-sm">{content.year}</span>
            <span className="text-gray-400 text-sm">{content.duration}</span>
            <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-yellow-500 text-xs font-medium">{content.rating}</span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
          <p className="text-gray-300 mb-8 text-sm md:text-base max-w-2xl">
            {content.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600 gap-2 px-6" 
              size="lg"
              onClick={startWatching}
            >
              <Play size={18} />
              <span>Watch Now</span>
            </Button>
            
            {content.trailer_key && (
              <AiTrailerButton
                trailerKey={content.trailer_key}
                title={content.title}
                contentId={content.id}
                variant="outline"
                size="lg"
              />
            )}
            
            <div className="relative" ref={downloadRef}>
              <Button 
                variant="outline" 
                className="gap-2 border-gray-600 hover:bg-secondary hover:text-white px-6" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDownloadOptions(!showDownloadOptions);
                }}
              >
                <Download size={18} />
                <span>Download</span>
              </Button>
              
              {showDownloadOptions && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg z-20 w-[200px]">
                  <DownloadOptions 
                    contentId={content.id} 
                    title={content.title} 
                  />
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full border ${
                liked 
                  ? "bg-cinemax-500/20 border-cinemax-500 text-cinemax-500" 
                  : "border-gray-700 hover:bg-gray-700/50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full border border-gray-700 hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                toast.info("Added to watchlist");
              }}
              aria-label="Add to watchlist"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;

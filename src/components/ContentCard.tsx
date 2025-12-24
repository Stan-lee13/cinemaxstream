import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Content } from "@/types/content";

interface ContentCardProps {
  item: Content;
  onCardClick?: (item: Content) => void;
}

/**
 * Defensive safe guard for ID assignment
 */
const isValidContentId = (id: unknown): id is string | number =>
  !!id && (typeof id === "string" || typeof id === "number");

const ContentCard: React.FC<ContentCardProps> = ({ item, onCardClick }) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  if (!isValidContentId(item?.id)) {
    // Silently skip rendering invalid content in production
    return null;
  }

  // Defensive: Only allow string/number IDs and prevent fallbacks
  const contentId = item.id;

  return (
    <div
      key={contentId}
      className="min-w-[180px] sm:min-w-[220px] flex-shrink-0"
      data-card-title={item.title}
      data-card-id={String(contentId)}
      role="article"
      aria-labelledby={`content-title-${contentId}`}
    >
      <Link
        to={`/content/${contentId}`}
        state={{ contentType: item.type || 'movie' }}
        onClick={() => onCardClick?.(item)}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        aria-describedby={`content-meta-${contentId}`}
      >
        <div className="movie-card h-[260px] sm:h-[300px] relative">
          {item.poster || item.image ? (
            imageLoadError ? (
              <div 
                className="flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg"
                role="img"
                aria-label={`Image unavailable for ${item.title}`}
              >
                <ImageOff size={42} className="mx-auto text-gray-600" aria-hidden="true" />
                <span className="text-xs mt-1 text-gray-500">Image unavailable</span>
              </div>
            ) : (
              <img
                src={item.poster || item.image}
                alt={`${item.title} poster`}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                onError={() => setImageLoadError(true)}
              />
            )
          ) : (
            <div 
              className="flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg"
              role="img"
              aria-label={`No image available for ${item.title}`}
            >
              <ImageOff size={42} className="mx-auto text-gray-600" aria-hidden="true" />
              <span className="text-xs mt-1 text-gray-500">Image unavailable</span>
            </div>
          )}
          <div className="movie-overlay">
            <div className="flex justify-between items-center mb-1" id={`content-meta-${contentId}`}>
              <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-yellow-500 font-medium" aria-label={`Rating: ${item.rating || 'Not rated'}`}>
                  {item.rating || "—"}
                </span>
              </span>
              <span className="text-xs" aria-label={`Year: ${item.year || 'Unknown'}`}>{item.year || "—"}</span>
            </div>
            <h3 
              className="font-medium line-clamp-1" 
              id={`content-title-${contentId}`}
            >
              {item.title || "Untitled"}
            </h3>
            <div className="flex gap-2 mt-2">
              <Button 
                className="h-9 rounded-md px-3 w-full gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                aria-label={`Play ${item.title}`}
              >
                <Play size={14} aria-hidden="true" />
                <span>Play</span>
              </Button>
              {/* NO DOWNLOAD BUTTON, streaming only */}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ContentCard;

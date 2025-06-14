import React from "react";
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
const isValidContentId = (id: any): id is string | number =>
  !!id && (typeof id === "string" || typeof id === "number");

const ContentCard: React.FC<ContentCardProps> = ({ item, onCardClick }) => {
  if (!isValidContentId(item?.id)) {
    console.warn("[ContentCard] Skipping render due to invalid or missing ID.", { item });
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
    >
      <Link
        to={`/content/${contentId}`}
        onClick={() => onCardClick?.(item)}
      >
        <div className="movie-card h-[260px] sm:h-[300px] relative">
          {item.poster || item.image ? (
            <img
              src={item.poster || item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg"
              onError={e => {
                // Hide broken images with a fallback overlay
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML += `<div class='flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg absolute inset-0 z-10'><svg xmlns="http://www.w3.org/2000/svg" class="mx-auto text-gray-600" width="42" height="42" fill="none" viewBox="0 0 24 24"><path d="M9.44 9.44a5 5 0 0 0 7.07 7.07m-1.06-8.13a5 5 0 0 0-7.07 7.07M9 5v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 3l18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class='text-xs mt-1 text-gray-500'>Image unavailable</span></div>`;
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg">
              <ImageOff size={42} className="mx-auto text-gray-600" />
              <span className="text-xs mt-1 text-gray-500">Image unavailable</span>
            </div>
          )}
          <div className="movie-overlay">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-yellow-500 font-medium">
                  {item.rating || "—"}
                </span>
              </span>
              <span className="text-xs">{item.year || "—"}</span>
            </div>
            <h3 className="font-medium line-clamp-1">{item.title || "Untitled"}</h3>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none"
              >
                <Play size={14} />
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


import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Download, ArrowRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";

interface ContentRowProps {
  title: string;
  category: string;
  showViewAll?: boolean;
  items?: Content[];
}

// Utility to get TMDB fetch function by category.
const getFetchFnForCategory = (category: string) => {
  switch (category) {
    case "trending":
      return tmdbApi.getContentByCategory.bind(null, "trending");
    case "movies":
      return tmdbApi.getContentByCategory.bind(null, "movies");
    case "featured":
      return tmdbApi.getContentByCategory.bind(null, "movies");
    case "recommended":
      return tmdbApi.getContentByCategory.bind(null, "movies");
    case "anime":
      return tmdbApi.getContentByCategory.bind(null, "anime");
    case "sports":
      return tmdbApi.getContentByCategory.bind(null, "sports");
    case "series":
      return tmdbApi.getContentByCategory.bind(null, "series");
    default:
      return tmdbApi.getContentByCategory.bind(null, category);
  }
};

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  category,
  showViewAll,
  items: propItems,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftControl, setShowLeftControl] = useState(false);
  const [showRightControl, setShowRightControl] = useState(true);

  const {
    data: fetchedItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["content", category],
    queryFn: getFetchFnForCategory(category),
  });

  // Use direct propItems if present, otherwise TMDB data, fallback to empty for robust TS
  const items = propItems ?? fetchedItems ?? [];

  const viewAllLink = `/${category}`;

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      if (direction === "left") {
        rowRef.current.scrollTo({
          left: scrollLeft - scrollAmount,
          behavior: "smooth",
        });
      } else {
        rowRef.current.scrollTo({
          left: scrollLeft + scrollAmount,
          behavior: "smooth",
        });
      }
      setTimeout(() => {
        if (rowRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
          setShowLeftControl(scrollLeft > 0);
          setShowRightControl(scrollLeft < scrollWidth - clientWidth - 5);
        }
      }, 400);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-7 bg-gray-700 w-48 rounded"></div>
          {showViewAll && (
            <div className="h-5 bg-gray-800 w-20 rounded"></div>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[180px] sm:min-w-[220px] h-[260px] bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !items.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-gray-600">No content available.</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {showViewAll && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="relative group">
          {showLeftControl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ArrowLeft size={20} />
            </Button>
          )}

          {showRightControl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ArrowRight size={20} />
            </Button>
          )}

          <div
            ref={rowRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4"
            onScroll={() => {
              if (rowRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
                setShowLeftControl(scrollLeft > 0);
                setShowRightControl(scrollLeft < scrollWidth - clientWidth - 5);
              }
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="min-w-[180px] sm:min-w-[220px] flex-shrink-0"
              >
                <Link to={`/content/${item.id}`}>
                  <div className="movie-card h-[260px] sm:h-[300px] relative">
                    <img
                      src={item.poster || item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="movie-overlay">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="text-yellow-500 font-medium">{item.rating}</span>
                        </span>
                        <span className="text-xs">{item.year}</span>
                      </div>
                      <h3 className="font-medium line-clamp-1">{item.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <Button variant="secondary" size="sm" className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none">
                          <Play size={14} />
                          <span>Play</span>
                        </Button>
                        <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/10 hover:bg-white/20 border-none">
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentRow;


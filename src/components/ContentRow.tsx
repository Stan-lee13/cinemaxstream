import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import ContentRowHeader from "./ContentRowHeader";
import ContentRowControls from "./ContentRowControls";
import ContentRowList from "./ContentRowList";
import { Content } from "@/types/content";

interface ContentRowProps {
  title: string;
  category: string;
  showViewAll?: boolean;
  items?: Content[];
}

const getFetchFnForCategory = (category: string) => {
  switch (category) {
    case "trending":
      return tmdbApi.getContentByCategory.bind(null, "trending");
    case "movies":
    case "featured":
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
  } = useQuery<Content[]>({
    queryKey: ["content", category],
    queryFn: getFetchFnForCategory(category),
  });

  const items: Content[] = propItems ?? fetchedItems ?? [];
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

  // Helper function for debugging IDs
  const logCardClick = (item: Content) => {
    console.log("[ContentRow] Card clicked:", {
      id: item.id,
      title: item.title,
      category: item.category,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ContentRowHeader title={title} showViewAll={showViewAll} viewAllLink={viewAllLink} />
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

  if (error || !items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ContentRowHeader title={title} showViewAll={showViewAll} viewAllLink={viewAllLink} />
        <div className="text-gray-600">No content available.</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <ContentRowHeader title={title} showViewAll={showViewAll} viewAllLink={viewAllLink} />

        <div className="relative group">
          <ContentRowControls
            showLeft={showLeftControl}
            showRight={showRightControl}
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
          />

          <ContentRowList
            items={items}
            onCardClick={logCardClick}
            rowRef={rowRef}
            onScroll={() => {
              if (rowRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
                setShowLeftControl(scrollLeft > 0);
                setShowRightControl(scrollLeft < scrollWidth - clientWidth - 5);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentRow;

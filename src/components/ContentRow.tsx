
import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import { Content } from "@/types/content";
import ContentRowHeader from "./ContentRowHeader";
import ContentRowControls from "./ContentRowControls";
import ContentRowList from "./ContentRowList";

interface ContentRowProps {
  title: string;
  category: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  items?: Content[];
}

const getFetchFnForCategory = (category: string) => {
  switch (category) {
    case "trending":
      return () => tmdbApi.getContentByCategory("trending");
    case "movies":
      return () => tmdbApi.getContentByCategory("movies");
    case "featured":
      // Featured uses a distinct mix to avoid duplication with movies
      return () => tmdbApi.getContentByCategory("featured");
    case "recommended":
      return () => tmdbApi.getContentByCategory("trending");
    case "anime":
      return () => tmdbApi.getContentByCategory("anime");
    case "sports":
      return () => tmdbApi.getContentByCategory("sports");
    case "series":
      return () => tmdbApi.getContentByCategory("series");
    case "documentary":
    case "documentaries":
      return () => tmdbApi.getContentByCategory("documentary");
    default:
      return () => tmdbApi.getContentByCategory(category);
  }
};

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  category,
  showViewAll,
  viewAllLink: customViewAllLink,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const items: Content[] = propItems ?? fetchedItems ?? [];
  const viewAllLink = customViewAllLink || `/${category}`;

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

  // Handle card click - navigate to content detail
  const handleCardClick = (item: Content) => {
    // Navigation is handled by ContentCard component
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

  if (error) {
    // Error loading content
    return (
      <div className="container mx-auto px-4 py-8">
        <ContentRowHeader title={title} showViewAll={showViewAll} viewAllLink={viewAllLink} />
        <div className="text-gray-600">Failed to load content. Please try again later.</div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ContentRowHeader title={title} showViewAll={showViewAll} viewAllLink={viewAllLink} />
        <div className="text-gray-600">No content available for this category.</div>
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
            onCardClick={handleCardClick}
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

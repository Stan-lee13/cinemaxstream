import React, { useRef } from "react";
import ContentCard from "./ContentCard";
import { Content } from "@/types/content";

interface ContentRowListProps {
  items: Content[];
  onCardClick: (item: Content) => void;
  rowRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

const ContentRowList: React.FC<ContentRowListProps> = ({
  items,
  onCardClick,
  rowRef,
  onScroll,
}) => (
  <div
    ref={rowRef}
    className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4"
    onScroll={onScroll}
  >
    {items.map((item) =>
      item && item.id ? (
        <ContentCard key={item.id} item={item} onCardClick={onCardClick} />
      ) : null
    )}
  </div>
);

export default ContentRowList;

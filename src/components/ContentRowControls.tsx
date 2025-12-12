
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ContentRowControlsProps {
  showLeft: boolean;
  showRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

const ContentRowControls: React.FC<ContentRowControlsProps> = ({
  showLeft,
  showRight,
  onScrollLeft,
  onScrollRight,
}) => (
  <>
    {showLeft && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onScrollLeft}
        aria-label="Scroll left"
      >
        <ArrowLeft size={20} />
      </Button>
    )}
    {showRight && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onScrollRight}
        aria-label="Scroll right"
      >
        <ArrowRight size={20} />
      </Button>
    )}
  </>
);

export default ContentRowControls;

/**
 * Modern Source Selector Component
 * Clean pill-style buttons with smooth transitions
 * Displays sources as "Source 1-3" for better UX
 * RESTRUCTURED: Exactly 3 sources
 */

import React, { memo } from 'react';
import { Check, Loader2, Crown, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvailableSources, isVidRockSource } from '@/utils/providers/providerUtils';

interface SourceSelectorProps {
  activeSource: number;
  onSourceChange: (source: number) => void;
  isLoading?: boolean;
  isPremium?: boolean;
  disabled?: boolean;
}

const SourceSelector: React.FC<SourceSelectorProps> = memo(({
  activeSource,
  onSourceChange,
  isLoading = false,
  isPremium = false,
  disabled = false
}) => {
  const sources = getAvailableSources(); // Returns [1, 2, 3]

  return (
    <div className="flex flex-wrap items-center gap-2" data-tour-id="source-selector">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
        <Server className="h-3.5 w-3.5" />
        <span className="font-medium">Server:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((sourceNum) => {
          const isActive = activeSource === sourceNum;
          const isVidRock = isVidRockSource(sourceNum);
          const isLoadingThis = isLoading && isActive;
          
          return (
            <button
              key={sourceNum}
              onClick={() => onSourceChange(sourceNum)}
              disabled={disabled || (isLoading && !isActive)}
              className={cn(
                "relative h-8 px-3 text-xs font-medium rounded-full transition-all duration-200",
                "flex items-center gap-1.5",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                isVidRock && isPremium && !isActive && "ring-1 ring-amber-500/30"
              )}
            >
              {isLoadingThis ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isActive ? (
                <Check className="h-3 w-3" />
              ) : null}
              <span>Source {sourceNum}</span>
              {isVidRock && isPremium && (
                <Crown className="h-3 w-3 text-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

SourceSelector.displayName = 'SourceSelector';

export default SourceSelector;

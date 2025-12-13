/**
 * Source Selector Component
 * Displays sources as "Source 1-5" without revealing provider names
 * Includes visual indicators for current selection and loading states
 */

import React, { memo } from 'react';
import { Button } from './ui/button';
import { Check, RefreshCw, Crown } from 'lucide-react';
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
  const sources = getAvailableSources();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-secondary/30 rounded-lg" data-tour-id="source-selector">
      <span className="text-sm text-muted-foreground whitespace-nowrap mr-1">Source:</span>
      {sources.map((sourceNum) => {
        const isActive = activeSource === sourceNum;
        const isVidRock = isVidRockSource(sourceNum);
        
        return (
          <Button
            key={sourceNum}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onSourceChange(sourceNum)}
            disabled={disabled || (isLoading && !isActive)}
            className={cn(
              "h-7 px-3 text-xs transition-all relative",
              isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              isVidRock && isPremium && !isActive && "border-amber-500/50"
            )}
          >
            {isActive && <Check className="h-3 w-3 mr-1" />}
            Source {sourceNum}
            {isVidRock && isPremium && (
              <Crown className="h-3 w-3 ml-1 text-amber-500" />
            )}
          </Button>
        );
      })}
      {isLoading && (
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
      )}
    </div>
  );
});

SourceSelector.displayName = 'SourceSelector';

export default SourceSelector;

/**
 * Modern Source Selector Component
 * Shows server names (Videasy, Vidnest, Vidrock, Vidlink)
 * with health indicators
 */

import React, { memo } from 'react';
import { Check, Loader2, Crown, Server, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvailableSources, getSourceLabel, getSourceConfig } from '@/utils/providers/providerUtils';

interface SourceSelectorProps {
  activeSource: number;
  onSourceChange: (source: number) => void;
  isLoading?: boolean;
  isPremium?: boolean;
  disabled?: boolean;
  healthMap?: Record<number, { healthy: boolean; latency: number }>;
}

const SourceSelector: React.FC<SourceSelectorProps> = memo(({
  activeSource,
  onSourceChange,
  isLoading = false,
  isPremium = false,
  disabled = false,
  healthMap,
}) => {
  const sources = getAvailableSources();

  return (
    <div className="flex flex-wrap items-center gap-2" data-tour-id="source-selector">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
        <Server className="h-3.5 w-3.5" />
        <span className="font-medium">Server:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((sourceNum) => {
          const cfg = getSourceConfig(sourceNum);
          const isActive = activeSource === sourceNum;
          const isLoadingThis = isLoading && isActive;
          const health = healthMap?.[sourceNum];
          const isUnhealthy = health && !health.healthy;

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
                cfg.isPremium && isPremium && !isActive && "ring-1 ring-amber-500/30",
                isUnhealthy && !isActive && "opacity-60"
              )}
              title={
                health
                  ? `${cfg.label} — ${health.healthy ? `${health.latency}ms` : 'Offline'}`
                  : cfg.label
              }
            >
              {isLoadingThis ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isActive ? (
                <Check className="h-3 w-3" />
              ) : isUnhealthy ? (
                <WifiOff className="h-3 w-3 text-destructive" />
              ) : health?.healthy ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : null}
              <span>{cfg.label}</span>
              {cfg.isPremium && isPremium && (
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

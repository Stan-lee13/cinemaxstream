/**
 * Modern Source Selector Component
 * Shows generic source names (Source 1–4) with dynamic quality labels
 * based on health/latency data.
 */

import React, { memo, useMemo } from 'react';
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

/** Derive dynamic quality badges from health data */
function getDynamicBadges(healthMap?: Record<number, { healthy: boolean; latency: number }>): Record<number, string> {
  if (!healthMap) return {};
  const badges: Record<number, string> = {};

  const healthySources = Object.entries(healthMap)
    .filter(([, h]) => h.healthy)
    .sort(([, a], [, b]) => a.latency - b.latency);

  if (healthySources.length > 0) {
    const fastestKey = Number(healthySources[0][0]);
    badges[fastestKey] = 'Fastest';

    // Most stable = lowest latency variance (if we have data, pick second lowest)
    if (healthySources.length > 1) {
      const stableKey = Number(healthySources[1][0]);
      badges[stableKey] = 'Stable';
    }
  }

  // Mark the first premium healthy source as recommended
  const premiumHealthy = healthySources.find(([key]) => getSourceConfig(Number(key)).isPremium);
  if (premiumHealthy) {
    const pKey = Number(premiumHealthy[0]);
    if (!badges[pKey]) badges[pKey] = 'Recommended';
  }

  // If no premium found, mark fastest as recommended too
  if (!premiumHealthy && healthySources.length > 0) {
    const fKey = Number(healthySources[0][0]);
    badges[fKey] = 'Recommended';
  }

  return badges;
}

const badgeColors: Record<string, string> = {
  Recommended: 'bg-green-500/20 text-green-400 border-green-500/30',
  Fastest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Stable: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const SourceSelector: React.FC<SourceSelectorProps> = memo(({
  activeSource,
  onSourceChange,
  isLoading = false,
  isPremium = false,
  disabled = false,
  healthMap,
}) => {
  const sources = getAvailableSources();
  const badges = useMemo(() => getDynamicBadges(healthMap), [healthMap]);

  return (
    <div className="flex flex-col gap-2" data-tour-id="source-selector">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
          const badge = badges[sourceNum];

          return (
            <button
              key={sourceNum}
              onClick={() => onSourceChange(sourceNum)}
              disabled={disabled || (isLoading && !isActive)}
              className={cn(
                "relative h-auto px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                "flex items-center gap-1.5 flex-wrap",
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
              {badge && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", badgeColors[badge] || '')}>
                  {badge}
                </span>
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

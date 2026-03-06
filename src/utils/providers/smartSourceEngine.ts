/**
 * Smart Source Engine
 * Automatically selects the fastest responding provider.
 * Falls back on failure. Learns from user environment.
 */

import { getAvailableSources, getSourceConfig, getStreamingUrlForSource, type ProviderOptions } from './providerUtils';

const TIMEOUT_MS = 20_000;
const HEALTH_KEY = 'smart_source_rankings';
const LATENCY_KEY = 'smart_source_latency';

export interface SourceHealth {
  source: number;
  latency: number;       // ms, Infinity = failed
  failures: number;
  successes: number;
  lastChecked: number;
  healthy: boolean;
}

// ── In-memory rankings ─────────────────────────────────────────────

let healthMap: Record<number, SourceHealth> = {};

const loadHealth = (): Record<number, SourceHealth> => {
  if (Object.keys(healthMap).length > 0) return healthMap;
  try {
    const stored = localStorage.getItem(HEALTH_KEY);
    if (stored) healthMap = JSON.parse(stored);
  } catch { /* ignore */ }
  // Ensure all sources exist
  for (const s of getAvailableSources()) {
    if (!healthMap[s]) {
      healthMap[s] = { source: s, latency: 500, failures: 0, successes: 0, lastChecked: 0, healthy: true };
    }
  }
  return healthMap;
};

const saveHealth = () => {
  try { localStorage.setItem(HEALTH_KEY, JSON.stringify(healthMap)); } catch { /* ignore */ }
};

/**
 * Record a source result
 */
export const recordSourceResult = (source: number, latencyMs: number, success: boolean) => {
  loadHealth();
  const h = healthMap[source] || { source, latency: 500, failures: 0, successes: 0, lastChecked: 0, healthy: true };
  if (success) {
    h.successes++;
    h.latency = Math.round((h.latency * 0.7) + (latencyMs * 0.3)); // Exponential moving average
    h.healthy = true;
  } else {
    h.failures++;
    h.latency = Infinity;
    // Deprioritize after 3+ consecutive failures
    if (h.failures >= 3) h.healthy = false;
  }
  h.lastChecked = Date.now();
  healthMap[source] = h;
  saveHealth();
};

/**
 * Get sources ranked by health and latency
 */
export const getRankedSources = (excludeSources: number[] = []): number[] => {
  loadHealth();
  const available = getAvailableSources().filter(s => !excludeSources.includes(s));
  return available.sort((a, b) => {
    const ha = healthMap[a];
    const hb = healthMap[b];
    // Healthy sources first
    if (ha.healthy && !hb.healthy) return -1;
    if (!ha.healthy && hb.healthy) return 1;
    // Then by latency
    return (ha.latency || 9999) - (hb.latency || 9999);
  });
};

/**
 * Get the best source based on rankings
 */
export const getBestSource = (excludeSources: number[] = []): number => {
  const ranked = getRankedSources(excludeSources);
  return ranked[0] || 1;
};

/**
 * Get next fallback source
 */
export const getNextFallback = (currentSource: number, failedSources: number[]): number | null => {
  const ranked = getRankedSources([currentSource, ...failedSources]);
  return ranked.length > 0 ? ranked[0] : null;
};

/**
 * Probe a source to check if it responds
 */
export const probeSource = async (source: number, tmdbId: string = '299534', contentType: string = 'movie'): Promise<{ latency: number; healthy: boolean }> => {
  const url = getStreamingUrlForSource(tmdbId, source, { contentType });
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      referrerPolicy: 'origin',
    });

    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    recordSourceResult(source, latency, true);
    return { latency, healthy: true };
  } catch {
    const latency = Math.round(performance.now() - start);
    recordSourceResult(source, latency, false);
    return { latency, healthy: false };
  }
};

/**
 * Probe all sources in parallel and return rankings
 */
export const probeAllSources = async (tmdbId = '299534'): Promise<SourceHealth[]> => {
  const sources = getAvailableSources();
  const results = await Promise.all(sources.map(s => probeSource(s, tmdbId)));
  loadHealth();
  return sources.map((s, i) => ({
    ...healthMap[s],
    latency: results[i].latency,
    healthy: results[i].healthy,
  }));
};

/**
 * Get adaptive source based on device/network context
 */
export const getAdaptiveSource = (excludeSources: number[] = []): number => {
  loadHealth();

  // Factor in device type and connection
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  const connection = (navigator as any).connection;
  const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

  const ranked = getRankedSources(excludeSources);

  if (ranked.length === 0) return 1;

  // On slow networks, prefer lighter providers (Vidnest/Videasy)
  if (isSlowNetwork) {
    const lightSources = ranked.filter(s => s === 2 || s === 3);
    if (lightSources.length > 0) return lightSources[0];
  }

  // On mobile, avoid premium-heavy sources unless they're fastest
  if (isMobile) {
    const cfg1 = healthMap[ranked[0]];
    if (cfg1 && cfg1.healthy) return ranked[0];
  }

  return ranked[0];
};

/**
 * Get health summary for admin display
 */
export const getHealthSummary = (): SourceHealth[] => {
  loadHealth();
  return getAvailableSources().map(s => healthMap[s]);
};

/**
 * Reset all health data
 */
export const resetHealthData = () => {
  healthMap = {};
  try { localStorage.removeItem(HEALTH_KEY); } catch { /* ignore */ }
  loadHealth();
};

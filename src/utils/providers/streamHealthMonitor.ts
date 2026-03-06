/**
 * Stream Health Monitor
 * Runs silently in the background, probing providers every few minutes.
 * Updates Smart Source Engine rankings automatically.
 */

import { probeAllSources, getHealthSummary, type SourceHealth } from './smartSourceEngine';
import { supabase } from '@/integrations/supabase/client';

const CHECK_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
let monitorInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

/**
 * Run a single health check cycle
 */
export const runHealthCheck = async (userId?: string): Promise<SourceHealth[]> => {
  const results = await probeAllSources();

  // Persist to Supabase for admin visibility (non-blocking)
  if (userId) {
    try {
      const inserts = results.map(r => ({
        provider_key: `source_${r.source}`,
        response_time_ms: r.latency === Infinity ? null : r.latency,
        is_healthy: r.healthy,
        error_message: r.healthy ? null : 'Failed health check',
        checked_by: userId,
      }));
      await supabase.from('stream_health_metrics').insert(inserts);
    } catch {
      // Non-critical — don't break the app
    }
  }

  return results;
};

/**
 * Start the background health monitor
 */
export const startHealthMonitor = (userId?: string) => {
  if (isRunning) return;
  isRunning = true;

  // Initial check after 10 seconds (don't block startup)
  setTimeout(() => {
    runHealthCheck(userId);
  }, 10_000);

  // Periodic checks
  monitorInterval = setInterval(() => {
    runHealthCheck(userId);
  }, CHECK_INTERVAL_MS);
};

/**
 * Stop the background health monitor
 */
export const stopHealthMonitor = () => {
  isRunning = false;
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
};

/**
 * Get the latest health data (from memory, no API call)
 */
export const getLatestHealth = (): SourceHealth[] => {
  return getHealthSummary();
};

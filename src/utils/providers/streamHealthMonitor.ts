/**
 * Stream Health Monitor
 * Runs silently in the background, probing providers every few minutes.
 * Updates Smart Source Engine rankings automatically.
 */

import { probeAllSources, getHealthSummary, type SourceHealth } from './smartSourceEngine';
import { supabase } from '@/integrations/supabase/client';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
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

      // Maintain aggregate provider metrics used by ranking and admin dashboards
      await Promise.all(results.map(async (r) => {
        const providerKey = `source_${r.source}`;
        const { data: existing } = await (supabase as any)
          .from('stream_provider_health')
          .select('*')
          .eq('provider_key', providerKey)
          .maybeSingle();

        const checks = Number(existing?.checks_count || 0) + 1;
        const successes = Number(existing?.success_count || 0) + (r.healthy ? 1 : 0);
        const failures = Number(existing?.failure_count || 0) + (r.healthy ? 0 : 1);
        const consecutiveFailures = r.healthy
          ? 0
          : Number(existing?.consecutive_failures || 0) + 1;
        const prevAvg = Number(existing?.avg_latency_ms || 0);
        const latestLatency = Number.isFinite(r.latency) ? r.latency : prevAvg;
        const avgLatency = checks === 1 ? latestLatency : Math.round(((prevAvg * (checks - 1)) + latestLatency) / checks);

        await (supabase as any).from('stream_provider_health').upsert({
          provider_key: providerKey,
          checks_count: checks,
          success_count: successes,
          failure_count: failures,
          success_rate: checks > 0 ? Number((successes / checks).toFixed(4)) : 0,
          avg_latency_ms: avgLatency,
          consecutive_failures: consecutiveFailures,
          is_healthy: consecutiveFailures < 3,
          last_checked: new Date().toISOString(),
        }, { onConflict: 'provider_key' });
      }));
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

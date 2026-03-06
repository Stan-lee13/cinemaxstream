import { supabase } from '@/integrations/supabase/client';
import { getAvailableSources, getStreamingUrlForSource } from './providerUtils';

export interface SourceDiscoveryResult {
  content_id: string;
  provider: string;
  source: number;
  latency_ms: number | null;
  quality: string | null;
  is_available: boolean;
  last_checked: string;
}

const DISCOVERY_TTL_MS = 10 * 60 * 1000;

export const probeSourceAvailability = async (
  contentId: string,
  source: number,
  contentType: string
): Promise<SourceDiscoveryResult> => {
  const started = performance.now();
  const url = getStreamingUrlForSource(contentId, source, { contentType });

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      referrerPolicy: 'origin',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return {
      content_id: contentId,
      provider: `source_${source}`,
      source,
      latency_ms: Math.round(performance.now() - started),
      quality: 'unknown',
      is_available: true,
      last_checked: new Date().toISOString(),
    };
  } catch {
    return {
      content_id: contentId,
      provider: `source_${source}`,
      source,
      latency_ms: null,
      quality: null,
      is_available: false,
      last_checked: new Date().toISOString(),
    };
  }
};

export const discoverSourcesForContent = async (
  contentId: string,
  contentType: string = 'movie'
): Promise<SourceDiscoveryResult[]> => {
  const results = await Promise.all(
    getAvailableSources().map((source) => probeSourceAvailability(contentId, source, contentType))
  );

  try {
    await (supabase as any).from('stream_sources').upsert(
      results.map((r) => ({
        content_id: r.content_id,
        provider: r.provider,
        source: r.source,
        latency_ms: r.latency_ms,
        quality: r.quality,
        is_available: r.is_available,
        last_checked: r.last_checked,
      })),
      { onConflict: 'content_id,provider' }
    );
  } catch {
    // Keep runtime resilient if table isn't present in older envs.
  }

  return results;
};

export const getDiscoveredSources = async (contentId: string): Promise<SourceDiscoveryResult[]> => {
  try {
    const { data } = await (supabase as any)
      .from('stream_sources')
      .select('*')
      .eq('content_id', contentId)
      .gte('last_checked', new Date(Date.now() - DISCOVERY_TTL_MS).toISOString())
      .order('is_available', { ascending: false })
      .order('latency_ms', { ascending: true });

    return (data || []) as SourceDiscoveryResult[];
  } catch {
    return [];
  }
};

export const getBestDiscoveredSource = async (contentId: string, contentType: string): Promise<number | null> => {
  const cached = await getDiscoveredSources(contentId);
  if (cached.length > 0) {
    const firstAvailable = cached.find((x) => x.is_available);
    return firstAvailable ? firstAvailable.source : null;
  }

  const discovered = await discoverSourcesForContent(contentId, contentType);
  const firstAvailable = discovered
    .filter((x) => x.is_available)
    .sort((a, b) => (a.latency_ms ?? 99999) - (b.latency_ms ?? 99999))[0];
  return firstAvailable?.source ?? null;
};

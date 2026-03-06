export const probeProviderUrl = async (url: string): Promise<{ healthy: boolean; latency: number }> => {
  const started = performance.now();
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
    return { healthy: true, latency: Math.round(performance.now() - started) };
  } catch {
    return { healthy: false, latency: Math.round(performance.now() - started) };
  }
};

export const clampInt = (v?: number | null, fallback = 1): number =>
  typeof v === 'number' && !Number.isNaN(v) && v >= 1 ? Math.floor(v) : fallback;

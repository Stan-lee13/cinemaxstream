import { supabase } from '@/integrations/supabase/client';

let torrentInterval: ReturnType<typeof setInterval> | null = null;

const TORRENT_TO_HTTP_APIS = [
  'https://torrent2http.xyz/convert',
  'https://api.offcloud.com/api/remote'
];

const tryConvertTorrent = async (magnet: string): Promise<string | null> => {
  for (const endpoint of TORRENT_TO_HTTP_APIS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnet }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const direct = data?.download_url || data?.url || data?.link;
      if (typeof direct === 'string' && direct.startsWith('http')) {
        return direct;
      }
    } catch {
      continue;
    }
  }
  return null;
};

export const runTorrentConversionCycle = async (): Promise<void> => {
  const { data: torrents } = await (supabase as any)
    .from('download_sources')
    .select('*')
    .eq('source_type', 'torrent')
    .limit(25);

  const list = (torrents || []) as Array<{ tmdb_id: string; provider: string; download_url: string }>;

  await Promise.all(list.map(async (t) => {
    const converted = await tryConvertTorrent(t.download_url);
    if (!converted) return;

    const head = await fetch(converted, { method: 'HEAD' }).catch(() => null);
    const isValid = !!head && head.ok;

    await (supabase as any).from('download_sources').upsert({
      tmdb_id: t.tmdb_id,
      provider: `${t.provider}_http`,
      source_type: 'torrent_http',
      download_url: converted,
      is_valid: isValid,
      last_verified_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id,provider,download_url' });
  }));
};

export const startTorrentConversionWorker = () => {
  if (torrentInterval) return;
  runTorrentConversionCycle().catch(() => undefined);
  torrentInterval = setInterval(() => {
    runTorrentConversionCycle().catch(() => undefined);
  }, 10 * 60 * 1000);
};

export const stopTorrentConversionWorker = () => {
  if (torrentInterval) {
    clearInterval(torrentInterval);
    torrentInterval = null;
  }
};

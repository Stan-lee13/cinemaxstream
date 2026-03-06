import { tmdbApi } from './tmdbApi';
import { supabase } from '@/integrations/supabase/client';

let releaseRadarInterval: ReturnType<typeof setInterval> | null = null;

const toCanonicalType = (type: string | undefined): string => {
  if (!type) return 'movie';
  if (type === 'series' || type === 'tv') return 'tv';
  return 'movie';
};

const toReleaseDate = (year?: string): string | null => {
  if (!year) return null;
  if (/^\d{4}$/.test(year)) return `${year}-01-01`;
  const d = new Date(year);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

export const runReleaseRadarCycle = async (): Promise<void> => {
  const [movies, shows] = await Promise.all([
    tmdbApi.getPopularMovies(1),
    tmdbApi.getPopularTvShows(1),
  ]);

  const releases = [...movies, ...shows].slice(0, 40);

  await Promise.all(releases.map(async (item) => {
    const tmdbId = String(item.id);
    await (supabase as any).from('release_radar').upsert({
      tmdb_id: tmdbId,
      content_type: toCanonicalType(item.type),
      title: item.title,
      release_date: toReleaseDate(item.year),
      last_scanned_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id' });

    // Async download discovery pipeline: AI URL generation + scraper resolution
    const searchQuery = `${item.title} ${item.year || ''}`.trim();
    const aiRes = await supabase.functions.invoke('ai-download-search', {
      body: { searchQuery, contentType: toCanonicalType(item.type) }
    });

    const nkiriUrl = aiRes.data?.nkiriUrl as string | undefined;
    if (!nkiriUrl) return;

    const scrapeRes = await supabase.functions.invoke('nkiri-scraper', {
      body: { url: nkiriUrl }
    });

    const downloadLink = scrapeRes.data?.downloadLink as string | undefined;
    if (!downloadLink) return;

    const head = await fetch(downloadLink, { method: 'HEAD' }).catch(() => null);
    const isValid = !!head && head.ok;

    await (supabase as any).from('download_sources').upsert({
      tmdb_id: tmdbId,
      provider: 'nkiri',
      source_type: 'direct',
      download_url: downloadLink,
      quality: scrapeRes.data?.quality || null,
      file_size: scrapeRes.data?.fileSize || null,
      is_valid: isValid,
      last_verified_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id,provider,download_url' });
  }));
};

export const startReleaseRadarEngine = () => {
  if (releaseRadarInterval) return;

  runReleaseRadarCycle().catch(() => undefined);
  releaseRadarInterval = setInterval(() => {
    runReleaseRadarCycle().catch(() => undefined);
  }, 30 * 60 * 1000);
};

export const stopReleaseRadarEngine = () => {
  if (releaseRadarInterval) {
    clearInterval(releaseRadarInterval);
    releaseRadarInterval = null;
  }
};

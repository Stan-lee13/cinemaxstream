import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play, Clock, Download as DownloadIcon, Calendar,
  Award, Star, Flame, Zap, ChevronLeft, ChevronRight,
  Share2, Download, Heart, Image as ImageIcon
} from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import html2canvas from 'html2canvas';

// ── Types ──────────────────────────────────────────────
interface WrapData {
  totalMinutes: number;
  totalTitles: number;
  topGenre: string;
  topTitles: { title: string; count: number; minutes: number; poster?: string }[];
  longestBingeSession: number;
  mostActiveDay: string;
  bingeStreak: number;
  completionRate: number;
  personalityTitle: string;
  personalityComment: string;
  downloadsCount: number;
  favoritesCount: number;
  activeDays: number;
  monthlyTrend: { month: string; count: number }[];
}

const emptyWrap: WrapData = {
  totalMinutes: 0, totalTitles: 0, topGenre: 'N/A',
  topTitles: [], longestBingeSession: 0, mostActiveDay: 'N/A',
  bingeStreak: 0, completionRate: 0, personalityTitle: '',
  personalityComment: '', downloadsCount: 0, favoritesCount: 0,
  activeDays: 0, monthlyTrend: [],
};

// ── Personality Engine ─────────────────────────────────
function computePersonality(data: {
  totalMinutes: number; activeDays: number; completionRate: number;
  bingeStreak: number; topGenre: string; titlesWatched: number;
}): { title: string; comment: string; emoji: string } {
  const { totalMinutes, activeDays, completionRate, bingeStreak, topGenre, titlesWatched } = data;

  if (bingeStreak >= 5) return { emoji: '🔥', title: 'Binge Machine', comment: `${bingeStreak} days in a row — no one can stop you.` };
  if (completionRate >= 80) return { emoji: '🏁', title: 'The Finisher', comment: "You don't start stories — you finish them." };
  if (totalMinutes > 3000) return { emoji: '🎬', title: 'Cinema Addict', comment: `${Math.round(totalMinutes / 60)} hours watched. That's dedication.` };
  if (activeDays >= 20) return { emoji: '📅', title: 'Daily Watcher', comment: 'You showed up almost every day this period.' };

  const g = topGenre.toLowerCase();
  if (g.includes('anime')) return { emoji: '⚔️', title: 'Anime Sensei', comment: 'Your anime knowledge is over 9000.' };
  if (g.includes('horror')) return { emoji: '👻', title: 'Horror Hound', comment: 'You face your fears — one movie at a time.' };
  if (g.includes('action')) return { emoji: '💥', title: 'Adrenaline Junkie', comment: 'Explosions, chases, fights — your comfort zone.' };
  if (g.includes('comedy')) return { emoji: '😂', title: 'Comedy Commander', comment: "Laughter is the best medicine, and you're stocked up." };
  if (g.includes('thriller')) return { emoji: '🕵️', title: 'Thriller Strategist', comment: 'You live for the plot twist.' };
  if (g.includes('drama')) return { emoji: '🎭', title: 'Drama Architect', comment: 'You live for the emotional rollercoaster.' };
  if (g.includes('documentary')) return { emoji: '🧠', title: 'Knowledge Seeker', comment: 'You watch to learn. Respect.' };

  if (titlesWatched >= 10) return { emoji: '🌟', title: 'Explorer', comment: 'You watch a bit of everything. Eclectic taste.' };
  if (titlesWatched > 0) return { emoji: '🍿', title: 'Casual Viewer', comment: 'Quality over quantity. We get it.' };
  return { emoji: '👋', title: 'New Here', comment: 'Start watching to unlock your personality!' };
}

// ── Data processing ────────────────────────────────────
function processWrapData(
  sessions: any[], downloads: any[], favorites: any[]
): WrapData {
  const s = sessions || [];
  const totalSeconds = s.reduce((sum: number, sess: any) => sum + (sess.total_watched_time || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const titleData: Record<string, { count: number; minutes: number }> = {};
  s.forEach((sess: any) => {
    const t = sess.content_title || `Content ${sess.content_id}`;
    if (!titleData[t]) titleData[t] = { count: 0, minutes: 0 };
    titleData[t].count += 1;
    titleData[t].minutes += Math.round((sess.total_watched_time || 0) / 60);
  });
  const sorted = Object.entries(titleData).sort((a, b) => b[1].minutes - a[1].minutes);

  const daySet = new Set(s.map((sess: any) => sess.created_at?.split('T')[0]).filter(Boolean));
  const activeDays = daySet.size;

  // Binge streak
  const sortedDays = [...daySet].sort();
  let maxStreak = sortedDays.length >= 1 ? 1 : 0;
  let currentStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = (new Date(sortedDays[i]).getTime() - new Date(sortedDays[i - 1]).getTime()) / 86400000;
    if (diff === 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
    else currentStreak = 1;
  }

  // Most active day
  const dayCounts: Record<string, number> = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  s.forEach((sess: any) => {
    const d = new Date(sess.created_at || '');
    const name = dayNames[d.getDay()];
    dayCounts[name] = (dayCounts[name] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Longest single session
  const longestBingeSession = Math.round(Math.max(0, ...s.map((sess: any) => sess.total_watched_time || 0)) / 60);

  // Completion rate
  const withDuration = s.filter((sess: any) => sess.content_duration && sess.content_duration > 0);
  const completed = withDuration.filter((sess: any) => ((sess.total_watched_time || 0) / (sess.content_duration || 1)) >= 0.7);
  const completionRate = withDuration.length > 0 ? Math.round((completed.length / withDuration.length) * 100) : 0;

  // topGenre will be resolved after TMDB lookup
  const topGenre = s.length > 0 ? 'Mixed' : 'N/A';

  const personality = computePersonality({
    totalMinutes, activeDays, completionRate,
    bingeStreak: maxStreak, topGenre, titlesWatched: Object.keys(titleData).length,
  });

  return {
    totalMinutes, totalTitles: Object.keys(titleData).length,
    topGenre, downloadsCount: (downloads || []).length,
    favoritesCount: (favorites || []).length, activeDays,
    topTitles: sorted.slice(0, 5).map(([t, d]) => ({ title: t, count: d.count, minutes: d.minutes })),
    longestBingeSession, mostActiveDay, bingeStreak: maxStreak,
    completionRate, personalityTitle: `${personality.emoji} ${personality.title}`,
    personalityComment: personality.comment, monthlyTrend: [],
  };
}

// ── Animated counter ───────────────────────────────────
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

// ── Slide components ───────────────────────────────────
const slideTransition = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3 } },
};

function SlideMinutes({ data, label }: { data: WrapData; label: string }) {
  return (
    <motion.div {...slideTransition} className="flex flex-col items-center justify-center h-full text-center px-6 gap-6">
      <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 text-sm px-4 py-1">
        {label}
      </Badge>
      <div className="text-7xl sm:text-9xl font-black bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        <AnimatedCounter value={data.totalMinutes} />
      </div>
      <p className="text-xl text-muted-foreground">minutes watched</p>
      <div className="flex gap-6 text-muted-foreground text-sm">
        <span className="flex items-center gap-1"><Play className="h-4 w-4" />{data.totalTitles} titles</span>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{data.activeDays} active days</span>
      </div>
    </motion.div>
  );
}

function SlideTopTitles({ data }: { data: WrapData }) {
  return (
    <motion.div {...slideTransition} className="flex flex-col items-center justify-center h-full px-6 gap-6">
      <h2 className="text-3xl font-bold flex items-center gap-2"><Star className="h-7 w-7 text-amber-400" />Your Top Titles</h2>
      <div className="w-full max-w-md space-y-3">
        {data.topTitles.length > 0 ? data.topTitles.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-4 bg-white/5 rounded-xl p-3"
          >
            <span className="text-2xl font-black text-muted-foreground w-8 text-center">#{i + 1}</span>
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.title}
                className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Play className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.minutes} min · {item.count} sessions</p>
            </div>
          </motion.div>
        )) : (
          <p className="text-muted-foreground text-center">No watch data yet</p>
        )}
      </div>
    </motion.div>
  );
}

function SlideGenre({ data }: { data: WrapData }) {
  const stats = [
    { icon: Clock, value: `${Math.round(data.totalMinutes / 60)}h`, label: 'Watch Time' },
    { icon: Flame, value: `${data.bingeStreak}`, label: 'Day Streak' },
    { icon: Zap, value: `${data.completionRate}%`, label: 'Completion' },
    { icon: DownloadIcon, value: `${data.downloadsCount}`, label: 'Downloads' },
  ];

  return (
    <motion.div {...slideTransition} className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <h2 className="text-3xl font-bold">Your Stats</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white/5 rounded-2xl p-5 text-center"
          >
            <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Most active day: <strong className="text-foreground">{data.mostActiveDay}</strong></p>
        <p className="text-muted-foreground text-sm">Longest session: <strong className="text-foreground">{data.longestBingeSession} min</strong></p>
      </div>
    </motion.div>
  );
}

function SlidePersonality({ data }: { data: WrapData }) {
  const emoji = data.personalityTitle.split(' ')[0];
  const title = data.personalityTitle.slice(data.personalityTitle.indexOf(' ') + 1);

  return (
    <motion.div {...slideTransition} className="flex flex-col items-center justify-center h-full px-6 gap-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="text-8xl"
      >
        {emoji}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 text-lg px-6 py-2 mb-4">
          {title}
        </Badge>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-lg text-muted-foreground max-w-sm"
      >
        {data.personalityComment}
      </motion.p>
    </motion.div>
  );
}

function SlideSummary({ data, label, username }: { data: WrapData; label: string; username?: string }) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadImage = useCallback(async () => {
    if (!summaryRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `cinemaxstream-wrap-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // fallback: share text
    } finally {
      setIsExporting(false);
    }
  }, [label]);

  const handleShare = useCallback(async () => {
    if (!summaryRef.current) return;
    try {
      const canvas = await html2canvas(summaryRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], 'wrap.png', { type: 'image/png' })] })) {
          await navigator.share({
            title: `My ${label} Wrap`,
            files: [new File([blob], 'wrap.png', { type: 'image/png' })],
          });
        } else {
          const text = `🎬 My ${label} Wrap\n⏱️ ${data.totalMinutes} minutes watched\n🔥 ${data.bingeStreak} day streak\n${data.personalityTitle}\n\n#CineMaxStream`;
          if (navigator.share) {
            await navigator.share({ title: `My ${label} Wrap`, text });
          } else {
            await navigator.clipboard.writeText(text);
          }
        }
      }, 'image/png');
    } catch { /* user cancelled */ }
  }, [data, label]);

  // Find top title poster for background
  const topPoster = data.topTitles[0]?.poster;

  return (
    <motion.div {...slideTransition} className="flex flex-col items-center justify-center h-full px-6 gap-6">
      <div
        ref={summaryRef}
        className="w-full max-w-xs rounded-3xl p-6 text-center border border-white/10 shadow-2xl overflow-hidden relative"
        style={{ aspectRatio: '9/16', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1a0533, #2d1050, #0d1117)' }}
      >
        {topPoster && (
          <img src={topPoster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative z-10">
          <p className="text-xs text-white/60 uppercase tracking-widest mb-2">CineMaxStream</p>
          <h3 className="text-2xl font-black text-white">{label} Wrap</h3>
          {username && <p className="text-sm text-white/70 mt-1">@{username}</p>}
        </div>
        <div className="space-y-4 my-auto py-6 relative z-10">
          <div>
            <div className="text-5xl font-black text-white">{data.totalMinutes.toLocaleString()}</div>
            <p className="text-xs text-white/60">minutes watched</p>
          </div>
          <div className="flex justify-center gap-6 text-sm text-white/80">
            <span>{data.totalTitles} titles</span>
            <span>{data.completionRate}%</span>
          </div>
          <div className="text-4xl">{data.personalityTitle.split(' ')[0]}</div>
          <p className="text-sm font-bold text-white">{data.personalityTitle.slice(data.personalityTitle.indexOf(' ') + 1)}</p>
          {data.topGenre !== 'N/A' && (
            <p className="text-xs text-white/50">Top genre: {data.topGenre}</p>
          )}
        </div>
        <p className="text-[10px] text-white/40 relative z-10">cinemaxstream.com</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleDownloadImage} variant="outline" className="gap-2 border-white/10 hover:bg-white/5" disabled={isExporting}>
          <ImageIcon className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Download as Image'}
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────
const TOTAL_SLIDES = 5;

const Wrap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyData, setMonthlyData] = useState<WrapData>(emptyWrap);
  const [yearlyData, setYearlyData] = useState<WrapData>(emptyWrap);
  const [slide, setSlide] = useState(0);
  const [username, setUsername] = useState<string | undefined>();

  useEffect(() => { if (!user) return; fetchWrapData(); }, [user]);

  async function fetchWrapData() {
    if (!user) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const [
        { data: monthSessions }, { data: yearSessions },
        { data: monthDownloads }, { data: yearDownloads },
        { data: favorites }, { data: profile },
      ] = await Promise.all([
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('user_favorites').select('*').eq('user_id', user.id),
        supabase.from('user_profiles').select('username').eq('id', user.id).single(),
      ]);

      setUsername((profile as any)?.username || undefined);

      const mData = processWrapData(monthSessions || [], monthDownloads || [], favorites || []);
      const yData = processWrapData(yearSessions || [], yearDownloads || [], favorites || []);

      // Fetch TMDB posters + genres for top titles
      const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4626200399b08f9d04b72348e3625f15';
      const enrichTitles = async (titles: WrapData['topTitles']) => {
        const enriched = await Promise.all(titles.map(async (item) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(item.title)}&page=1`);
            const json = await res.json();
            const result = json.results?.[0];
            return {
              ...item,
              poster: result?.poster_path ? `https://image.tmdb.org/t/p/w300${result.poster_path}` : undefined,
              genreIds: result?.genre_ids || [],
            };
          } catch {
            return item;
          }
        }));
        return enriched;
      };

      // Resolve top genre from TMDB genre IDs
      const resolveTopGenre = (enrichedTitles: { genreIds?: number[] }[]) => {
        const GENRE_MAP: Record<number, string> = {
          28: 'Action', 12: 'Adventure', 16: 'Anime', 35: 'Comedy', 80: 'Crime',
          99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy',
          36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery',
          10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller',
          10752: 'War', 37: 'Western', 10759: 'Action', 10765: 'Sci-Fi',
          10768: 'War', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
          10766: 'Soap', 10767: 'Talk',
        };
        const genreCount: Record<string, number> = {};
        enrichedTitles.forEach(t => {
          (t.genreIds || []).forEach((id: number) => {
            const name = GENRE_MAP[id] || 'Other';
            genreCount[name] = (genreCount[name] || 0) + 1;
          });
        });
        const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
        return sorted[0]?.[0] || 'Mixed';
      };

      const [enrichedMonthly, enrichedYearly] = await Promise.all([
        enrichTitles(mData.topTitles),
        enrichTitles(yData.topTitles),
      ]);

      mData.topTitles = enrichedMonthly;
      mData.topGenre = enrichedMonthly.length > 0 ? resolveTopGenre(enrichedMonthly as any) : 'N/A';
      // Recompute personality with real genre
      const mPersonality = computePersonality({
        totalMinutes: mData.totalMinutes, activeDays: mData.activeDays,
        completionRate: mData.completionRate, bingeStreak: mData.bingeStreak,
        topGenre: mData.topGenre, titlesWatched: mData.totalTitles,
      });
      mData.personalityTitle = `${mPersonality.emoji} ${mPersonality.title}`;
      mData.personalityComment = mPersonality.comment;
      setMonthlyData(mData);

      yData.topTitles = enrichedYearly;
      yData.topGenre = enrichedYearly.length > 0 ? resolveTopGenre(enrichedYearly as any) : 'N/A';
      const yPersonality = computePersonality({
        totalMinutes: yData.totalMinutes, activeDays: yData.activeDays,
        completionRate: yData.completionRate, bingeStreak: yData.bingeStreak,
        topGenre: yData.topGenre, titlesWatched: yData.totalTitles,
      });
      yData.personalityTitle = `${yPersonality.emoji} ${yPersonality.title}`;
      yData.personalityComment = yPersonality.comment;

      // Monthly trend for yearly
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap: Record<string, number> = {};
      (yearSessions || []).forEach((s: any) => {
        const key = monthNames[new Date(s.created_at || '').getMonth()];
        trendMap[key] = (trendMap[key] || 0) + 1;
      });
      yData.monthlyTrend = monthNames.map(m => ({ month: m, count: trendMap[m] || 0 }));
      setYearlyData(yData);

      // Persist wrap snapshot to DB (upsert)
      const wrapMonth = now.getMonth() + 1;
      const wrapYear = now.getFullYear();
      await supabase.from('user_wraps' as any).upsert({
        user_id: user.id,
        month: wrapMonth,
        year: wrapYear,
        wrap_type: 'monthly',
        total_minutes: mData.totalMinutes,
        total_titles: mData.totalTitles,
        top_genre: mData.topGenre,
        top_titles: mData.topTitles,
        longest_binge_session: mData.longestBingeSession,
        most_active_day: mData.mostActiveDay,
        binge_streak: mData.bingeStreak,
        completion_rate: mData.completionRate,
        personality_title: mData.personalityTitle,
        personality_comment: mData.personalityComment,
        downloads_count: mData.downloadsCount,
        favorites_count: mData.favoritesCount,
        active_days: mData.activeDays,
      } as any, { onConflict: 'user_id,month,year,wrap_type' } as any);
    } catch (error) {
      console.error('Error fetching wrap data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const data = period === 'monthly' ? monthlyData : yearlyData;
  const periodLabel = period === 'monthly'
    ? new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    : `${new Date().getFullYear()}`;

  const hasData = data.totalTitles > 0 || data.downloadsCount > 0;

  const nextSlide = useCallback(() => setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1)), []);
  const prevSlide = useCallback(() => setSlide(s => Math.max(s - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextSlide, prevSlide]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Sign in to see your Wrap</h1>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) return <LoadingState message="Generating your wrap..." />;

  // Full-screen slide-based experience
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant={period === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setPeriod('monthly'); setSlide(0); }}
          >
            Monthly
          </Button>
          <Button
            variant={period === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setPeriod('yearly'); setSlide(0); }}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-2 px-4">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === slide ? 'w-8 bg-primary' : 'w-4 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-20">
        {!hasData ? (
          <div className="text-center px-6">
            <Flame className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Not Enough Data Yet</h2>
            <p className="text-muted-foreground mb-6">Start watching to build your wrap!</p>
            <Button onClick={() => navigate('/')}>Start Watching</Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {slide === 0 && <SlideMinutes key="minutes" data={data} label={periodLabel} />}
            {slide === 1 && <SlideTopTitles key="titles" data={data} />}
            {slide === 2 && <SlideGenre key="genre" data={data} />}
            {slide === 3 && <SlidePersonality key="personality" data={data} />}
            {slide === 4 && <SlideSummary key="summary" data={data} label={periodLabel} username={username} />}
          </AnimatePresence>
        )}
      </div>

      {/* Navigation arrows */}
      {hasData && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={prevSlide}
            disabled={slide === 0}
            className="rounded-full w-12 h-12 p-0 text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-sm text-muted-foreground">{slide + 1} / {TOTAL_SLIDES}</span>
          <Button
            variant="ghost"
            size="lg"
            onClick={nextSlide}
            disabled={slide === TOTAL_SLIDES - 1}
            className="rounded-full w-12 h-12 p-0 text-muted-foreground hover:text-foreground disabled:opacity-20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wrap;

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play, Clock, Film, Tv, Download, Heart, Calendar,
  TrendingUp, Award, BarChart3, Star, Flame, Zap
} from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WrapData {
  titlesWatched: number;
  totalWatchTimeMinutes: number;
  downloadsCount: number;
  favoritesCount: number;
  activeDays: number;
  topContentType: string;
  mostWatchedTitle: string;
  topTitles: { title: string; count: number; minutes: number }[];
  monthlyTrend: { month: string; count: number }[];
  completionRate: number;
  bingeStreak: number;
  personalityTitle: string;
  personalityComment: string;
}

const emptyWrap: WrapData = {
  titlesWatched: 0,
  totalWatchTimeMinutes: 0,
  downloadsCount: 0,
  favoritesCount: 0,
  activeDays: 0,
  topContentType: 'N/A',
  mostWatchedTitle: 'N/A',
  topTitles: [],
  monthlyTrend: [],
  completionRate: 0,
  bingeStreak: 0,
  personalityTitle: '',
  personalityComment: '',
};

// Personality engine — generates dynamic titles + commentary
function computePersonality(data: {
  totalMinutes: number;
  activeDays: number;
  completionRate: number;
  bingeStreak: number;
  topContentType: string;
  titlesWatched: number;
}): { title: string; comment: string } {
  const { totalMinutes, activeDays, completionRate, bingeStreak, topContentType, titlesWatched } = data;

  // Priority rules
  if (bingeStreak >= 5) return { title: '🔥 Binge Machine', comment: `${bingeStreak} days in a row — no one can stop you.` };
  if (completionRate >= 80) return { title: '🏁 The Finisher', comment: "You don't start stories — you finish them." };
  if (totalMinutes > 3000) return { title: '🎬 Cinema Addict', comment: `${Math.round(totalMinutes / 60)} hours watched. That's dedication.` };
  if (activeDays >= 20) return { title: '📅 Daily Watcher', comment: 'You showed up almost every day this period.' };

  // Genre-based
  const type = topContentType.toLowerCase();
  if (type.includes('anime')) return { title: '⚔️ Anime Sensei', comment: 'Your anime knowledge is over 9000.' };
  if (type.includes('horror')) return { title: '👻 Horror Hound', comment: 'You face your fears — one movie at a time.' };
  if (type.includes('action')) return { title: '💥 Adrenaline Junkie', comment: 'Explosions, chases, fights — your comfort zone.' };
  if (type.includes('comedy')) return { title: '😂 Comedy King', comment: 'Laughter is the best medicine, and you\'re stocked up.' };
  if (type.includes('drama')) return { title: '🎭 Drama Enthusiast', comment: 'You live for the emotional rollercoaster.' };
  if (type.includes('documentary')) return { title: '🧠 Knowledge Seeker', comment: 'You watch to learn. Respect.' };

  if (titlesWatched >= 10) return { title: '🌟 Explorer', comment: 'You watch a bit of everything. Eclectic taste.' };
  if (titlesWatched > 0) return { title: '🍿 Casual Viewer', comment: 'Quality over quantity. We get it.' };

  return { title: '👋 New Here', comment: 'Start watching to unlock your personality!' };
}

const Wrap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyData, setMonthlyData] = useState<WrapData>(emptyWrap);
  const [yearlyData, setYearlyData] = useState<WrapData>(emptyWrap);

  useEffect(() => {
    if (!user) return;
    fetchWrapData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchWrapData() {
    if (!user) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const [
        { data: monthSessions },
        { data: yearSessions },
        { data: monthDownloads },
        { data: yearDownloads },
        { data: favorites },
      ] = await Promise.all([
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('user_favorites').select('*').eq('user_id', user.id),
      ]);

      const processData = (
        sessions: typeof monthSessions,
        downloads: typeof monthDownloads,
        favs: typeof favorites
      ): WrapData => {
        const s = sessions || [];
        const totalSeconds = s.reduce((sum, sess) => sum + (sess.total_watched_time || 0), 0);
        const totalMinutes = Math.round(totalSeconds / 60);

        // Title counts + watch time per title
        const titleData: Record<string, { count: number; minutes: number }> = {};
        s.forEach(sess => {
          const t = sess.content_title || `Content ${sess.content_id}`;
          if (!titleData[t]) titleData[t] = { count: 0, minutes: 0 };
          titleData[t].count += 1;
          titleData[t].minutes += Math.round((sess.total_watched_time || 0) / 60);
        });
        const sorted = Object.entries(titleData).sort((a, b) => b[1].minutes - a[1].minutes);

        // Active days
        const daySet = new Set(s.map(sess => sess.created_at?.split('T')[0]).filter((d): d is string => !!d));
        const activeDays = daySet.size;

        // Binge streak (consecutive days)
        const sortedDays = [...daySet].sort();
        let maxStreak = 0;
        let currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
          if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }
        if (sortedDays.length === 1) maxStreak = 1;
        else maxStreak = Math.max(maxStreak, currentStreak);

        // Completion rate (sessions with content_duration > 0)
        const sessionsWithDuration = s.filter(sess => sess.content_duration && sess.content_duration > 0);
        const completedSessions = sessionsWithDuration.filter(sess => {
          const watchedRatio = (sess.total_watched_time || 0) / (sess.content_duration || 1);
          return watchedRatio >= 0.7;
        });
        const completionRate = sessionsWithDuration.length > 0
          ? Math.round((completedSessions.length / sessionsWithDuration.length) * 100)
          : 0;

        // Top content type (crude: use "Movies" as default since watch_sessions doesn't store genre)
        const topContentType = s.length > 0 ? 'Movies' : 'N/A';

        const personality = computePersonality({
          totalMinutes,
          activeDays,
          completionRate,
          bingeStreak: maxStreak,
          topContentType,
          titlesWatched: Object.keys(titleData).length,
        });

        return {
          titlesWatched: Object.keys(titleData).length,
          totalWatchTimeMinutes: totalMinutes,
          downloadsCount: (downloads || []).length,
          favoritesCount: (favs || []).length,
          activeDays,
          topContentType,
          mostWatchedTitle: sorted[0]?.[0] || 'N/A',
          topTitles: sorted.slice(0, 5).map(([t, d]) => ({ title: t, count: d.count, minutes: d.minutes })),
          monthlyTrend: [],
          completionRate,
          bingeStreak: maxStreak,
          personalityTitle: personality.title,
          personalityComment: personality.comment,
        };
      };

      const mData = processData(monthSessions, monthDownloads, favorites);
      setMonthlyData(mData);

      const yData = processData(yearSessions, yearDownloads, favorites);
      // Monthly trend for yearly
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap: Record<string, number> = {};
      (yearSessions || []).forEach(s => {
        const d = new Date(s.created_at || '');
        const key = monthNames[d.getMonth()];
        trendMap[key] = (trendMap[key] || 0) + 1;
      });
      yData.monthlyTrend = monthNames.map(m => ({ month: m, count: trendMap[m] || 0 }));
      setYearlyData(yData);
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

  const hasData = data.titlesWatched > 0 || data.downloadsCount > 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              Your Activity Wrap
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{periodLabel} Wrap</h1>
            <p className="text-muted-foreground">Your personalized streaming summary</p>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'monthly' | 'yearly')} className="mb-8">
            <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          {!hasData ? (
            <Card className="text-center p-12">
              <CardContent>
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Not Enough Data Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start watching content to build your wrap! We need real activity data to generate your summary.
                </p>
                <Button onClick={() => navigate('/')}>Start Watching</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Personality Card */}
              {data.personalityTitle && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/30">
                    <CardContent className="pt-6 text-center">
                      <div className="text-5xl mb-3">{data.personalityTitle.split(' ')[0]}</div>
                      <h2 className="text-2xl font-bold mb-2">{data.personalityTitle.slice(data.personalityTitle.indexOf(' ') + 1)}</h2>
                      <p className="text-muted-foreground">{data.personalityComment}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Main stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Play, value: data.titlesWatched, label: 'Titles Watched', color: 'text-primary' },
                  { icon: Clock, value: data.totalWatchTimeMinutes, label: 'Minutes Watched', color: 'text-blue-500' },
                  { icon: Download, value: data.downloadsCount, label: 'Downloads', color: 'text-emerald-500' },
                  { icon: Calendar, value: data.activeDays, label: 'Active Days', color: 'text-orange-500' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                        <motion.div
                          className="text-3xl font-bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          {stat.value}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Streak + Completion */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Flame className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div className="text-3xl font-bold">{data.bingeStreak}</div>
                    <p className="text-xs text-muted-foreground">Day Binge Streak</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    <div className="text-3xl font-bold">{data.completionRate}%</div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{data.favoritesCount} saved</p>
                  </CardContent>
                </Card>
              </div>

              {/* Most watched + top titles */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-amber-500" />
                      Most Watched
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{data.mostWatchedTitle}</p>
                  </CardContent>
                </Card>

                {data.topTitles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Star className="h-5 w-5 text-primary" />
                        Top Titles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.topTitles.map((item, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                          >
                            <span className="text-2xl font-bold text-muted-foreground w-8">#{i + 1}</span>
                            <div className="flex-1">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.minutes} min • {item.count} session{item.count !== 1 ? 's' : ''}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Monthly trend (yearly only) */}
              {period === 'yearly' && data.monthlyTrend.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Monthly Watch Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-32">
                      {data.monthlyTrend.map((m) => {
                        const maxCount = Math.max(...data.monthlyTrend.map(t => t.count), 1);
                        const height = (m.count / maxCount) * 100;
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">{m.count || ''}</span>
                            <motion.div
                              className="w-full bg-primary/80 rounded-t-sm min-h-[2px]"
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 2)}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            />
                            <span className="text-[10px] text-muted-foreground">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wrap;

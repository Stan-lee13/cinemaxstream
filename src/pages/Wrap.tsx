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
  TrendingUp, Award, BarChart3, Star, Flame
} from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';

interface WrapData {
  titlesWatched: number;
  totalWatchTimeMinutes: number;
  downloadsCount: number;
  favoritesCount: number;
  activeDays: number;
  topContentType: string;
  mostWatchedTitle: string;
  topTitles: { title: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
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
};

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
  }, [user]);

  const fetchWrapData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      // Fetch all data in parallel
      const [
        { data: monthSessions },
        { data: yearSessions },
        { data: monthDownloads },
        { data: yearDownloads },
        { data: favorites },
        { data: watchHistory }
      ] = await Promise.all([
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('watch_sessions').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', monthStart),
        supabase.from('download_requests').select('*').eq('user_id', user.id).gte('created_at', yearStart),
        supabase.from('user_favorites').select('*').eq('user_id', user.id),
        supabase.from('user_watch_history').select('*').eq('user_id', user.id).gte('created_at', yearStart)
      ]);

      // Process monthly
      const mSessions = monthSessions || [];
      const mTotalMinutes = mSessions.reduce((sum, s) => sum + (s.total_watched_time || 0), 0) / 60;
      const mTitleCounts: Record<string, number> = {};
      mSessions.forEach(s => {
        const title = s.content_title || `Content ${s.content_id}`;
        mTitleCounts[title] = (mTitleCounts[title] || 0) + 1;
      });
      const mSorted = Object.entries(mTitleCounts).sort((a, b) => b[1] - a[1]);
      const mActiveDays = new Set(mSessions.map(s => s.created_at?.split('T')[0])).size;

      setMonthlyData({
        titlesWatched: new Set(mSessions.map(s => s.content_id)).size,
        totalWatchTimeMinutes: Math.round(mTotalMinutes),
        downloadsCount: (monthDownloads || []).length,
        favoritesCount: (favorites || []).length,
        activeDays: mActiveDays,
        topContentType: mSessions.length > 0 ? 'Movies' : 'N/A',
        mostWatchedTitle: mSorted[0]?.[0] || 'N/A',
        topTitles: mSorted.slice(0, 5).map(([title, count]) => ({ title, count })),
        monthlyTrend: [],
      });

      // Process yearly
      const ySessions = yearSessions || [];
      const yTotalMinutes = ySessions.reduce((sum, s) => sum + (s.total_watched_time || 0), 0) / 60;
      const yTitleCounts: Record<string, number> = {};
      ySessions.forEach(s => {
        const title = s.content_title || `Content ${s.content_id}`;
        yTitleCounts[title] = (yTitleCounts[title] || 0) + 1;
      });
      const ySorted = Object.entries(yTitleCounts).sort((a, b) => b[1] - a[1]);
      const yActiveDays = new Set(ySessions.map(s => s.created_at?.split('T')[0])).size;

      // Monthly trend for yearly view
      const trendMap: Record<string, number> = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      ySessions.forEach(s => {
        const d = new Date(s.created_at || '');
        const key = monthNames[d.getMonth()];
        trendMap[key] = (trendMap[key] || 0) + 1;
      });

      setYearlyData({
        titlesWatched: new Set(ySessions.map(s => s.content_id)).size,
        totalWatchTimeMinutes: Math.round(yTotalMinutes),
        downloadsCount: (yearDownloads || []).length,
        favoritesCount: (favorites || []).length,
        activeDays: yActiveDays,
        topContentType: ySessions.length > 0 ? 'Movies' : 'N/A',
        mostWatchedTitle: ySorted[0]?.[0] || 'N/A',
        topTitles: ySorted.slice(0, 5).map(([title, count]) => ({ title, count })),
        monthlyTrend: monthNames.map(m => ({ month: m, count: trendMap[m] || 0 })),
      });
    } catch (error) {
      console.error('Error fetching wrap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* Main stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Play className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold">{data.titlesWatched}</div>
                    <p className="text-xs text-muted-foreground">Titles Watched</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-3xl font-bold">{data.totalWatchTimeMinutes}</div>
                    <p className="text-xs text-muted-foreground">Minutes Watched</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <div className="text-3xl font-bold">{data.downloadsCount}</div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-3xl font-bold">{data.activeDays}</div>
                    <p className="text-xs text-muted-foreground">Active Days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Most watched + favorites */}
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

              {/* Top 5 titles */}
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
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground w-8">#{i + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.count} session{item.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                            <div
                              className="w-full bg-primary/80 rounded-t-sm min-h-[2px]"
                              style={{ height: `${Math.max(height, 2)}%` }}
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
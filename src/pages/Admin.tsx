import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Users,
  TrendingUp,
  Shield,
  Ban,
  Crown,
  Search,
  RefreshCw,
  Clock,
  Zap,
  Activity,
  Server,
  Database,
  Layers,
  BarChart3,
  ChevronRight,
  Sparkles
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from "gsap";

const ADMIN_EMAIL = "stanleyvic13@gmail.com";

interface UserData {
  id: string;
  email?: string;
  created_at: string;
  role?: string;
  subscription_tier?: string | null;
  username?: string | null;
}

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  activeToday: number;
  newUsersThisWeek: number;
  watchSessions: number;
}

interface ContentData {
  id: string;
  title: string;
  content_type: string;
  created_at: string;
  is_trending_new: boolean | null;
  early_access_until: string | null;
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [content, setContent] = useState<ContentData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
    watchSessions: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      if (!user) navigate("/");
      else {
        toast.error("Level 5 Authorization required");
        navigate("/");
      }
      return;
    }
    setIsAuthorized(true);
    fetchData();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAuthorized && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.from(".admin-header", {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.from(".stat-card", {
          scale: 0.98,
          opacity: 0,
          y: 20,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out"
        });

        gsap.from(".admin-tab-content", {
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isAuthorized, isLoading, selectedTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: profiles } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      const { data: roles } = await supabase.from('user_roles').select('*');
      const { data: sessions } = await supabase.from('watch_sessions').select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: contentDataRaw } = await supabase.from('content').select('id, title, content_type, created_at, trending')
        .order('created_at', { ascending: false });

      const premiumCount = roles?.filter(r => r.role === 'premium').length || 0;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersCount = profiles?.filter(p => new Date(p.created_at) > weekAgo).length || 0;

      setAnalytics({
        totalUsers: profiles?.length || 0,
        premiumUsers: premiumCount,
        activeToday: sessions?.length || 0,
        newUsersThisWeek: newUsersCount,
        watchSessions: sessions?.length || 0
      });

      setUsers(profiles?.map(p => ({
        id: p.id,
        email: p.username || 'Unknown',
        created_at: p.created_at,
        role: roles?.find(r => r.user_id === p.id)?.role || 'free',
        username: p.username
      })) || []);

      setContent((contentDataRaw || []).map(c => ({
        id: c.id,
        title: c.title,
        content_type: c.content_type,
        created_at: c.created_at,
        is_trending_new: c.trending,
        early_access_until: null
      })));
    } catch (error) {
      toast.error("Nexus Link Failure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeUser = async (userId: string) => {
    try {
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'premium').single();
      if (existing) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'premium');
        toast.success("Node Downgraded");
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'premium' as const });
        toast.success("Node Elevated to Premium");
      }
      fetchData();
    } catch (error) {
      toast.error("Operation Failed");
    }
  };

  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (authLoading || isLoading) return <LoadingState message="Hyper-threading Nexus Core..." />;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-blue-500/30" ref={containerRef}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[5%] w-[40%] h-[40%] bg-blue-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[40%] h-[40%] bg-indigo-600/[0.03] rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="admin-header flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Shield size={18} className="text-blue-500" />
                </div>
                <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[9px]">Root Authorization</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-700">
                Nexus <span className="text-blue-500">Admin</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl">
                Real-time neural monitoring and global synchronization protocol.
              </p>
            </div>

            <button onClick={fetchData} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 group">
              <RefreshCw size={20} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Resync Core</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Neural Nodes', value: analytics.totalUsers, icon: Users, color: 'text-blue-400', sub: `+${analytics.newUsersThisWeek} New` },
              { label: 'Premium Sync', value: analytics.premiumUsers, icon: Crown, color: 'text-amber-400', sub: `${((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}% Ratio` },
              { label: 'Live Pulses', value: analytics.activeToday, icon: Activity, color: 'text-emerald-400', sub: 'Active Sessions' },
              { label: 'Grid Integrity', value: '100%', icon: Server, color: 'text-blue-500', sub: 'Status Optimal' },
            ].map((stat, i) => (
              <div key={i} className="stat-card p-8 rounded-[36px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`}>
                  <stat.icon size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl bg-white/5 ${stat.color} border border-current/20`}>
                      <stat.icon size={18} />
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
            <div className="flex justify-start">
              <TabsList className="bg-white/5 p-1.5 border border-white/5 rounded-2xl backdrop-blur-3xl h-auto">
                {['overview', 'users', 'analytics'].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-xl">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="admin-tab-content bg-[#111]/40 border border-white/5 rounded-[48px] p-8 md:p-12 backdrop-blur-3xl shadow-3xl">
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                        <Layers className="text-blue-500" />
                        Priority Nodes
                      </h3>
                      <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {users.slice(0, 6).map(u => (
                        <div key={u.id} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-black text-gray-400 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-white/5">
                              {u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors uppercase">{u.username || 'Anonymous'}</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <Badge className={u.role === 'premium' ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-gray-500 border-white/5'}>
                            {u.role.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                      <Database className="text-blue-500" />
                      Neural Pulse
                    </h3>
                    <div className="aspect-[16/10] rounded-[40px] bg-black/60 border border-white/5 p-12 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden relative group/pulse">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)] group-hover/pulse:scale-150 transition-transform duration-1000" />
                      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center relative">
                        <Zap className="text-blue-500 animate-pulse relative z-10" size={40} />
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-ping" />
                      </div>
                      <div className="font-black text-white uppercase tracking-tighter text-3xl">Engine Optimal</div>
                      <p className="text-gray-500 text-lg font-medium leading-relaxed">Monitoring {analytics.watchSessions} high-priority sync sessions across global nodes.</p>
                      <div className="flex gap-4">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Load: 12%</div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Latency: 14ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 p-10 rounded-[32px] border border-white/5 backdrop-blur-3xl">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Node Hierarchy</h3>
                    <p className="text-gray-500 text-sm font-medium">Search and manage global identities.</p>
                  </div>
                  <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <Input
                      placeholder="ENTER NODE ID OR ALIAS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 bg-white/5 border-white/10 h-16 rounded-[20px] font-black text-xs uppercase tracking-widest focus-visible:ring-blue-500 shadow-2xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-8 rounded-[40px] bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-8 hover:bg-white/[0.06] transition-all group/node shadow-xl">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-2xl shadow-inner">
                          {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-1">
                            <span className="font-black text-2xl text-white tracking-tight group-hover/node:text-blue-400 transition-colors uppercase">{u.username || 'Anonymous'}</span>
                            <Badge className={u.role === 'premium' ? 'bg-amber-500 text-black font-black uppercase tracking-widest text-[8px]' : 'bg-gray-800 text-gray-400 font-black uppercase tracking-widest text-[8px]'}>
                              {u.role}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clock size={12} className="text-gray-700" />
                            {u.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => handleUpgradeUser(u.id)} className="px-8 py-3.5 rounded-2xl bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">
                          Recalibrate Tier
                        </button>
                        <button onClick={() => handleBanUser(u.id)} className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group/ban shadow-xl active:scale-95">
                          <Ban size={22} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-10 rounded-[40px] bg-white/5 border border-white/5 space-y-10 shadow-2xl">
                    <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                      <TrendingUp className="text-emerald-500" />
                      Sync Frequency
                    </h4>
                    <div className="h-72 flex flex-col justify-end gap-2">
                      <div className="flex items-end justify-between h-full gap-5 px-4">
                        {[30, 50, 40, 70, 45, 90, 60].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/10 rounded-t-2xl relative group/bar">
                            <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-2xl transition-all duration-1000 group-hover/bar:bg-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-gray-700 uppercase tracking-widest pt-6 border-t border-white/5 mt-4">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 rounded-[40px] bg-white/5 border border-white/5 space-y-10 shadow-2xl">
                    <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                      <BarChart3 className="text-amber-500" />
                      Core Saturation
                    </h4>
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 px-1">
                          <span>Premium Density</span>
                          <span className="text-amber-500">{((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${(analytics.premiumUsers / analytics.totalUsers) * 100}%` }} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1 px-1">
                          <span>Pulse Activity</span>
                          <span className="text-blue-500">{((analytics.activeToday / analytics.totalUsers) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ width: `${(analytics.activeToday / analytics.totalUsers) * 100}%` }} />
                        </div>
                      </div>
                      <div className="p-6 rounded-[28px] bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles size={16} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Nexus Tip</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed italic">System response time is optimized. 4 new nodes are currently queued for terminal elevation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
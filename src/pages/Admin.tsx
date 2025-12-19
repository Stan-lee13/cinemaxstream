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
  Sparkles,
  Trash2,
  AtSign,
  User,
  X
} from "lucide-react";
import { Label } from "@/components/ui/label";
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
  totalContent: number;
}

interface ContentData {
  id: string;
  title: string;
  content_type: string;
  created_at: string;
  trending: boolean | null;
  popular: boolean | null;
  featured: boolean | null;
  image_url: string | null;
}

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [content, setContent] = useState<ContentData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
    watchSessions: 0,
    totalContent: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Add Content State
  const [newContent, setNewContent] = useState({
    title: "",
    content_type: "movie",
    year: new Date().getFullYear().toString(),
    rating: "8.0",
    image_url: ""
  });

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
        gsap.from(".admin-header", { y: -20, opacity: 0, duration: 0.4, ease: "power2.out" });
        gsap.from(".stat-card", { scale: 0.98, opacity: 0, y: 20, duration: 0.3, stagger: 0.05, ease: "power2.out" });
        gsap.from(".admin-tab-content", { opacity: 0, y: 10, duration: 0.3, ease: "power2.out" });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isAuthorized, isLoading, selectedTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: profiles },
        { data: roles },
        { data: sessions },
        { data: contentData },
        { data: submissionData }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('watch_sessions').select('id, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      ]);

      const premiumCount = roles?.filter(r => r.role === 'premium').length || 0;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersCount = profiles?.filter(p => new Date(p.created_at) > weekAgo).length || 0;

      setAnalytics({
        totalUsers: profiles?.length || 0,
        premiumUsers: premiumCount,
        activeToday: sessions?.length || 0,
        newUsersThisWeek: newUsersCount,
        watchSessions: sessions?.length || 0,
        totalContent: contentData?.length || 0
      });

      setUsers(profiles?.map(p => ({
        id: p.id,
        email: p.username || 'Unknown',
        created_at: p.created_at,
        role: roles?.find(r => r.user_id === p.id)?.role || 'free',
        username: p.username
      })) || []);

      setContent((contentData || []).map(c => ({
        id: c.id,
        title: c.title,
        content_type: c.content_type,
        created_at: c.created_at,
        trending: c.trending,
        popular: c.popular,
        featured: c.featured,
        image_url: c.image_url
      })));
      setSubmissions(submissionData || []);
    } catch (error) {
      toast.error("Nexus Link Failure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeUser = async (userId: string) => {
    try {
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'premium').maybeSingle();
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

  const handleBanUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("Cannot restrict root node");
      return;
    }
    try {
      await supabase.from('user_roles').upsert({ user_id: userId, role: 'free' as const });
      toast.success("Node Restricted");
      fetchData();
    } catch (error) {
      toast.error("Operation Failed");
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success("Content purged from library");
      fetchData();
    } catch (error) {
      toast.error("Purge Failed");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
      if (error) throw error;
      toast.success("Transmission data cleared");
      fetchData();
    } catch (error) {
      toast.error("Clear Failed");
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title) return;
    try {
      const { error } = await supabase.from('content').insert(newContent);
      if (error) throw error;
      toast.success("New content synchronized");
      setNewContent({ title: "", content_type: "movie", year: "2024", rating: "8.0", image_url: "" });
      fetchData();
    } catch (error) {
      toast.error("Sync Failed");
    }
  };

  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredContent = content.filter(c => c.title.toLowerCase().includes(contentSearch.toLowerCase()));

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
                <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">Root Authorization Required</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-700">
                Nexus <span className="text-blue-500">Admin</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl">
                Global synchronization hub for neural nodes, content streams, and support uplinks.
              </p>
            </div>

            <button onClick={fetchData} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 group shadow-2xl">
              <RefreshCw size={20} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Resync Nexus</span>
            </button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
            <div className="flex justify-start overflow-x-auto pb-4 hide-scrollbar">
              <TabsList className="bg-white/5 p-1.5 border border-white/5 rounded-2xl backdrop-blur-3xl h-auto flex gap-1">
                {['overview', 'users', 'content', 'support', 'analytics'].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shadow-xl">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="admin-tab-content bg-[#111]/40 border border-white/5 rounded-[48px] p-8 md:p-12 backdrop-blur-3xl shadow-3xl">
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  {[
                    { label: 'Neural Nodes', value: analytics.totalUsers, icon: Users, color: 'text-blue-400', sub: `+${analytics.newUsersThisWeek} New` },
                    { label: 'Premium Sync', value: analytics.premiumUsers, icon: Crown, color: 'text-amber-400', sub: `${((analytics.premiumUsers / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}% Ratio` },
                    { label: 'Content Units', value: analytics.totalContent, icon: Layers, color: 'text-purple-400', sub: 'Total Records' },
                    { label: 'Grid Integrity', value: '100%', icon: Server, color: 'text-emerald-500', sub: 'Status Optimal' },
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                        <Users className="text-blue-500" /> Recent Nodes
                      </h3>
                      <button onClick={() => setSelectedTab('users')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Manage All</button>
                    </div>
                    <div className="space-y-4">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-black text-gray-500">
                              {u.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-black text-white text-md uppercase">{u.username || 'Anonymous'}</div>
                              <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{u.role} node</div>
                            </div>
                          </div>
                          <Badge className={u.role === 'premium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-gray-500'}>
                            {u.role?.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                      <Activity className="text-emerald-500" /> Pulse Monitor
                    </h3>
                    <div className="aspect-video rounded-[40px] bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden group/monitor">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)] group-hover/monitor:scale-150 transition-transform duration-1000" />
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative">
                        <Activity className="text-emerald-500 animate-pulse" size={40} />
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-10 animate-ping" />
                      </div>
                      <div className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Core Optimal</div>
                      <p className="text-gray-500 font-medium">Monitoring {analytics.activeToday} live data transmissions.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      placeholder="SEARCH NODE ID OR ALIAS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl text-xs uppercase font-black"
                    />
                  </div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filteredUsers.length} Nodes Synchronized</div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-8 rounded-[40px] bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-2xl border border-blue-500/20 shadow-inner">
                          {u.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-black text-2xl uppercase tracking-tighter text-white">{u.username || 'Anonymous'}</span>
                            <Badge className={u.role === 'premium' ? 'bg-amber-500 text-black font-black' : 'bg-gray-800 text-gray-400'}>{u.role}</Badge>
                          </div>
                          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">ID: {u.id}</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={() => handleUpgradeUser(u.id)} className="px-8 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all">
                          Recalibrate Node
                        </Button>
                        <Button onClick={() => handleBanUser(u.id)} variant="destructive" className="w-12 h-12 rounded-2xl p-0 hover:bg-red-600 transition-all">
                          <Ban size={20} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                      <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          placeholder="SEARCH CONTENT LIBRARY..."
                          value={contentSearch}
                          onChange={(e) => setContentSearch(e.target.value)}
                          className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl text-xs uppercase font-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredContent.map(c => (
                        <div key={c.id} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-28 rounded-2xl bg-gray-900 border border-white/5 overflow-hidden shrink-0 shadow-2xl">
                              <img src={c.image_url || 'https://via.placeholder.com/300x450'} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div>
                              <h4 className="font-black text-xl uppercase tracking-tighter mb-1 line-clamp-1">{c.title}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-blue-500/10 text-blue-500 uppercase text-[8px] font-black">{c.content_type}</Badge>
                                {c.trending && <Badge className="bg-emerald-500/10 text-emerald-500 uppercase text-[8px] font-black italic">Trending</Badge>}
                              </div>
                              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">ID: {c.id}</div>
                            </div>
                          </div>
                          <Button onClick={() => handleDeleteContent(c.id)} variant="ghost" className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-2xl h-14 w-14">
                            <Trash2 size={22} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-10 rounded-[40px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                        <Sparkles className="text-blue-500" /> Sync Content
                      </h3>
                      <form onSubmit={handleAddContent} className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</Label>
                          <Input value={newContent.title} onChange={(e) => setNewContent({ ...newContent, title: e.target.value })} className="bg-white/5 border-white/5 rounded-2xl h-12" placeholder="MATRIX REVOLUTIONS..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</Label>
                            <select value={newContent.content_type} onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value })} className="w-full bg-white/5 border-white/5 border rounded-2xl h-12 px-4 text-sm font-bold appearance-none outline-none focus:border-blue-500/50">
                              <option value="movie">MOVIE</option>
                              <option value="series">SERIES</option>
                              <option value="anime">ANIME</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Year</Label>
                            <Input value={newContent.year} onChange={(e) => setNewContent({ ...newContent, year: e.target.value })} className="bg-white/5 border-white/5 rounded-2xl h-12" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Poster URL</Label>
                          <Input value={newContent.image_url} onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })} className="bg-white/5 border-white/5 rounded-2xl h-12" />
                        </div>
                        <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[20px] shadow-2xl shadow-blue-500/20 transition-all active:scale-95">
                          Inject into Core
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-0 space-y-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Support Uplinks</h3>
                  <Badge className="bg-blue-600 text-white font-black uppercase tracking-widest px-4 py-1.5">{submissions.length} Transmission Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submissions.map(s => (
                    <div key={s.id} className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 relative group overflow-hidden hover:bg-white/[0.05] transition-all">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <AtSign size={100} />
                      </div>
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <User className="text-blue-500" size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-xl uppercase tracking-tighter text-white">{s.name}</h4>
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">{s.email}</div>
                          </div>
                        </div>
                        <Button onClick={() => handleDeleteSubmission(s.id)} variant="ghost" className="text-red-500/30 hover:text-red-500 rounded-xl">
                          <X size={20} />
                        </Button>
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">
                          {s.subject}
                        </div>
                        <p className="text-gray-400 text-md font-medium leading-relaxed line-clamp-4 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                          {s.message}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                          <Clock size={12} />
                          Received {new Date(s.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-12 rounded-[48px] bg-white/[0.03] border border-white/5 space-y-10 shadow-2xl">
                    <h4 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 italic lg:text-3xl">
                      <TrendingUp className="text-emerald-500" /> Node Flux
                    </h4>
                    <div className="h-80 flex flex-col justify-end gap-3">
                      <div className="flex items-end justify-between h-full gap-6 px-4">
                        {(() => {
                          const days = [0, 0, 0, 0, 0, 0, 0];
                          users.forEach(u => {
                            const day = new Date(u.created_at).getDay();
                            days[day]++;
                          });
                          const max = Math.max(...days, 1);
                          return days.map((count, i) => (
                            <div key={i} className="flex-1 bg-blue-500/5 rounded-t-3xl relative group/bar">
                              <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-3xl transition-all duration-1000 group-hover/bar:bg-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                                style={{ height: `${(count / max) * 100}%` }} />
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[11px] font-black bg-white text-black px-2 py-1 rounded-lg">{count}</div>
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="flex justify-between text-[11px] font-black text-gray-700 uppercase tracking-[0.2em] pt-8 border-t border-white/5 mt-6">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d}>{d}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="p-12 rounded-[48px] bg-white/[0.03] border border-white/5 space-y-12 shadow-2xl">
                    <h4 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 italic lg:text-3xl">
                      <BarChart3 className="text-amber-500" /> Core Saturation
                    </h4>
                    <div className="space-y-12">
                      <div className="space-y-5">
                        <div className="flex justify-between text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">
                          <span>Premium Density</span>
                          <span className="text-amber-500">{((analytics.premiumUsers / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.4)]" style={{ width: `${(analytics.premiumUsers / Math.max(analytics.totalUsers, 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">
                          <span>Pulse Activity</span>
                          <span className="text-blue-500">{((analytics.activeToday / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden p-1 shadow-inner border border-white/5">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.4)]" style={{ width: `${(analytics.activeToday / Math.max(analytics.totalUsers, 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div className="p-10 rounded-[40px] bg-blue-500/[0.02] border border-blue-500/10 backdrop-blur-md relative overflow-hidden group/tip">
                        <div className="absolute inset-0 bg-blue-500/[0.01] group-hover/tip:bg-blue-500/[0.03] transition-all" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                          <Sparkles size={20} className="text-blue-500" />
                          <span className="text-xs font-black uppercase text-blue-500 tracking-[0.2em]">Neural Insight</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed italic relative z-10">
                          System response optimized. {analytics.totalUsers - analytics.premiumUsers} core nodes are currently eligible for priority terminal elevation.
                        </p>
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
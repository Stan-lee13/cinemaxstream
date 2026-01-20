import { useState, useEffect } from "react";
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

const ADMIN_EMAIL = "stanleyvic13@gmail.com";

interface UserData {
  id: string;
  email?: string;
  created_at: string;
  role?: string;
  subscription_tier?: string | null;
  username?: string | null;
  last_sign_in_at?: string;
  is_blocked?: boolean;
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

interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  tier?: string | null;
  months_granted?: number | null;
  per_user_limit?: number | null;
  notes?: string | null;
}

interface AdminActionLog {
  id: string;
  admin_id: string | null;
  target_user_id: string | null;
  action_type: string;
  action_description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoSearch, setPromoSearch] = useState("");
  const [newPromo, setNewPromo] = useState({
    code: "",
    description: "",
    tier: "premium",
    months: "12",
    maxUses: "",
    perUserLimit: "",
    expiresAt: "",
    notes: ""
  });
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [adminLogs, setAdminLogs] = useState<AdminActionLog[]>([]);

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
    const verifyAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const { isAdmin } = await import('@/utils/authUtils');
        const hasAdminRole = await isAdmin();
        const isRootEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (!hasAdminRole && !isRootEmail) {
          toast.error("Level 5 Authorization required");
          navigate("/");
          return;
        }

        setIsAuthorized(true);
        fetchData();
      } catch {
        toast.error("Authorization check failed");
        navigate("/");
      }
    };

    verifyAccess();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users from edge function (gets all auth.users with emails)
      const { data: { session } } = await supabase.auth.getSession();
      let usersFromEdge: UserData[] = [];
      
      if (session?.access_token) {
        try {
          const response = await fetch(
            `https://otelzbaiqeqlktawuuyv.supabase.co/functions/v1/admin-get-users`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            usersFromEdge = data.users || [];
          }
        } catch (edgeError) {
          console.error('Edge function error:', edgeError);
        }
      }

      const [
        { data: roles },
        { data: sessions },
        { data: contentData },
        { data: submissionData },
        { data: promoData },
        { data: logsData }
      ] = await Promise.all([
        supabase.from('user_roles').select('*'),
        supabase.from('watch_sessions').select('id, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('premium_codes').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('admin_action_logs').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      const premiumCount = usersFromEdge.filter(u => u.role === 'premium' || u.subscription_tier === 'premium').length || 
                           roles?.filter(r => r.role === 'premium').length || 0;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersCount = usersFromEdge.filter(u => new Date(u.created_at) > weekAgo).length || 0;

      setAnalytics({
        totalUsers: usersFromEdge.length || 0,
        premiumUsers: premiumCount,
        activeToday: sessions?.length || 0,
        newUsersThisWeek: newUsersCount,
        watchSessions: sessions?.length || 0,
        totalContent: contentData?.length || 0
      });

      // Use edge function data which includes real emails
      setUsers(usersFromEdge.map(u => ({
        id: u.id,
        email: u.email || 'Unknown',
        created_at: u.created_at,
        role: u.role || 'free',
        subscription_tier: u.subscription_tier,
        username: u.username || u.email?.split('@')[0] || 'Unknown',
        last_sign_in_at: u.last_sign_in_at,
        is_blocked: u.is_blocked
      })));

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
      setPromoCodes((promoData || []) as unknown as PromoCode[]);
      setAdminLogs((logsData || []) as AdminActionLog[]);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Nexus Link Failure");
    } finally {
      setIsLoading(false);
    }
  };

  const recordAdminAction = async (actionType: string, targetUserId?: string, metadata?: unknown) => {
    if (!user) return;
    try {
      await (supabase as any).from('admin_action_logs').insert({
        admin_id: user.id,
        target_user_id: targetUserId || null,
        action_type: actionType,
        action_description: null,
        metadata: (metadata ?? {}) as Record<string, unknown>,
      });
    // eslint-disable-next-line no-empty
    } catch {
    }
  };

  const handleUpgradeUser = async (userId: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    try {
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'premium').maybeSingle();
      if (existing) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'premium');
         await supabase.from('user_profiles').update({
          subscription_tier: 'free',
          subscription_expires_at: null
        }).eq('id', userId);
        toast.success("Node Downgraded");
        await recordAdminAction('downgrade_user', userId, { previousRole: 'premium' });
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'premium' as const });
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 12);
        await supabase.from('user_profiles').update({
          subscription_tier: 'premium',
          subscription_expires_at: expiryDate.toISOString()
        }).eq('id', userId);
        toast.success("Node Elevated to Premium");
        await recordAdminAction('upgrade_user', userId, { newRole: 'premium' });
      }
      fetchData();
    } catch (error) {
      toast.error("Operation Failed");
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    if (userId === user?.id) {
      toast.error("Cannot restrict root node");
      return;
    }
    try {
      await supabase.from('user_roles').upsert({ user_id: userId, role: 'free' as const });
      await supabase.from('user_profiles').update({
        subscription_tier: 'free',
        subscription_expires_at: null
      }).eq('id', userId);
      toast.success("Node Restricted");
      await recordAdminAction('restrict_user', userId);
      fetchData();
    } catch (error) {
      toast.error("Operation Failed");
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success("Content purged from library");
      await recordAdminAction('delete_content', undefined, { contentId: id });
      fetchData();
    } catch (error) {
      toast.error("Purge Failed");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
      if (error) throw error;
      toast.success("Transmission data cleared");
      await recordAdminAction('delete_support_ticket', undefined, { submissionId: id });
      fetchData();
    } catch (error) {
      toast.error("Clear Failed");
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
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

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredContent = content.filter(c => c.title.toLowerCase().includes(contentSearch.toLowerCase()));
  const filteredPromoCodes = promoCodes.filter(code =>
    code.code.toLowerCase().includes(promoSearch.toLowerCase()) ||
    (code.description || "").toLowerCase().includes(promoSearch.toLowerCase())
  );

  const handleCopyPromoCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Promo code copied to clipboard");
    } catch {
      toast.error("Unable to copy promo code");
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }

    const rawCode = newPromo.code.trim().toUpperCase();

    if (!/^[A-Z0-9]{5,20}$/.test(rawCode)) {
      toast.error("Code must be 5-20 characters (A-Z, 0-9)");
      return;
    }

    const months = parseInt(newPromo.months, 10);

    if (Number.isNaN(months) || months < 1 || months > 36) {
      toast.error("Months must be between 1 and 36");
      return;
    }

    const maxUses = newPromo.maxUses ? parseInt(newPromo.maxUses, 10) : null;
    if (maxUses !== null && (Number.isNaN(maxUses) || maxUses <= 0)) {
      toast.error("Max uses must be a positive number");
      return;
    }

    const perUserLimit = newPromo.perUserLimit ? parseInt(newPromo.perUserLimit, 10) : null;
    if (perUserLimit !== null && (Number.isNaN(perUserLimit) || perUserLimit <= 0)) {
      toast.error("Per-user limit must be a positive number");
      return;
    }

    let expiresAt: string | null = null;
    if (newPromo.expiresAt) {
      const date = new Date(newPromo.expiresAt);
      if (Number.isNaN(date.getTime())) {
        toast.error("Invalid expiration date");
        return;
      }
      expiresAt = date.toISOString();
    }

    setIsSavingPromo(true);

    try {
      const { error } = await supabase.from('premium_codes').insert({
        code: rawCode,
        description: newPromo.description || null,
        tier: newPromo.tier,
        months_granted: months,
        max_uses: maxUses,
        per_user_limit: perUserLimit,
        expires_at: expiresAt,
        notes: newPromo.notes || null,
        created_by: user?.id
      });

      if (error) {
        throw error;
      }

      toast.success("Promo code created");
      await recordAdminAction('create_promo_code', undefined, {
        code: rawCode,
        tier: newPromo.tier,
        months
      });

      setNewPromo({
        code: "",
        description: "",
        tier: "premium",
        months: "12",
        maxUses: "",
        perUserLimit: "",
        expiresAt: "",
        notes: ""
      });

      fetchData();
    } catch {
      toast.error("Failed to create promo code");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo: PromoCode) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }

    try {
      const { error } = await supabase
        .from('premium_codes')
        .update({ is_active: !promo.is_active })
        .eq('id', promo.id);

      if (error) {
        throw error;
      }

      toast.success(!promo.is_active ? "Promo code activated" : "Promo code deactivated");
      await recordAdminAction(!promo.is_active ? 'activate_promo_code' : 'deactivate_promo_code', undefined, {
        code: promo.code
      });

      fetchData();
    } catch {
      toast.error("Failed to update promo code");
    }
  };

  const handleDeletePromoCode = async (promo: PromoCode) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }

    try {
      const { error } = await supabase
        .from('premium_codes')
        .delete()
        .eq('id', promo.id);

      if (error) {
        throw error;
      }

      toast.success("Promo code deleted");
      await recordAdminAction('delete_promo_code', undefined, {
        code: promo.code
      });

      fetchData();
    } catch {
      toast.error("Failed to delete promo code");
    }
  };

  if (authLoading || isLoading) return <LoadingState message="Hyper-threading Nexus Core..." />;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-blue-500/30">
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
                {['overview', 'users', 'content', 'support', 'promo', 'analytics', 'audit'].map((tab) => (
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
                    {
                      label: 'Total Users',
                      value: analytics.totalUsers,
                      icon: Users,
                      color: 'text-blue-400',
                      sub: `+${analytics.newUsersThisWeek} this week`
                    },
                    {
                      label: 'Premium Members',
                      value: analytics.premiumUsers,
                      icon: Crown,
                      color: 'text-amber-400',
                      sub: `${((analytics.premiumUsers / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}% of users`
                    },
                    {
                      label: 'Content Items',
                      value: analytics.totalContent,
                      icon: Layers,
                      color: 'text-purple-400',
                      sub: 'Movies and series'
                    },
                    {
                      label: 'Active Sessions (24h)',
                      value: analytics.watchSessions,
                      icon: Server,
                      color: 'text-emerald-500',
                      sub: `${analytics.activeToday} unique viewers`
                    }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="stat-card p-8 rounded-[36px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] transition-all group overflow-hidden relative"
                    >
                      <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`}>
                        <stat.icon size={120} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-xl bg-white/5 ${stat.color} border border-current/20`}>
                            <stat.icon size={18} />
                          </div>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                            {stat.label}
                          </span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                          {stat.sub}
                        </div>
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
                    <div key={u.id} className={`p-8 rounded-[40px] bg-white/[0.03] border ${u.is_blocked ? 'border-red-500/30' : 'border-white/5'} flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.06] transition-all`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-3xl ${u.is_blocked ? 'bg-red-500/10' : 'bg-blue-500/10'} flex items-center justify-center ${u.is_blocked ? 'text-red-500' : 'text-blue-500'} font-black text-2xl border ${u.is_blocked ? 'border-red-500/20' : 'border-blue-500/20'} shadow-inner`}>
                          {u.email?.charAt(0).toUpperCase() || u.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <span className="font-black text-xl md:text-2xl tracking-tighter text-white break-all">{u.email || 'Unknown'}</span>
                            <Badge className={u.role === 'premium' ? 'bg-amber-500 text-black font-black' : u.role === 'admin' ? 'bg-purple-500 text-white font-black' : 'bg-gray-800 text-gray-400'}>{u.role}</Badge>
                            {u.is_blocked && <Badge className="bg-red-500 text-white font-black">BLOCKED</Badge>}
                          </div>
                          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            {u.username && u.username !== u.email?.split('@')[0] && <span className="mr-4">@{u.username}</span>}
                            <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                            {u.last_sign_in_at && <span className="ml-4">Last login: {new Date(u.last_sign_in_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={() => handleUpgradeUser(u.id)} className="px-6 md:px-8 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all">
                          {u.role === 'premium' ? 'Downgrade' : 'Upgrade'}
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

              <TabsContent value="promo" className="mt-0 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                      <Crown className="text-amber-500" /> Promo Codes
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Configure premium access tokens with usage limits and expiry.
                    </p>
                  </div>
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      placeholder="SEARCH CODES OR DESCRIPTIONS..."
                      value={promoSearch}
                      onChange={(e) => setPromoSearch(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl text-xs uppercase font-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-4">
                    {filteredPromoCodes.map(code => (
                      <div
                        key={code.id}
                        className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.06] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black tracking-[0.25em] uppercase text-white">
                              {code.code}
                            </span>
                            <Badge className={code.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-800 text-gray-400"}>
                              {code.is_active ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 max-w-xl">
                            {code.description || "No description"}
                          </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Tier: {(code.tier || 'premium').toUpperCase()}
                          </Badge>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              {(code.months_granted ?? 12)} Months
                          </Badge>
                            <Badge className="bg-white/5 text-gray-400">
                              Uses: {code.current_uses}{code.max_uses !== null ? ` / ${code.max_uses}` : " / ∞"}
                            </Badge>
                            {code.per_user_limit !== null && code.per_user_limit !== undefined && (
                              <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                                Per-User: {code.per_user_limit}
                              </Badge>
                            )}
                            {code.expires_at && (
                              <span className="text-[10px] text-gray-500">
                                Expires {new Date(code.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => handleCopyPromoCode(code.code)}
                          >
                            Share Code
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="w-10 h-10 rounded-2xl p-0 border border-white/10">
                                <ChevronRight size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#050505] border border-white/10">
                              <DropdownMenuItem onClick={() => handleTogglePromoActive(code)}>
                                {code.is_active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handleDeletePromoCode(code)}>
                                Delete Code
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    {filteredPromoCodes.length === 0 && (
                      <div className="p-8 rounded-[32px] bg-white/[0.02] border border-dashed border-white/10 text-center text-sm text-gray-500">
                        No promo codes found. Create one on the right to begin.
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5">
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                        <Zap className="text-blue-500" size={18} /> Create Promo Code
                      </h4>
                      <form onSubmit={handleCreatePromoCode} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            Code
                          </Label>
                          <Input
                            value={newPromo.code}
                            onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                            placeholder="CINEMAX2025"
                            className="bg-white/5 border-white/10 rounded-2xl h-11 font-mono text-xs tracking-[0.3em]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            Description
                          </Label>
                          <Input
                            value={newPromo.description}
                            onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                            placeholder="Launch promo - 1 month premium"
                            className="bg-white/5 border-white/10 rounded-2xl h-11 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                              Tier
                            </Label>
                            <select
                              value={newPromo.tier}
                              onChange={(e) => setNewPromo({ ...newPromo, tier: e.target.value })}
                              className="w-full bg-white/5 border-white/10 border rounded-2xl h-11 px-4 text-xs font-bold uppercase"
                            >
                              <option value="pro">PRO</option>
                              <option value="premium">PREMIUM</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                              Months Granted
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={36}
                              value={newPromo.months}
                              onChange={(e) => setNewPromo({ ...newPromo, months: e.target.value })}
                              className="bg-white/5 border-white/10 rounded-2xl h-11 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                              Max Uses
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              value={newPromo.maxUses}
                              onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                              placeholder="Unlimited if empty"
                              className="bg-white/5 border-white/10 rounded-2xl h-11 text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                              Per-User Limit
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              value={newPromo.perUserLimit}
                              onChange={(e) => setNewPromo({ ...newPromo, perUserLimit: e.target.value })}
                              placeholder="Default 1"
                              className="bg-white/5 border-white/10 rounded-2xl h-11 text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            Expiration Date
                          </Label>
                          <Input
                            type="date"
                            value={newPromo.expiresAt}
                            onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-2xl h-11 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            Notes (Internal)
                          </Label>
                          <textarea
                            value={newPromo.notes}
                            onChange={(e) => setNewPromo({ ...newPromo, notes: e.target.value })}
                            className="w-full bg-white/5 border-white/10 rounded-2xl h-20 text-xs p-3 resize-none"
                            placeholder="Optional internal notes about this code"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isSavingPromo}
                          className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[18px] shadow-2xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60"
                        >
                          {isSavingPromo ? "Creating..." : "Generate Code"}
                        </Button>
                      </form>
                    </div>
                  </div>
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

              <TabsContent value="audit" className="mt-0 space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Shield className="text-blue-500" /> Admin Audit Log
                  </h3>
                  <Badge className="bg-white/5 text-gray-400 border-white/10">
                    {adminLogs.length} Events
                  </Badge>
                </div>
                <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
                  {adminLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                            {log.action_type}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          {log.action_description || "Admin action recorded"}
                        </div>
                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                          Admin: {log.admin_id || "Unknown"} • Target: {log.target_user_id || "N/A"}
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-500 text-right flex flex-col items-end gap-1">
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                        {log.metadata && (
                          <span className="max-w-[220px] truncate text-[9px] text-gray-600">
                            {JSON.stringify(log.metadata)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {adminLogs.length === 0 && (
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-dashed border-white/10 text-center text-sm text-gray-500">
                      No admin actions recorded yet.
                    </div>
                  )}
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

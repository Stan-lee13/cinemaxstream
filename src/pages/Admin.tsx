import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Crown,
  Search,
  RefreshCw,
  Activity,
  BarChart3,
  Ban,
  UserCheck,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  Shield,
  Calendar,
  Hash,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Film,
  Eye
} from "lucide-react";
import LoadingState from "@/components/LoadingState";

const ADMIN_EMAIL = "stanleyvic13@gmail.com";

interface UserData {
  id: string;
  email?: string;
  created_at: string;
  role?: string;
  email_confirmed?: boolean;
  email_confirmed_at?: string;
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
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
    watchSessions: 0,
    totalContent: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoSearch, setPromoSearch] = useState("");
  const [newPromo, setNewPromo] = useState({
    code: "",
    description: "",
    tier: "premium",
    months: "12",
    maxUses: "",
    expiresAt: ""
  });
  const [isSavingPromo, setIsSavingPromo] = useState(false);

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
          toast.error("Admin access required");
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
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
        { data: promoData }
      ] = await Promise.all([
        supabase.from('user_roles').select('*'),
        supabase.from('watch_sessions').select('id, created_at').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('premium_codes').select('*').order('created_at', { ascending: false })
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

      setUsers(usersFromEdge.map(u => ({
        id: u.id,
        email: u.email || 'Unknown',
        created_at: u.created_at,
        role: u.role || 'free',
        subscription_tier: u.subscription_tier,
        username: u.username || u.email?.split('@')[0] || 'Unknown',
        last_sign_in_at: u.last_sign_in_at,
        is_blocked: u.is_blocked,
        email_confirmed: u.email_confirmed,
        email_confirmed_at: u.email_confirmed_at
      })));

      setPromoCodes((promoData || []) as PromoCode[]);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpgradeUser = async (userId: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    try {
      const targetUser = users.find(u => u.id === userId);
      const isPremium = targetUser?.role === 'premium' || targetUser?.subscription_tier === 'premium';

      if (isPremium) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'premium');
        await supabase.from('user_profiles').update({
          subscription_tier: 'free',
          role: 'free',
          subscription_expires_at: null
        }).eq('id', userId);
        toast.success("User downgraded to Free");
      } else {
        await supabase.from('user_roles').upsert({ user_id: userId, role: 'premium' as const }, { onConflict: 'user_id,role' });
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        await supabase.from('user_profiles').update({
          subscription_tier: 'premium',
          role: 'premium',
          subscription_expires_at: expiryDate.toISOString()
        }).eq('id', userId);
        toast.success("User upgraded to Premium");
      }
      fetchData();
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error("Operation failed");
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!isAuthorized || userId === user?.id) {
      toast.error("Cannot perform this action");
      return;
    }
    try {
      const targetUser = users.find(u => u.id === userId);
      
      if (targetUser?.is_blocked) {
        await (supabase as any).from('blocked_users').delete().eq('user_id', userId);
        toast.success("User unblocked");
      } else {
        await (supabase as any).from('blocked_users').insert({
          user_id: userId,
          blocked_by: user?.id,
          reason: 'Blocked by admin'
        });
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'premium');
        await supabase.from('user_profiles').update({
          subscription_tier: 'free',
          role: 'free',
          subscription_expires_at: null
        }).eq('id', userId);
        toast.success("User blocked");
      }
      fetchData();
    } catch (error) {
      console.error('Ban error:', error);
      toast.error("Operation failed");
    }
  };

  const handleConfirmUser = async (userId: string) => {
    if (!isAuthorized) {
      toast.error("Admin access required");
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session expired");
        return;
      }

      const response = await fetch(
        `https://otelzbaiqeqlktawuuyv.supabase.co/functions/v1/admin-confirm-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm user');
      }

      toast.success("User email confirmed");
      fetchData();
    } catch (error) {
      console.error('Confirm error:', error);
      toast.error("Failed to confirm user email");
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    const rawCode = newPromo.code.trim().toUpperCase();
    if (rawCode.length < 4) {
      toast.error("Code must be at least 4 characters");
      return;
    }

    const months = parseInt(newPromo.months, 10) || 12;
    const maxUses = newPromo.maxUses ? parseInt(newPromo.maxUses, 10) : null;
    const expiresAt = newPromo.expiresAt ? new Date(newPromo.expiresAt).toISOString() : null;

    setIsSavingPromo(true);
    try {
      const { error } = await supabase.from('premium_codes').insert({
        code: rawCode,
        description: newPromo.description || null,
        tier: 'premium',
        months_granted: months,
        max_uses: maxUses,
        expires_at: expiresAt,
        is_active: true,
        created_by: user?.id
      });

      if (error) throw error;

      toast.success("Promo code created");
      setNewPromo({ code: "", description: "", tier: "premium", months: "12", maxUses: "", expiresAt: "" });
      fetchData();
    } catch (error) {
      console.error('Create promo error:', error);
      toast.error("Failed to create promo code");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromo = async (promo: PromoCode) => {
    try {
      await supabase.from('premium_codes').update({ is_active: !promo.is_active }).eq('id', promo.id);
      toast.success(promo.is_active ? "Promo deactivated" : "Promo activated");
      fetchData();
    } catch {
      toast.error("Failed to update promo");
    }
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    try {
      await supabase.from('premium_codes').delete().eq('id', promo.id);
      toast.success("Promo code deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete promo");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPromos = promoCodes.filter(p =>
    p.code.toLowerCase().includes(promoSearch.toLowerCase())
  );

  if (authLoading || isLoading) return <LoadingState message="Loading admin panel..." />;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="promos" className="gap-2 data-[state=active]:bg-background">
              <Crown className="h-4 w-4" />
              <span>Promo Codes</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Total Users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.newUsersThisWeek} this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Premium Users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.premiumUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.totalUsers > 0 ? ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1) : 0}% conversion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    Active Today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.activeToday}</div>
                  <p className="text-xs text-muted-foreground">Watch sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-purple-500" />
                    Content Items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalContent}</div>
                  <p className="text-xs text-muted-foreground">Movies & Series</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Signups
                </CardTitle>
                <CardDescription>Latest users to join the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(u.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={u.role === 'premium' ? 'default' : 'secondary'}>
                        {u.role || 'free'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length} users
              </span>
            </div>

            {/* Users List */}
            <div className="space-y-2">
              {filteredUsers.map(u => (
                <Card key={u.id} className={u.is_blocked ? "border-destructive/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          u.is_blocked ? 'bg-destructive/20 text-destructive' : 
                          u.role === 'premium' ? 'bg-amber-500/20 text-amber-500' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{u.email}</p>
                            <Badge variant={u.role === 'premium' ? 'default' : u.role === 'admin' ? 'destructive' : 'secondary'}>
                              {u.role || 'free'}
                            </Badge>
                            {u.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                            {u.email_confirmed ? (
                              <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/10">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10">
                                <Mail className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(u.created_at).toLocaleDateString()}
                            </span>
                            {u.last_sign_in_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last: {new Date(u.last_sign_in_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        {!u.email_confirmed && (
                          <Button
                            onClick={() => handleConfirmUser(u.id)}
                            variant="outline"
                            size="sm"
                            className="gap-1 text-green-600 border-green-600/30 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Confirm</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => handleUpgradeUser(u.id)}
                          variant={u.role === 'premium' ? 'outline' : 'default'}
                          size="sm"
                          className="gap-1"
                        >
                          {u.role === 'premium' ? (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Downgrade</span>
                            </>
                          ) : (
                            <>
                              <Crown className="h-4 w-4" />
                              <span className="hidden sm:inline">Upgrade</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleBanUser(u.id)}
                          variant={u.is_blocked ? "outline" : "destructive"}
                          size="sm"
                          disabled={u.id === user?.id}
                        >
                          {u.is_blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promos" className="space-y-6">
            {/* Create New Promo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Promo Code
                </CardTitle>
                <CardDescription>Generate a new promo code for premium access</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePromoCode} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      placeholder="e.g., SUMMER2024"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (months)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="36"
                      value={newPromo.months}
                      onChange={(e) => setNewPromo({ ...newPromo, months: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses (optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires (optional)</Label>
                    <Input
                      type="date"
                      value={newPromo.expiresAt}
                      onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <Button type="submit" disabled={isSavingPromo} className="w-full sm:w-auto gap-2">
                      {isSavingPromo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Create Code
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promo codes..."
                value={promoSearch}
                onChange={(e) => setPromoSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Promo Codes List */}
            <div className="grid gap-4">
              {filteredPromos.map(promo => (
                <Card key={promo.id} className={!promo.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <code className="text-lg font-bold bg-muted px-3 py-1 rounded">{promo.code}</code>
                          <Badge variant={promo.is_active ? "default" : "secondary"}>
                            {promo.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(promo.code)} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {promo.current_uses}/{promo.max_uses || '∞'} uses
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {promo.months_granted || 12} months
                          </span>
                          {promo.expires_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {new Date(promo.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={() => handleTogglePromo(promo)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePromo(promo)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredPromos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No promo codes found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

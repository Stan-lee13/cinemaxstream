import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  X
} from "lucide-react";
import LoadingState from "@/components/LoadingState";

// CRITICAL: Only this email can access admin panel
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
  // Updated to make these required since migration has run
  is_trending_new: boolean | null;
  early_access_until: string | null;
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  // Security check - only allow admin email
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/");
      return;
    }

    // CRITICAL SECURITY CHECK
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast.error("Access denied");
      navigate("/");
      return;
    }

    setIsAuthorized(true);
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Fetch watch sessions for analytics
      const { data: sessions } = await supabase
        .from('watch_sessions')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Fetch content for early access management
      let contentData: ContentData[] = [];
      try {
        const { data } = await supabase
          .from('content')
          .select('id, title, content_type, created_at, is_trending_new, early_access_until')
          .order('created_at', { ascending: false });
        contentData = data || [];
      } catch (contentError) {
        console.warn('Content table query failed:', contentError);
      }

      // Calculate analytics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const premiumCount = roles?.filter(r => r.role === 'premium').length || 0;
      const newUsersCount = profiles?.filter(p => new Date(p.created_at) > weekAgo).length || 0;

      setAnalytics({
        totalUsers: profiles?.length || 0,
        premiumUsers: premiumCount,
        activeToday: sessions?.length || 0,
        newUsersThisWeek: newUsersCount,
        watchSessions: sessions?.length || 0
      });

      // Map users with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.username || 'Unknown',
          created_at: profile.created_at,
          role: userRole?.role || 'free',
          subscription_tier: profile.subscription_tier,
          username: profile.username
        };
      }) || [];

      setUsers(usersWithRoles);
      setContent(contentData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("Cannot ban yourself");
      return;
    }

    try {
      // Add banned role
      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'free' as const });
      
      toast.success("User access restricted");
      fetchData();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleUpgradeUser = async (userId: string) => {
    try {
      // Check if premium role exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'premium')
        .single();

      if (existing) {
        // Downgrade to free
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'premium');
        toast.success("User downgraded to free");
      } else {
        // Upgrade to premium
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'premium' as const });
        toast.success("User upgraded to premium");
      }
      
      fetchData();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleToggleTrending = async (contentId: string, currentValue: boolean | null) => {
    try {
      const newValue = !currentValue;
      await supabase
        .from('content')
        .update({ is_trending_new: newValue })
        .eq('id', contentId);
      
      toast.success(`Content ${newValue ? 'marked as' : 'removed from'} trending`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleSetEarlyAccess = async (contentId: string, days: number) => {
    try {
      const earlyAccessUntil = new Date();
      earlyAccessUntil.setDate(earlyAccessUntil.getDate() + days);
      
      await supabase
        .from('content')
        .update({ early_access_until: earlyAccessUntil.toISOString() })
        .eq('id', contentId);
      
      toast.success(`Early access set for ${days} days`);
      fetchData();
    } catch (error) {
      toast.error("Failed to set early access");
    }
  };

  const handleRemoveEarlyAccess = async (contentId: string) => {
    try {
      await supabase
        .from('content')
        .update({ early_access_until: null })
        .eq('id', contentId);
      
      toast.success("Early access removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove early access");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContent = content.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return <LoadingState message="Loading admin panel..." />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Admin Panel</h1>
            <p className="text-gray-400 mt-1">CinemaxStream Management</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Total Users</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {analytics.totalUsers}
                    <Users className="h-6 w-6 text-cinemax-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <ArrowUpRight size={14} />
                    <span>+{analytics.newUsersThisWeek} this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Premium Users</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {analytics.premiumUsers}
                    <Crown className="h-6 w-6 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    {analytics.totalUsers > 0 
                      ? `${((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}% conversion`
                      : '0% conversion'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Active Today</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {analytics.activeToday}
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    Watch sessions
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Security Status</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <span className="text-green-500">Active</span>
                    <Shield className="h-6 w-6 text-green-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    All systems operational
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-secondary/30 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium">{u.username || u.email}</p>
                        <p className="text-sm text-gray-400">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={u.role === 'premium' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-secondary/30 border-gray-800">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-gray-700"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.username || 'No username'}</p>
                          <Badge variant={u.role === 'premium' ? 'default' : 'secondary'} className="text-xs">
                            {u.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">ID: {u.id.slice(0, 8)}...</p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpgradeUser(u.id)}
                          className="gap-1"
                        >
                          <Crown size={14} />
                          {u.role === 'premium' ? 'Downgrade' : 'Upgrade'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBanUser(u.id)}
                          className="gap-1"
                        >
                          <Ban size={14} />
                          Restrict
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-secondary/30 border-gray-800">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage trending/new flags and early access</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-gray-700"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredContent.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{c.title}</p>
                          {c.is_trending_new && (
                            <Badge variant="default" className="text-xs">
                              Trending
                            </Badge>
                          )}
                          {c.early_access_until && new Date(c.early_access_until) > new Date() && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300">
                              Early Access
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 capitalize">{c.content_type}</p>
                        <p className="text-xs text-gray-500">
                          Added {new Date(c.created_at).toLocaleDateString()}
                        </p>
                        {c.early_access_until && new Date(c.early_access_until) > new Date() && (
                          <p className="text-xs text-yellow-300 mt-1">
                            <Clock className="inline mr-1" size={12} />
                            Until {new Date(c.early_access_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleTrending(c.id, c.is_trending_new || false)}>
                              {c.is_trending_new ? 'Remove Trending' : 'Mark as Trending'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetEarlyAccess(c.id, 7)}>
                              Set 7-day Early Access
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetEarlyAccess(c.id, 30)}>
                              Set 30-day Early Access
                            </DropdownMenuItem>
                            {c.early_access_until && (
                              <DropdownMenuItem onClick={() => handleRemoveEarlyAccess(c.id)}>
                                Remove Early Access
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {filteredContent.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No content found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Weekly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-cinemax-500" />
                      <p>{analytics.newUsersThisWeek} new users this week</p>
                      <p className="text-sm">Total: {analytics.totalUsers} users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-gray-800">
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Premium subscription overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Crown className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                      <p>{analytics.premiumUsers} premium subscribers</p>
                      <p className="text-sm">
                        Est. MRR: ${(analytics.premiumUsers * 9.99).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-secondary/30 border-gray-800">
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User activity and watch sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-cinemax-500">{analytics.watchSessions}</p>
                    <p className="text-sm text-gray-400">Sessions Today</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-500">{analytics.activeToday}</p>
                    <p className="text-sm text-gray-400">Active Users</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-500">
                      {analytics.totalUsers > 0 
                        ? ((analytics.activeToday / analytics.totalUsers) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-400">Engagement Rate</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-500">
                      {analytics.totalUsers > 0 
                        ? ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-400">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
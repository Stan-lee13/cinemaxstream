import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, AlertCircle, Activity } from 'lucide-react';
import { captureException, ErrorSeverity } from '@/services/errorMonitoring';
import { toast } from 'sonner';
import { UserManagement } from '@/components/admin/UserManagement';
import { PaymentManagement } from '@/components/admin/PaymentManagement';
import { ErrorMonitoring } from '@/components/admin/ErrorMonitoring';
import { PromoCodeManagement } from '@/components/admin/PromoCodeManagement';

interface AdminStats {
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
    proUsers: number;
    totalRevenue: number;
    todayStreams: number;
    todayDownloads: number;
    errorCount: number;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        proUsers: 0,
        totalRevenue: 0,
        todayStreams: 0,
        todayDownloads: 0,
        errorCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    const checkAdminAccess = async () => {
        try {
            if (!user) {
                navigate('/');
                return;
            }

            // Check if user is admin
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cinemaxstream.com';

            if (user.email !== adminEmail) {
                toast.error('Unauthorized access');
                navigate('/');
                return;
            }

            // Check admin role in database
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')
                .maybeSingle();

            if (!roleData) {
                toast.error('Admin access denied');
                navigate('/');
                return;
            }

            setIsAuthorized(true);
            await fetchStats();
        } catch (error) {
            captureException(error, {
                component: 'AdminDashboard',
                action: 'checkAdminAccess'
            });
            navigate('/');
        }
    };

    const fetchStats = async () => {
        try {
            setIsLoading(true);

            // Fetch user statistics
            const { data: profiles, error: profilesError } = await supabase
                .from('user_profiles')
                .select('role');

            if (profilesError) throw profilesError;

            const userStats = profiles?.reduce((acc, profile) => {
                acc.totalUsers++;
                if (profile.role === 'premium') acc.premiumUsers++;
                else if (profile.role === 'pro') acc.proUsers++;
                else acc.freeUsers++;
                return acc;
            }, { totalUsers: 0, premiumUsers: 0, proUsers: 0, freeUsers: 0 });

            // Fetch payment statistics
            const { data: payments, error: paymentsError } = await supabase
                .from('payment_transactions')
                .select('amount, currency, status')
                .eq('status', 'success');

            if (paymentsError) throw paymentsError;

            const totalRevenue = payments?.reduce((sum, payment) => {
                return sum + (payment.amount || 0);
            }, 0) || 0;

            // Fetch today's usage statistics
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: usage, error: usageError } = await supabase
                .from('user_usage')
                .select('watched_today, downloads_today')
                .gte('last_reset', today.toISOString());

            if (usageError) throw usageError;

            const usageStats = usage?.reduce((acc, u) => {
                acc.todayStreams += u.watched_today || 0;
                acc.todayDownloads += u.downloads_today || 0;
                return acc;
            }, { todayStreams: 0, todayDownloads: 0 });

            // Fetch error count
            const { count: errorCount } = await supabase
                .from('error_reports')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString())
                .is('resolved_at', null);

            setStats({
                ...userStats,
                totalRevenue: totalRevenue / 100, // Convert from kobo to naira
                todayStreams: usageStats?.todayStreams || 0,
                todayDownloads: usageStats?.todayDownloads || 0,
                errorCount: errorCount || 0
            });
        } catch (error) {
            captureException(error, {
                component: 'AdminDashboard',
                action: 'fetchStats'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your streaming platform</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.premiumUsers} premium, {stats.proUsers} pro, {stats.freeUsers} free
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From successful payments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayStreams}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.todayDownloads} downloads
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unresolved Errors</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.errorCount}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                    <TabsTrigger value="promo">Promo Codes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Overview</CardTitle>
                            <CardDescription>Quick insights into your platform's performance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Premium Conversion Rate</span>
                                <span className="text-sm text-muted-foreground">
                                    {stats.totalUsers > 0
                                        ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Average Revenue Per User</span>
                                <span className="text-sm text-muted-foreground">
                                    ₦{stats.totalUsers > 0
                                        ? (stats.totalRevenue / stats.totalUsers).toFixed(2)
                                        : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Active Users Today</span>
                                <span className="text-sm text-muted-foreground">
                                    {stats.todayStreams > 0 ? 'Active' : 'Low activity'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="payments">
                    <PaymentManagement />
                </TabsContent>

                <TabsContent value="errors">
                    <ErrorMonitoring />
                </TabsContent>

                <TabsContent value="promo">
                    <PromoCodeManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;

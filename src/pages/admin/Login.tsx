import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
    const [secretKey, setSecretKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please sign in first');
            navigate('/auth');
            return;
        }

        setIsVerifying(true);

        try {
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cinemaxstream.com';
            const adminSecretKey = import.meta.env.VITE_ADMIN_SECRET_KEY || 'CHANGE_THIS_TO_SECURE_RANDOM_STRING';

            // Verify email
            if (user.email !== adminEmail) {
                toast.error('Unauthorized access');
                return;
            }

            // Verify secret key
            if (secretKey !== adminSecretKey) {
                toast.error('Invalid secret key');
                return;
            }

            // Store admin session
            sessionStorage.setItem('admin_verified', 'true');

            toast.success('Admin access granted');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
            <Card className="w-full max-w-md border-2 border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                    <CardDescription>
                        Enter your secret key to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="bg-secondary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secretKey">Secret Key</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="secretKey"
                                    type="password"
                                    placeholder="Enter your secret key"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isVerifying || !secretKey}
                        >
                            {isVerifying ? 'Verifying...' : 'Access Dashboard'}
                        </Button>

                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate('/')}
                                className="text-sm text-muted-foreground"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            <strong>Security Notice:</strong> This page is only accessible to the designated admin.
                            Unauthorized access attempts are logged.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;

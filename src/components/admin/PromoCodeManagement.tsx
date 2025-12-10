import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { captureException, ErrorSeverity } from '@/services/errorMonitoring';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface PromoCode {
    id: string;
    code: string;
    plan: string;
    max_uses: number;
    current_uses: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

export const PromoCodeManagement = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [newCode, setNewCode] = useState({
        code: '',
        plan: 'pro',
        max_uses: 1,
        expires_at: ''
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromoCodes(data || []);
        } catch (error) {
            captureException(error, {
                component: 'PromoCodeManagement',
                action: 'fetchPromoCodes'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to load promo codes');
        } finally {
            setLoading(false);
        }
    };

    const createPromoCode = async () => {
        try {
            if (!newCode.code.trim()) {
                toast.error('Please enter a promo code');
                return;
            }

            const { error } = await supabase
                .from('promo_codes')
                .insert({
                    code: newCode.code.toUpperCase(),
                    plan: newCode.plan,
                    max_uses: newCode.max_uses,
                    expires_at: newCode.expires_at || null,
                    is_active: true,
                    current_uses: 0
                });

            if (error) throw error;

            toast.success('Promo code created successfully');
            setShowDialog(false);
            setNewCode({ code: '', plan: 'pro', max_uses: 1, expires_at: '' });
            fetchPromoCodes();
        } catch (error) {
            captureException(error, {
                component: 'PromoCodeManagement',
                action: 'createPromoCode'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to create promo code');
        }
    };

    const togglePromoCode = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Promo code ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchPromoCodes();
        } catch (error) {
            captureException(error, {
                component: 'PromoCodeManagement',
                action: 'togglePromoCode'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to update promo code');
        }
    };

    const deletePromoCode = async (id: string) => {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Promo code deleted');
            fetchPromoCodes();
        } catch (error) {
            captureException(error, {
                component: 'PromoCodeManagement',
                action: 'deletePromoCode'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to delete promo code');
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCode({ ...newCode, code });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Promo Code Management</CardTitle>
                        <CardDescription>Create and manage promotional codes</CardDescription>
                    </div>
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Promo Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Promo Code</DialogTitle>
                                <DialogDescription>
                                    Generate a new promotional code for users
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="code">Promo Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="code"
                                            value={newCode.code}
                                            onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                                            placeholder="PROMO2025"
                                            className="uppercase"
                                        />
                                        <Button variant="outline" onClick={generateRandomCode}>
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="plan">Plan</Label>
                                    <Select
                                        value={newCode.plan}
                                        onValueChange={(value) => setNewCode({ ...newCode, plan: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="max_uses">Max Uses</Label>
                                    <Input
                                        id="max_uses"
                                        type="number"
                                        value={newCode.max_uses}
                                        onChange={(e) => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expires_at">Expires At (Optional)</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={newCode.expires_at}
                                        onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                                    />
                                </div>
                                <Button onClick={createPromoCode} className="w-full">
                                    Create Promo Code
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : promoCodes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No promo codes found</TableCell>
                                </TableRow>
                            ) : (
                                promoCodes.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{promo.plan}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {promo.current_uses} / {promo.max_uses}
                                        </TableCell>
                                        <TableCell>
                                            {promo.expires_at ? (
                                                new Date(promo.expires_at) > new Date() ? (
                                                    new Date(promo.expires_at).toLocaleDateString()
                                                ) : (
                                                    <Badge variant="destructive">Expired</Badge>
                                                )
                                            ) : (
                                                <Badge variant="secondary">Never</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                                                {promo.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => togglePromoCode(promo.id, promo.is_active)}
                                                >
                                                    {promo.is_active ? (
                                                        <ToggleRight className="w-4 h-4" />
                                                    ) : (
                                                        <ToggleLeft className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deletePromoCode(promo.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                    Total: {promoCodes.length} promo codes
                </div>
            </CardContent>
        </Card>
    );
};

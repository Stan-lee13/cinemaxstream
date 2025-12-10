import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, DollarSign } from 'lucide-react';
import { captureException, ErrorSeverity } from '@/services/errorMonitoring';

interface Payment {
    id: string;
    reference: string;
    email: string;
    plan: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    verified_at: string | null;
}

export const PaymentManagement = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            captureException(error, {
                component: 'PaymentManagement',
                action: 'fetchPayments'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment =>
        payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>View and manage payment history</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Successful</p>
                                        <p className="text-2xl font-bold">
                                            {payments.filter(p => p.status === 'success').length}
                                        </p>
                                    </div>
                                    <Badge variant="default" className="text-lg px-3 py-1">✓</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending/Failed</p>
                                        <p className="text-2xl font-bold">
                                            {payments.filter(p => p.status !== 'success').length}
                                        </p>
                                    </div>
                                    <Badge variant="destructive" className="text-lg px-3 py-1">!</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No payments found</TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                                        <TableCell>{payment.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{payment.plan}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            ₦{((payment.amount || 0) / 100).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                payment.status === 'success' ? 'default' :
                                                    payment.status === 'pending' ? 'secondary' : 'destructive'
                                            }>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredPayments.length} of {payments.length} transactions
                </div>
            </CardContent>
        </Card>
    );
};

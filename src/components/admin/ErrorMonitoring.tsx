import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { captureException, ErrorSeverity } from '@/services/errorMonitoring';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ErrorReport {
    id: string;
    message: string;
    severity: string;
    stack_trace: string | null;
    component: string | null;
    user_email: string | null;
    created_at: string;
    resolved_at: string | null;
}

export const ErrorMonitoring = () => {
    const [errors, setErrors] = useState<ErrorReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchErrors();
    }, []);

    const fetchErrors = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('error_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setErrors(data || []);
        } catch (error) {
            captureException(error, {
                component: 'ErrorMonitoring',
                action: 'fetchErrors'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to load error reports');
        } finally {
            setLoading(false);
        }
    };

    const markAsResolved = async (errorId: string) => {
        try {
            const { error } = await supabase
                .from('error_reports')
                .update({ resolved_at: new Date().toISOString() })
                .eq('id', errorId);

            if (error) throw error;

            toast.success('Error marked as resolved');
            fetchErrors();
        } catch (error) {
            captureException(error, {
                component: 'ErrorMonitoring',
                action: 'markAsResolved'
            }, ErrorSeverity.ERROR);
            toast.error('Failed to update error status');
        }
    };

    const filteredErrors = errors.filter(error =>
        severityFilter === 'all' || error.severity === severityFilter
    );

    const unresolvedCount = errors.filter(e => !e.resolved_at).length;
    const criticalCount = errors.filter(e => e.severity === 'critical' && !e.resolved_at).length;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Error Reports</CardTitle>
                    <CardDescription>Monitor and resolve system errors</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Unresolved</p>
                                            <p className="text-2xl font-bold">{unresolvedCount}</p>
                                        </div>
                                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Critical</p>
                                            <p className="text-2xl font-bold">{criticalCount}</p>
                                        </div>
                                        <XCircle className="h-8 w-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Resolved</p>
                                            <p className="text-2xl font-bold">
                                                {errors.filter(e => e.resolved_at).length}
                                            </p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="debug">Debug</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Component</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredErrors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No errors found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredErrors.map((error) => (
                                        <TableRow key={error.id}>
                                            <TableCell>
                                                <Badge variant={
                                                    error.severity === 'critical' ? 'destructive' :
                                                        error.severity === 'error' ? 'destructive' :
                                                            error.severity === 'warning' ? 'secondary' : 'outline'
                                                }>
                                                    {error.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">{error.message}</TableCell>
                                            <TableCell>{error.component || 'Unknown'}</TableCell>
                                            <TableCell>{error.user_email || 'Anonymous'}</TableCell>
                                            <TableCell>{new Date(error.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {error.resolved_at ? (
                                                    <Badge variant="default">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Resolved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Open
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedError(error);
                                                            setShowDialog(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {!error.resolved_at && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => markAsResolved(error.id)}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                        Showing {filteredErrors.length} of {errors.length} errors
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Error Details</DialogTitle>
                        <DialogDescription>
                            Full error information and stack trace
                        </DialogDescription>
                    </DialogHeader>
                    {selectedError && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Message</h4>
                                <p className="text-sm">{selectedError.message}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Severity</h4>
                                <Badge variant={
                                    selectedError.severity === 'critical' ? 'destructive' : 'secondary'
                                }>
                                    {selectedError.severity}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Component</h4>
                                <p className="text-sm">{selectedError.component || 'Unknown'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">User</h4>
                                <p className="text-sm">{selectedError.user_email || 'Anonymous'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Timestamp</h4>
                                <p className="text-sm">{new Date(selectedError.created_at).toLocaleString()}</p>
                            </div>
                            {selectedError.stack_trace && (
                                <div>
                                    <h4 className="font-semibold mb-2">Stack Trace</h4>
                                    <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                                        {selectedError.stack_trace}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

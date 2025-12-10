/**
 * Paystack TypeScript Type Definitions
 */

export interface PaystackCustomer {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: Record<string, any> | null;
    risk_action: string;
}

export interface PaystackAuthorization {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
}

export interface PaystackTransaction {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'pending' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: PaystackAuthorization;
    customer: PaystackCustomer;
    plan: any;
    subaccount: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
}

export interface PaystackWebhookEvent {
    event: 'charge.success' | 'charge.failed' | 'subscription.create' | 'subscription.disable' | 'invoice.create' | 'invoice.update' | 'invoice.payment_failed';
    data: PaystackTransaction;
}

export interface PaystackPlan {
    id: number;
    name: string;
    plan_code: string;
    description: string;
    amount: number;
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annually';
    send_invoices: boolean;
    send_sms: boolean;
    currency: string;
    invoice_limit: number;
    integration: number;
    domain: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaystackSubscription {
    customer: number;
    plan: number;
    integration: number;
    domain: string;
    start: number;
    status: 'active' | 'cancelled' | 'completed';
    quantity: number;
    amount: number;
    subscription_code: string;
    email_token: string;
    authorization: number;
    easy_cron_id: string | null;
    cron_expression: string;
    next_payment_date: string;
    open_invoice: string | null;
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaystackInlineOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: Record<string, any>;
    callback?: (response: PaystackInlineResponse) => void;
    onClose?: () => void;
    channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
    plan?: string;
    quantity?: number;
    subaccount?: string;
    transaction_charge?: number;
    bearer?: 'account' | 'subaccount';
    split_code?: string;
}

export interface PaystackInlineResponse {
    reference: string;
    status: string;
    message: string;
    trans: string;
    transaction: string;
    trxref: string;
}

export interface PaystackPopup {
    setup: (options: PaystackInlineOptions) => PaystackPopupHandler;
}

export interface PaystackPopupHandler {
    openIframe: () => void;
}

declare global {
    interface Window {
        PaystackPop?: PaystackPopup;
    }
}

// Database types for payment transactions
export interface PaymentTransaction {
    id?: string;
    reference: string;
    plan: string;
    email: string;
    user_id?: string;
    status: 'pending' | 'success' | 'failed';
    amount?: number;
    currency?: string;
    created_at?: string;
    verified_at?: string;
    metadata?: Record<string, any>;
}

export interface SubscriptionStatus {
    isActive: boolean;
    plan: string | null;
    expiresAt: string | null;
    daysRemaining: number | null;
}

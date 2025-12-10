/**
 * Paystack Payment Integration Service
 * Handles payment initialization, verification, and subscription management
 */

import { supabase } from '@/integrations/supabase/client';
import { captureException, captureMessage, ErrorSeverity } from './errorMonitoring';

export interface PaystackConfig {
    publicKey: string;
    secretKey?: string; // Only used on backend
}

export interface PaymentPlan {
    name: string;
    amount: number; // in kobo (NGN) or cents (USD/GHS)
    currency: string;
    interval: 'monthly' | 'yearly' | 'one-time';
    features: string[];
}

export interface PaymentInitializeData {
    email: string;
    amount: number;
    currency?: string;
    plan: string;
    metadata?: Record<string, any>;
    callback_url?: string;
}

export interface PaymentResponse {
    status: boolean;
    message: string;
    data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaymentVerificationResponse {
    status: boolean;
    message: string;
    data?: {
        status: 'success' | 'failed' | 'pending';
        reference: string;
        amount: number;
        currency: string;
        customer: {
            email: string;
        };
        metadata?: Record<string, any>;
    };
}

class PaystackService {
    private publicKey: string;
    private isTestMode: boolean;

    constructor() {
        // Use test key for now as specified
        this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxx';
        this.isTestMode = this.publicKey.startsWith('pk_test_');

        if (this.isTestMode) {
            captureMessage('Paystack running in TEST mode', ErrorSeverity.WARNING);
        }
    }

    /**
     * Payment plans configuration
     */
    readonly plans: Record<string, PaymentPlan> = {
        pro: {
            name: 'Pro',
            amount: 999, // ₦999 or $9.99 (in kobo/cents)
            currency: 'NGN',
            interval: 'monthly',
            features: [
                '20 streams per day',
                '10 downloads per day',
                'HD quality',
                'Ad-free experience'
            ]
        },
        premium: {
            name: 'Premium',
            amount: 1999, // ₦1,999 or $19.99
            currency: 'NGN',
            interval: 'monthly',
            features: [
                'Unlimited streams',
                'Unlimited downloads',
                '4K quality',
                'Ad-free experience',
                'Early access to new content'
            ]
        },
        premium_yearly: {
            name: 'Premium (Yearly)',
            amount: 19990, // ₦19,990 or $199.90 (save 2 months)
            currency: 'NGN',
            interval: 'yearly',
            features: [
                'Unlimited streams',
                'Unlimited downloads',
                '4K quality',
                'Ad-free experience',
                'Early access to new content',
                'Save 2 months!'
            ]
        }
    };

    /**
     * Initialize payment
     */
    async initializePayment(data: PaymentInitializeData): Promise<PaymentResponse> {
        try {
            const plan = this.plans[data.plan];
            if (!plan) {
                throw new Error(`Invalid plan: ${data.plan}`);
            }

            // Generate unique reference
            const reference = this.generateReference();

            const payload = {
                email: data.email,
                amount: data.amount || plan.amount,
                currency: data.currency || plan.currency,
                reference,
                callback_url: data.callback_url || `${window.location.origin}/payment/verify`,
                metadata: {
                    ...data.metadata,
                    plan: data.plan,
                    userId: data.metadata?.userId,
                    custom_fields: [
                        {
                            display_name: 'Plan',
                            variable_name: 'plan',
                            value: plan.name
                        }
                    ]
                }
            };

            // In test mode, simulate Paystack response
            if (this.isTestMode) {
                return this.simulatePaymentInitialization(payload);
            }

            // Real Paystack API call
            const response = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.publicKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result: PaymentResponse = await response.json();

            if (!result.status) {
                throw new Error(result.message || 'Payment initialization failed');
            }

            // Store payment reference in database
            await this.storePaymentReference(reference, data.plan, data.email, data.metadata?.userId);

            captureMessage(`Payment initialized: ${reference}`, ErrorSeverity.INFO, {
                action: 'payment_initialized',
                metadata: { reference, plan: data.plan }
            });

            return result;
        } catch (error) {
            captureException(error, {
                component: 'PaystackService',
                action: 'initializePayment'
            });
            throw error;
        }
    }

    /**
     * Verify payment
     */
    async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
        try {
            // In test mode, simulate verification
            if (this.isTestMode) {
                return this.simulatePaymentVerification(reference);
            }

            // Real Paystack API call
            const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.publicKey}`
                }
            });

            const result: PaymentVerificationResponse = await response.json();

            if (result.status && result.data?.status === 'success') {
                // Update user subscription in database
                await this.activateSubscription(reference);

                captureMessage(`Payment verified: ${reference}`, ErrorSeverity.INFO, {
                    action: 'payment_verified',
                    metadata: { reference }
                });
            }

            return result;
        } catch (error) {
            captureException(error, {
                component: 'PaystackService',
                action: 'verifyPayment'
            });
            throw error;
        }
    }

    /**
     * Open Paystack payment popup
     */
    async openPaymentPopup(data: PaymentInitializeData): Promise<void> {
        return new Promise((resolve, reject) => {
            this.openPaymentPopupImpl(data, resolve, reject);
        });
    }

    private async openPaymentPopupImpl(
        data: PaymentInitializeData,
        resolve: () => void,
        reject: (error: Error) => void
    ): Promise<void> {
        try {
            const response = await this.initializePayment(data);

                if (!response.data?.authorization_url) {
                    throw new Error('No authorization URL received');
                }

                // Load Paystack inline script if not already loaded
                if (!(window as any).PaystackPop) {
                    await this.loadPaystackScript();
                }

                const handler = (window as any).PaystackPop.setup({
                    key: this.publicKey,
                    email: data.email,
                    amount: data.amount || this.plans[data.plan].amount,
                    currency: data.currency || this.plans[data.plan].currency,
                    ref: response.data.reference,
                    metadata: data.metadata,
                    callback: async (response: any) => {
                        // Verify payment
                        const verification = await this.verifyPayment(response.reference);
                        if (verification.status && verification.data?.status === 'success') {
                            resolve();
                        } else {
                            reject(new Error('Payment verification failed'));
                        }
                    },
                    onClose: () => {
                        reject(new Error('Payment cancelled'));
                    }
                });

                handler.openIframe();
            } catch (error) {
                reject(error as Error);
            }
    }

    /**
     * Load Paystack inline script
     */
    private loadPaystackScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if ((window as any).PaystackPop) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Paystack script'));
            document.head.appendChild(script);
        });
    }

    /**
     * Generate unique payment reference
     */
    private generateReference(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `CINEMAX_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * Store payment reference in database
     */
    private async storePaymentReference(
        reference: string,
        plan: string,
        email: string,
        userId?: string
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('payment_transactions')
                .insert({
                    reference,
                    plan,
                    email,
                    user_id: userId,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            captureException(error, {
                component: 'PaystackService',
                action: 'storePaymentReference'
            });
        }
    }

    /**
     * Activate subscription after successful payment
     */
    private async activateSubscription(reference: string): Promise<void> {
        try {
            // Get payment transaction
            const { data: transaction, error: fetchError } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('reference', reference)
                .single();

            if (fetchError || !transaction) {
                throw new Error('Transaction not found');
            }

            // Update transaction status
            await supabase
                .from('payment_transactions')
                .update({ status: 'success', verified_at: new Date().toISOString() })
                .eq('reference', reference);

            // Update user profile
            const plan = this.plans[transaction.plan];
            const expiresAt = new Date();

            if (plan.interval === 'monthly') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else if (plan.interval === 'yearly') {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            const role = transaction.plan.includes('premium') ? 'premium' : 'pro';

            await supabase
                .from('user_profiles')
                .update({
                    role,
                    subscription_expires_at: expiresAt.toISOString()
                })
                .eq('id', transaction.user_id);

            captureMessage(`Subscription activated for user ${transaction.user_id}`, ErrorSeverity.INFO, {
                action: 'subscription_activated',
                metadata: { userId: transaction.user_id, plan: transaction.plan }
            });
        } catch (error) {
            captureException(error, {
                component: 'PaystackService',
                action: 'activateSubscription'
            });
            throw error;
        }
    }

    /**
     * Simulate payment initialization (test mode)
     */
    private simulatePaymentInitialization(payload: any): PaymentResponse {
        const reference = payload.reference;
        return {
            status: true,
            message: 'Authorization URL created (TEST MODE)',
            data: {
                authorization_url: `https://checkout.paystack.com/test_${reference}`,
                access_code: `test_access_${reference}`,
                reference
            }
        };
    }

    /**
     * Simulate payment verification (test mode)
     */
    private simulatePaymentVerification(reference: string): PaymentVerificationResponse {
        return {
            status: true,
            message: 'Verification successful (TEST MODE)',
            data: {
                status: 'success',
                reference,
                amount: 1999,
                currency: 'NGN',
                customer: {
                    email: 'test@example.com'
                },
                metadata: {
                    plan: 'premium'
                }
            }
        };
    }

    /**
     * Check if running in test mode
     */
    isTest(): boolean {
        return this.isTestMode;
    }
}

// Export singleton instance
export const paystackService = new PaystackService();

// Convenience exports
export const initializePayment = paystackService.initializePayment.bind(paystackService);
export const verifyPayment = paystackService.verifyPayment.bind(paystackService);
export const openPaymentPopup = paystackService.openPaymentPopup.bind(paystackService);

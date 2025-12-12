import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPromoModal } from '@/components/PremiumPromoModal';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';

const ManageBillingPage = () => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '₦0',
      features: [
        '5 streams per day',
        'Standard quality',
        'Basic support',
        'Limited content'
      ],
      limitations: [
        'No downloads',
        'Ads supported'
      ],
      current: !isPremium
    },
    {
      name: 'Pro',
      price: '₦500/month',
      features: [
        '12 streams per day',
        '5 downloads per day',
        'HD quality',
        'Priority download queue',
        'Priority support',
        'All content access'
      ],
      limitations: [
        'Daily limits apply'
      ],
      recommended: true
    },
    {
      name: 'Premium',
      price: '₦1500/month',
      features: [
        'Unlimited streams',
        'Unlimited downloads',
        '4K streaming',
        'Premium-only catalog',
        'VIP support'
      ],
      limitations: [],
      current: isPremium
    }
  ];

  const handleUpgrade = (planName: string) => {
    // Open Stripe payment URL or handle upgrade
    const paymentUrl = import.meta.env.VITE_STRIPE_PAYMENT_URL 
      || `https://billing.cinemax-stream.com/upgrade?plan=${planName.toLowerCase()}`;
    
    window.open(paymentUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <BackButton className="mb-6" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Upgrade your streaming experience with premium features
            </p>
          </div>

          {/* Promo Code Option */}
          <div className="flex justify-center mb-8">
            <PremiumPromoModal>
              <Button variant="outline" className="gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Have a promo code? Click here
              </Button>
            </PremiumPromoModal>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`p-6 relative ${
                  plan.recommended 
                    ? 'border-primary border-2 bg-card' 
                    : plan.current
                    ? 'border-green-500 border-2 bg-card'
                    : 'bg-card border-border'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Recommended
                    </span>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {plan.price}
                  </div>
                  {plan.name !== 'Free' && (
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                {plan.current ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : plan.name === 'Free' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/account')}
                  >
                    Manage Account
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isPremium ? 'Manage Subscription' : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment gateway.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied, contact our support team.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageBillingPage;

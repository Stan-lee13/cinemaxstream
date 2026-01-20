import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { validatePremiumCode } from '@/utils/authUtils';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Download, Zap, Shield, Check, Loader2, Sparkles } from 'lucide-react';

const UpgradePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, isPro, isPremium, refreshTier } = useUserTier(user?.id);
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to apply a promo code');
      navigate('/auth');
      return;
    }

    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);

    try {
      const success = await validatePremiumCode(promoCode);
      
      if (success) {
        toast.success('Promo code applied successfully! You now have Pro access.');
        await refreshTier();
        setPromoCode('');
        // Small delay to let the state update
        setTimeout(() => {
          navigate('/account');
        }, 1500);
      } else {
        toast.error('Invalid or expired promo code');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Failed to apply promo code. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual viewers',
      features: [
        'Unlimited streaming',
        'Standard quality',
        'Basic support',
        'Full content catalog'
      ],
      current: tier === 'free',
      badge: null,
      buttonText: 'Current Plan',
      buttonDisabled: true
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      description: 'The ultimate streaming experience',
      features: [
        'Everything in Free',
        'Unlimited downloads',
        'HD & 4K quality streaming',
        'Priority VIP support',
        'Early access to new content',
        'Download for offline viewing',
        'No ads anywhere'
      ],
      current: tier === 'premium',
      badge: 'Most Popular',
      buttonText: isPremium ? 'Current Plan' : 'Upgrade to Premium',
      buttonDisabled: isPremium,
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Upgrade Your Experience
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock premium features including unlimited downloads, HD streaming, and priority support.
            </p>
          </div>

          {/* Current Status */}
          {user && (
            <div className="mb-8 p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Currently signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
              <p className="text-sm">
                Your current plan: <Badge variant="outline" className="ml-2 capitalize">{tier}</Badge>
              </p>
            </div>
          )}

          {/* Promo Code Section */}
          <Card className="mb-12 border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Have a Promo Code?
              </CardTitle>
              <CardDescription>
                Enter your promo code below to unlock Pro or Premium access instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApplyPromoCode} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Enter promo code (e.g., CINEMAX2024)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 text-center sm:text-left font-mono tracking-wider uppercase"
                  disabled={isApplying}
                />
                <Button 
                  type="submit" 
                  disabled={isApplying || !promoCode.trim()}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Code'
                  )}
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Pro codes unlock downloads. Premium codes unlock everything.
              </p>
            </CardContent>
          </Card>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative transition-all duration-300 ${
                  plan.highlight 
                    ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]' 
                    : 'border-border hover:border-primary/50'
                } ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.badge && (
                  <Badge 
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                      plan.name === 'Pro' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== 'forever' && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-6 ${
                      plan.highlight && !plan.buttonDisabled
                        ? 'bg-gradient-to-r from-primary to-primary/80' 
                        : ''
                    }`}
                    variant={plan.buttonDisabled ? 'outline' : 'default'}
                    disabled={plan.buttonDisabled}
                  >
                    {plan.current && <Check className="h-4 w-4 mr-2" />}
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Download, title: 'Unlimited Downloads', desc: 'Save content for offline viewing' },
              { icon: Zap, title: 'HD & 4K Quality', desc: 'Crystal clear streaming experience' },
              { icon: Shield, title: 'Priority Support', desc: 'Get help when you need it most' },
              { icon: Crown, title: 'Early Access', desc: 'Be first to watch new releases' }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Have questions about our plans?
            </p>
            <Button variant="outline" onClick={() => navigate('/faq')}>
              View FAQ
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UpgradePage;

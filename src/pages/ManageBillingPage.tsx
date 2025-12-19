import React, { useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Crown, Check, X, Star, Zap, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPromoModal } from '@/components/PremiumPromoModal';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const ManageBillingPage = () => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.from(".hero-text", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Plans Animation
      gsap.from(".plan-card", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.2,
        ease: "back.out(1.2)"
      });

      // FAQ Animation
      gsap.from(".faq-item", {
        y: 10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        delay: 0.4,
        scrollTrigger: {
          trigger: ".faq-section",
          start: "top 80%"
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
      current: !isPremium,
      icon: Shield
    },
    {
      name: 'Pro',
      price: '₦500',
      period: '/month',
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
      recommended: true,
      icon: Zap
    },
    {
      name: 'Premium',
      price: '₦1500',
      period: '/month',
      features: [
        'Unlimited streams',
        'Unlimited downloads',
        '4K streaming',
        'Premium-only catalog',
        'VIP support'
      ],
      limitations: [],
      current: isPremium,
      icon: Crown
    }
  ];

  const handleUpgrade = (planName: string) => {
    const paymentUrl = import.meta.env.VITE_STRIPE_PAYMENT_URL
      || `https://billing.cinemax-stream.com/upgrade?plan=${planName.toLowerCase()}`;

    window.open(paymentUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden" ref={containerRef}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <BackButton className="mb-8 hover:bg-white/5 border-white/10 text-gray-400 hover:text-white" />

        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="hero-text text-5xl md:text-6xl font-black tracking-tight mb-4">
              Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Ultimate Experience</span>
            </h1>
            <p className="hero-text text-xl text-white/50 max-w-2xl mx-auto font-medium">
              Upgrade your terminal priority to enjoy infinite access, hyper-definition quality, and offline buffering.
            </p>

            <div className="hero-text pt-4">
              <PremiumPromoModal>
                <button className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors border-b border-transparent hover:border-amber-400 pb-0.5">
                  <Crown className="w-4 h-4" />
                  Have a promo code? Redeem it here
                </button>
              </PremiumPromoModal>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className={`plan-card relative group rounded-3xl p-8 transition-all duration-300 hover:transform hover:-translate-y-2 ${plan.recommended
                    ? 'bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-2 border-amber-500/30 hover:border-amber-500/60 shadow-2xl shadow-amber-900/20'
                    : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                        <Star size={12} className="fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {plan.current && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-1">
                        <Check size={12} />
                        CURRENT PLAN
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.recommended ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-gray-400'
                      }`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-extrabold ${plan.recommended ? 'text-white' : 'text-gray-300'}`}>
                        {plan.price}
                      </span>
                      {plan.name !== 'Free' && (
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.recommended ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-800 text-gray-400'}`}>
                          <Check size={10} />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm opacity-50">
                        <div className="mt-0.5 p-0.5 rounded-full bg-red-900/20 text-red-500">
                          <X size={10} />
                        </div>
                        <span className="text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {plan.current ? (
                    <Button className="w-full bg-white/10 hover:bg-white/10 text-gray-400 cursor-default h-12 rounded-xl" disabled>
                      Currently Active
                    </Button>
                  ) : plan.name === 'Free' ? (
                    <Button
                      className="w-full bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl font-semibold border border-white/5"
                      onClick={() => navigate('/account')}
                    >
                      Manage Account
                    </Button>
                  ) : (
                    <Button
                      className={`w-full h-12 rounded-xl font-bold transition-all shadow-lg ${plan.recommended
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-900/20 hover:shadow-amber-900/40 hover:scale-[1.02]'
                        : 'bg-white text-black hover:bg-gray-200'
                        }`}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {isPremium ? 'Switch Plan' : 'Upgrade Now'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto faq-section">
            <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <HelpCircle className="text-gray-500" />
              Common Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: "Can I cancel anytime?", a: "Yes, absolutely. There are no lock-in contracts. You can cancel your subscription at any time from your account settings." },
                { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay through our secure encrypted payment gateway." },
                { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for all new Premium subscriptions. If you're not satisfied, just reach out to our support team." }
              ].map((faq, i) => (
                <div key={i} className="faq-item p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                  <h3 className="font-semibold text-lg mb-2 text-white">{faq.q}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageBillingPage;

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, Shield, BarChart, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const Cookies = () => {
  const [savedPreferences, setSavedPreferences] = useLocalStorage<CookiePreferences>('cookie-preferences', {
    essential: true,
    analytics: true,
    marketing: false,
    personalization: true
  });

  const [preferences, setPreferences] = useState<CookiePreferences>(savedPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPreferences(savedPreferences);
  }, [savedPreferences]);

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
    setHasChanges(true);
  };

  const saveCookiePreferences = () => {
    setSavedPreferences(preferences);
    setHasChanges(false);
    toast.success('Cookie preferences saved successfully');
    
    // Apply preferences immediately
    if (!preferences.analytics) {
      // Disable analytics tracking
      window.localStorage.setItem('analytics-disabled', 'true');
    } else {
      window.localStorage.removeItem('analytics-disabled');
    }
    
    if (!preferences.marketing) {
      // Disable marketing cookies
      window.localStorage.setItem('marketing-disabled', 'true');
    } else {
      window.localStorage.removeItem('marketing-disabled');
    }
    
    if (!preferences.personalization) {
      // Disable personalization
      window.localStorage.setItem('personalization-disabled', 'true');
    } else {
      window.localStorage.removeItem('personalization-disabled');
    }
  };

  const acceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    setPreferences(allEnabled);
    setSavedPreferences(allEnabled);
    setHasChanges(false);
    toast.success('All cookies accepted');
  };

  const rejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    setPreferences(essentialOnly);
    setSavedPreferences(essentialOnly);
    setHasChanges(false);
    toast.success('Only essential cookies enabled');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
              <Cookie className="h-8 w-8 text-cinemax-500" />
              Cookie Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              How we use cookies to improve your streaming experience
            </p>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button onClick={acceptAll} className="bg-cinemax-500 hover:bg-cinemax-600">
                  Accept All Cookies
                </Button>
                <Button onClick={rejectNonEssential} variant="outline">
                  Essential Only
                </Button>
              </div>
            </Card>

            {/* What are Cookies */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-2xl font-semibold mb-4">What are Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files stored on your device when you visit our website. They help us provide 
                you with a better experience by remembering your preferences, keeping you signed in, and analyzing 
                how you use our platform.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  <strong>Good to know:</strong> You can control and delete cookies through your browser settings. 
                  However, disabling certain cookies may affect your experience on CinemaxStream.
                </p>
              </div>
            </Card>

            {/* Cookie Categories */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-cinemax-500" />
                Cookie Categories & Preferences
              </h2>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-medium">Essential Cookies</h3>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Required</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      These cookies are necessary for the website to function properly. They enable core features 
                      like security, authentication, and basic functionality.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Examples: Session management, security tokens, load balancing
                    </p>
                  </div>
                  <div className="ml-4">
                    <Switch 
                      checked={preferences.essential} 
                      disabled={true}
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-medium">Analytics Cookies</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Help us understand how visitors interact with our website by collecting and reporting 
                      information anonymously. This helps us improve our service.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Examples: Page views, time spent, popular content, user journeys
                    </p>
                  </div>
                  <div className="ml-4">
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-medium">Marketing Cookies</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Used to track visitors across websites to display relevant ads and marketing content. 
                      These cookies are set by our advertising partners.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Examples: Ad targeting, conversion tracking, social media integration
                    </p>
                  </div>
                  <div className="ml-4">
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                    />
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-medium">Personalization Cookies</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Remember your preferences and settings to provide a personalized experience, 
                      such as language settings, theme preferences, and content recommendations.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Examples: Theme settings, language preferences, watch history, recommendations
                    </p>
                  </div>
                  <div className="ml-4">
                    <Switch 
                      checked={preferences.personalization} 
                      onCheckedChange={(value) => handlePreferenceChange('personalization', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  onClick={saveCookiePreferences}
                  className="bg-cinemax-500 hover:bg-cinemax-600"
                  disabled={!hasChanges}
                >
                  {hasChanges ? 'Save Preferences' : 'Preferences Saved'}
                </Button>
              </div>
            </Card>

            {/* Managing Cookies */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-2xl font-semibold mb-4">Managing Cookies in Your Browser</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Desktop Browsers</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                    <li>• Firefox: Settings → Privacy & Security → Cookies</li>
                    <li>• Safari: Preferences → Privacy → Cookies</li>
                    <li>• Edge: Settings → Privacy → Cookies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cinemax-400">Mobile Browsers</h3>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Chrome Mobile: Settings → Site Settings → Cookies</li>
                    <li>• Safari Mobile: Settings → Safari → Block All Cookies</li>
                    <li>• Firefox Mobile: Settings → Privacy → Cookies</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Third-Party Cookies */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                We use several third-party services that may set their own cookies:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/50 p-3 rounded">
                  <strong className="text-cinemax-400">Google Analytics</strong>
                  <p className="text-muted-foreground">Website traffic analysis</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded">
                  <strong className="text-cinemax-400">Cloudflare</strong>
                  <p className="text-muted-foreground">Security and performance</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded">
                  <strong className="text-cinemax-400">YouTube</strong>
                  <p className="text-muted-foreground">Video trailer embedding</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded">
                  <strong className="text-cinemax-400">Social Media</strong>
                  <p className="text-muted-foreground">Social media integration</p>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6 bg-secondary/20 border-border">
              <h2 className="text-2xl font-semibold mb-4">Questions About Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Us
              </Button>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-muted-foreground text-sm">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>This cookie policy is subject to change. We'll notify you of any significant updates.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cookies;

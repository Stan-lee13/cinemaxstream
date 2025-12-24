import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, Shield, BarChart, Target, Zap, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const Cookies = () => {
  const prefersReducedMotion = useReducedMotion();
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
    if (type === 'essential') return;

    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
    setHasChanges(true);
  };

  const saveCookiePreferences = () => {
    setSavedPreferences(preferences);
    setHasChanges(false);
    toast.success('Cookie matrix reconfiguration complete');

    if (!preferences.analytics) window.localStorage.setItem('analytics-disabled', 'true');
    else window.localStorage.removeItem('analytics-disabled');

    if (!preferences.marketing) window.localStorage.setItem('marketing-disabled', 'true');
    else window.localStorage.removeItem('marketing-disabled');

    if (!preferences.personalization) window.localStorage.setItem('personalization-disabled', 'true');
    else window.localStorage.removeItem('personalization-disabled');
  };

  const acceptAll = () => {
    const allEnabled = { essential: true, analytics: true, marketing: true, personalization: true };
    setPreferences(allEnabled);
    setSavedPreferences(allEnabled);
    setHasChanges(false);
    toast.success('All tracking protocols authorized');
  };

  const rejectNonEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false, personalization: false };
    setPreferences(essentialOnly);
    setSavedPreferences(essentialOnly);
    setHasChanges(false);
    toast.success('Privacy shield engaged: Essential only');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] bg-blue-900/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-indigo-900/5 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <BackButton className="hover:bg-white/5 text-gray-400 hover:text-white border-white/10 rounded-xl" />
          </div>

          <motion.div
            className="cookie-header mb-16"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-900/20">
                <Cookie className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">Tracking Infrastructure</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
              Cookie Policy
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-2xl">
              Defining how we use temporal data buffers to optimize your high-fidelity streaming interface.
            </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <Card className="cookie-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 text-center md:text-left">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Protocol Presets</h2>
                  <p className="text-gray-500 text-sm font-medium">Instantly engage pre-configured tracking matrices.</p>
                </div>
                <div className="flex flex-wrap gap-4 relative z-10">
                  <Button onClick={acceptAll} className="h-14 px-8 bg-white text-black hover:bg-cinemax-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 hover:scale-105">
                    Accept Full Matrix
                  </Button>
                  <Button onClick={rejectNonEssential} variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105">
                    Privacy Shield Only
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            >
              <Card className="cookie-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-12">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Settings className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Configuration Layers</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="group/item flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                          <Shield className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Core Infrastructure</h3>
                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Critical</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium mb-3">
                        Required for system stability, authentication, and security protocols. Disabling these is not supported.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Security Tokens', 'Session Keys', 'Load Balancing'].map(t => (
                          <span key={t} className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <Switch
                        checked={preferences.essential}
                        disabled={true}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="group/item flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                          <BarChart className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Analytical Telemetry</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium mb-3">
                        Synthesizes anonymous usage patterns to optimize the intelligence of our content delivery matrix.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Neural Heatmaps', 'Latency Metrics', 'Path Synthesis'].map(t => (
                          <span key={t} className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="group/item flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                          <Zap className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Neural Customization</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium mb-3">
                        Adapts the interface to your unique neuro-profile, remembering language and aesthetic preferences.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Aesthetic Sync', 'Language Nodes', 'Preference Maps'].map(t => (
                          <span key={t} className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <Switch
                        checked={preferences.personalization}
                        onCheckedChange={(value) => handlePreferenceChange('personalization', value)}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </div>

                  <div className="group/item flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] transition-all">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                          <Target className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">External Syndication</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium mb-3">
                        Synchronizes with partner networks to display relevant external signals and syndication.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Partner Uplinks', 'Signal Attribution', 'Syndication'].map(t => (
                          <span key={t} className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Info size={16} />
                    <p className="text-xs font-bold uppercase tracking-widest">Preferences are sharded locally</p>
                  </div>
                  <Button
                    onClick={saveCookiePreferences}
                    disabled={!hasChanges}
                    className={`h-16 px-12 rounded-2xl font-black uppercase tracking-widest transition-all ${hasChanges
                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/20 hover:scale-[1.02]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                      }`}
                  >
                    {hasChanges ? 'Deploy Configuration' : 'Sync Established'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <Card className="cookie-section bg-[#111]/80 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Syndicated Nodes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Google Core', task: 'Traffic Synthesis' },
                    { name: 'Cloudflare', task: 'Defensive Integrity' },
                    { name: 'AlphaStream', task: 'Temporal Caching' },
                    { name: 'Social Uplink', task: 'Neural Sharing' }
                  ].map((node, i) => (
                    <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-colors">
                      <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-1">{node.name}</p>
                      <p className="text-white font-bold text-sm">{node.task}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
            >
              <div className="cookie-section bg-gradient-to-br from-blue-900/10 to-transparent border border-white/10 rounded-[40px] p-12 text-center group">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Query Infrastructure?</h3>
                <p className="text-gray-400 mb-10 max-w-lg mx-auto font-medium">
                  If you require technical sharding details or protocol documentation, initiate an uplink.
                </p>
                <Button
                  variant="outline"
                  className="h-14 px-10 border-white/10 hover:bg-white/5 text-white rounded-xl font-black uppercase tracking-widest transition-all group-hover:scale-105"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact HQ Operatives
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="cookie-section text-center py-6"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            >
              <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Protocol Last Synchronized: {new Date().toLocaleDateString()}</p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;

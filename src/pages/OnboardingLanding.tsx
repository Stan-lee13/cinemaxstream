import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, LogIn, User, Film, Sparkles, Play, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Global Sync",
    description: "Access movies, series, anime & more—synchronized across every device.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Neural Playback",
    description: "Instant streaming with zero buffer. The precision of high-end engineering.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Quantum Secure",
    description: "Your library and activity are protected by industry-leading encryption.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: <Play className="h-6 w-6" />,
    title: "8K Ready",
    description: "Experience hyper-definition streaming with optimized data efficiency.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  }
];

const OnboardingLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#050608] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ambient-blob absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="ambient-blob absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="ambient-blob absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="hero-content flex flex-col lg:flex-row items-center justify-between gap-16 mb-20 w-full">
          <div className="flex-1 flex flex-col items-start text-left space-y-8">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-blue-400">
                Streaming engineered for performance
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.95]">
              A premium streaming
              <span className="text-blue-500"> platform without compromises.</span>
            </h1>

            <p className="text-gray-300 text-base md:text-lg max-w-xl font-medium leading-relaxed">
              Cinemax Stream combines cinematic visuals, ultra-low latency playback, and intelligent personalization
              to deliver a world-class experience on every device.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-semibold text-base md:text-lg tracking-tight transition-all hover:scale-105 active:scale-95 shadow-[0_18px_45px_rgba(15,23,42,0.8)]"
              >
                Start watching in minutes
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1.5" />
              </button>
              <div className="flex flex-col text-sm text-gray-400">
                <span className="font-semibold text-gray-200">No setup fees. Cancel anytime.</span>
                <span>Optimized for low bandwidth and high-end home theaters alike.</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-xs md:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sub-2s average start time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-blue-400" />
                </div>
                <span>Encrypted, privacy-first infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users className="h-3 w-3 text-emerald-400" />
                </div>
                <span>Designed for global audiences</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="relative rounded-[32px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-black border border-white/10 px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-[0.3em]">
                    Live session preview
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Tonight&apos;s streaming profile
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
                    <Film className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-xs text-gray-300">
                <div className="rounded-2xl bg-black/60 border border-white/5 p-4 flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Playback</span>
                  <span className="text-base font-semibold text-white">Adaptive 4K HDR</span>
                  <span>Intelligent bitrate tuned to your connection in real time.</span>
                </div>
                <div className="rounded-2xl bg-black/60 border border-white/5 p-4 flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Availability</span>
                  <span className="text-base font-semibold text-white">99.9% uptime</span>
                  <span>Global edge delivery with automatic fallback providers.</span>
                </div>
                <div className="rounded-2xl bg-black/60 border border-white/5 p-4 flex flex-col gap-2 col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Personalization</span>
                  <span className="text-base font-semibold text-white">Profile-aware recommendations</span>
                  <span>Each session is tuned using your tastes, history, and watch intent.</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Session health: Excellent</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  Pro streaming architecture
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="feature-card group p-8 rounded-[32px] bg-[#111]/40 border border-white/5 backdrop-blur-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl ${feat.bgColor} ${feat.color} ${feat.borderColor} border flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">System Online</span>
        </div>

        <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} Cinemax Stream • Internal Build v4.2.0
        </p>

        <div className="flex gap-8">
          <button onClick={() => navigate('/terms')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Terms</button>
          <button onClick={() => navigate('/privacy')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Privacy</button>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLanding;

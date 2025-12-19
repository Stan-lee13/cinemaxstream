import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, LogIn, User, Film, Sparkles, Play, Shield, Zap } from "lucide-react";
import gsap from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });

      gsap.from(".feature-card", {
        scale: 0.9,
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.6
      });

      // Floating animation for ambient blobs
      gsap.to(".ambient-blob", {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-sans" ref={containerRef}>
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ambient-blob absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="ambient-blob absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="ambient-blob absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="hero-content flex flex-col items-center text-center space-y-8 mb-24">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Next Generation Entertainment</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            CINEMAX<span className="text-blue-500">STREAM</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl font-medium leading-relaxed">
            The hyper-modern streaming collective. Engineered for the future of cinematic digital consumption.
          </p>

          <button
            onClick={() => navigate('/auth')}
            className="group relative flex items-center gap-3 px-10 py-5 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-black text-xl md:text-2xl uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-3xl shadow-white/5"
          >
            Enter the Matrix
            <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
          </button>
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

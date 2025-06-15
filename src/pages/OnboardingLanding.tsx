
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, LogIn, User, Film } from "lucide-react";
const features = [
  {
    icon: <Users className="h-6 w-6 text-cinemax-400" />,
    title: "Stream Everything",
    description: "Access movies, series, anime & more—all in one place."
  },
  {
    icon: <LogIn className="h-6 w-6 text-cinemax-400" />,
    title: "Watch Instantly",
    description: "No downloads, no waiting. Hit play and dive right in any time."
  },
  {
    icon: <User className="h-6 w-6 text-cinemax-400" />,
    title: "Personalized Experience",
    description: "Save favorites, continue watching, and get personal recommendations for you."
  },
  {
    icon: <Film className="h-6 w-6 text-cinemax-400" />,
    title: "1080p Streaming, Low Data",
    description: "Stream your favorite movie at 1080p with low data cost."
  }
];
const OnboardingLanding: React.FC = () => {
  const navigate = useNavigate();
  return <div className="relative min-h-screen bg-gradient-to-tr from-zinc-900 via-[#25032a] to-cinemax-900 overflow-hidden flex flex-col items-center justify-center">
      {/* Soft floating hero gradient blobs for depth */}
      <div className="absolute -top-24 -left-32 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-cinemax-500 via-cinemax-400/80 to-transparent opacity-30 blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cinemax-700 opacity-20 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 left-[-120px] w-[220px] h-[120px] rounded-[4rem] bg-white/10 dark:bg-cinemax-800/20 opacity-15 blur-2xl z-0" />

      {/* Hero Section */}
      <section className="w-full max-w-3xl mx-auto px-6 sm:px-10 pt-24 pb-12 flex flex-col items-center relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gradient-to-r from-cinemax-400 via-cinemax-500 to-cinemax-700 bg-clip-text text-transparent text-4xl font-extrabold tracking-tight drop-shadow">
            CinemaxStream
          </span>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white leading-tight">
          The Ultimate Modern Streaming Platform
        </h1>
        <p className="text-base sm:text-lg text-cinemax-200/90 text-center max-w-2xl mx-auto mb-6 font-medium">Unlock an endless world of movies, shows and anime. Experience seamless streaming, curated collections, and your own personalized library — all in one elegant platform.</p>
        <button onClick={() => navigate('/auth')} className="group relative inline-flex items-center justify-center px-8 py-3 mt-2 text-base sm:text-lg font-semibold rounded-xl shadow-xl bg-gradient-to-r from-cinemax-600 to-cinemax-400 hover:from-cinemax-500 hover:to-cinemax-600 text-white transition-all focus:outline-none border-none backdrop-blur-xl border-[1.5px] border-white/10 hover:scale-102 active:scale-98">
          Get started now
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="absolute inset-0 rounded-xl pointer-events-none border-white/10 border blur-sm" />
        </button>
      </section>
      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-14 relative z-10">
        <div className="flex flex-wrap gap-6 justify-center">
          {features.map((feat, idx) => <div key={idx} className="group backdrop-blur-2xl bg-white/5 dark:bg-[#3c3440]/20 border border-white/10 shadow-[0_6px_32px_rgba(75,0,75,0.09)] rounded-2xl flex flex-col items-center text-center p-6 w-full min-w-[220px] max-w-xs transition-all hover:scale-105 hover:bg-white/10 hover:shadow-xl">
              <div className="mb-3">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-cinemax-300 group-hover:text-cinemax-500">{feat.title}</h3>
              <p className="text-sm text-slate-200/70 mt-2">{feat.description}</p>
            </div>)}
        </div>
      </section>
      {/* Footer style info */}
      <footer className="text-xs text-slate-400 pb-5 px-4 z-10 text-center">
        &copy; {new Date().getFullYear()} CinemaxStream. All rights reserved.
      </footer>
    </div>;
};
export default OnboardingLanding;

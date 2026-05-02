
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import RoutedApp from "@/components/app/RoutedApp";
import InstallPrompt from "@/components/InstallPrompt";
import ProductionMonitor from "@/components/ProductionMonitor";
import Walkthrough from "@/components/Walkthrough";
import AdGuideModal from "@/components/AdGuideModal";
import { useAdGuide } from "@/hooks/useAdGuide";
import { useNewContentNotifier } from "@/hooks/useNewContentNotifier";

const AppInner = () => {
  const adGuide = useAdGuide();

  // Subscribes to Supabase Realtime + polls TMDB to deliver in-app + native
  // browser notifications when new movies/series drop.
  useNewContentNotifier();

  return (
    <>
      <RoutedApp />
      <InstallPrompt />
      <ProductionMonitor />
      <Walkthrough />
      <AdGuideModal
        isOpen={adGuide.isOpen}
        onClose={adGuide.close}
        onDismissPermanently={adGuide.dismissPermanently}
      />
    </>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-cinemax-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;


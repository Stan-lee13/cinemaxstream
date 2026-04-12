
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
import { useInteractiveOnboarding } from "@/hooks/useInteractiveOnboarding";
import { useAuth } from "@/contexts/authHooks";

const AppInner = () => {
  const adGuide = useAdGuide();
  const { isAuthenticated } = useAuth();
  const onboarding = useInteractiveOnboarding();

  // Auto-start interactive onboarding for first-time authenticated users
  useEffect(() => {
    if (isAuthenticated && !onboarding.completed && !onboarding.isRunning) {
      // Delay to let page render
      const t = setTimeout(() => onboarding.startOnboarding(), 2000);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, onboarding.completed, onboarding.isRunning]);

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



import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import RoutedApp from "@/components/app/RoutedApp";
import InstallPrompt from "@/components/InstallPrompt";

// Show splash screen briefly on initial app load
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
        {/* SplashScreen is not routed, used as top-level loader */}
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
        <RoutedApp />
        <InstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;

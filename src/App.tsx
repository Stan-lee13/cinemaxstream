
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuthState";
import RoutedApp from "@/components/app/RoutedApp";

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
        <AuthProvider>
          {/* SplashScreen is not routed, used as top-level loader */}
          <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <div className="w-8 h-8 border-4 border-cinemax-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </AuthProvider>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <RoutedApp />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  );
};

export default App;

// Note: src/App.tsx was refactored to use dedicated routing/auth logic files for maintainability!

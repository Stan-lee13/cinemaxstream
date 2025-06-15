import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuthState";
import Index from "./pages/Index";
import ContentDetail from "./pages/ContentDetail";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import SplashScreen from "./components/SplashScreen";
import ResetPassword from "./pages/ResetPassword";
import WatchHistory from "./pages/WatchHistory";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { useAuth } from "@/hooks/useAuthState";
import OnboardingAuth from "@/pages/OnboardingAuth";
import OnboardingLanding from "@/pages/OnboardingLanding";
import PasswordUpdate from "./pages/PasswordUpdate";

// AppRoutes is now used only for main-app authenticated routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/password-update" element={<PasswordUpdate />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/movies" element={<Category />} />
      <Route path="/series" element={<Category />} />
      <Route path="/anime" element={<Category />} />
      <Route path="/sports" element={<Category />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/favorites" element={<Category />} />
      <Route path="/watch-history" element={<WatchHistory />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/account" element={<Account />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/downloads" element={
        <div className="min-h-screen pt-20 px-4 container mx-auto">
          <h1 className="text-3xl font-bold mb-4">Downloads</h1>
          <p className="text-gray-400">Your downloaded content will appear here.</p>
        </div>
      } />
      <Route path="/subscription" element={
        <div className="min-h-screen bg-background pt-20 px-4 container mx-auto">
          <h1 className="text-3xl font-bold mb-4">Premium Subscription</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-card p-6 rounded-lg border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Standard definition streaming
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Watch on one device at a time
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Limited content library
                </li>
              </ul>
              <div className="bg-gray-600 text-white px-4 py-2 rounded text-center">Current Plan</div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-cinemax-500 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cinemax-500 px-3 py-1 text-xs font-bold">POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Ultra HD 4K streaming
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Watch on up to 4 devices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Full content library
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Ad-free experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Offline downloads
                </li>
              </ul>
              <div className="bg-cinemax-500 hover:bg-cinemax-600 text-white px-4 py-2 rounded text-center cursor-pointer transition-colors">Upgrade Now</div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Family</h3>
              <p className="text-3xl font-bold mb-4">$14.99<span className="text-sm font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Everything in Premium
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Watch on up to 6 devices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Parental controls
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited downloads
                </li>
              </ul>
              <div className="border border-gray-500 hover:bg-cinemax-500 hover:text-white text-gray-300 px-4 py-2 rounded text-center cursor-pointer transition-colors">Select Plan</div>
            </div>
          </div>
        </div>
      } />
      <Route path="/:category" element={<Category />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// This component handles gating the app for onboarding/auth flow
const RoutedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLanding, setShowLanding] = React.useState(true);

  // When user lands on /auth route, show auth page
  React.useEffect(() => {
    if (location.pathname === "/auth") {
      setShowLanding(false);
    }
  }, [location.pathname]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-cinemax-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated and on the main route: first landing, then auth after CTA
  if (!isAuthenticated) {
    // If on /auth, show onboarding auth page
    if (location.pathname === "/auth") {
      return <OnboardingAuth />;
    }
    // If landing not dismissed, show landing
    if (showLanding && location.pathname === "/") {
      return <OnboardingLanding />;
    }
    // Otherwise, force landing for unknown/forgotten route
    if (!showLanding) {
      return <OnboardingAuth />;
    }
    return <OnboardingLanding />;
  }

  // If authenticated but tries to go to onboarding, redirect to app
  if (
    isAuthenticated &&
    (location.pathname === "/auth" || location.pathname === "/")
  ) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise (authenticated, normal app)
  return <AppRoutes />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Automatically hide splash screen after 3 seconds
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
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </TooltipProvider>
    );
  }

  // Always render BrowserRouter and all navigation logic inside
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoutedApp />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;

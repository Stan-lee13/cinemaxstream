
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import SplashScreen from "@/components/SplashScreen";
import OnboardingAuth from "@/pages/OnboardingAuth";
import OnboardingLanding from "@/pages/OnboardingLanding";

const RoutedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(true);

  // Show onboarding auth page only for /auth route
  useEffect(() => {
    if (location.pathname === "/auth") {
      setShowLanding(false);
    }
  }, [location.pathname]);

  if (isLoading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  // Not authenticated and on the main route: first landing, then auth after CTA
  if (!isAuthenticated) {
    if (location.pathname === "/auth") {
      return <OnboardingAuth />;
    }
    if (showLanding && location.pathname === "/") {
      return <OnboardingLanding />;
    }
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

  return <AppRoutes />;
};

export default RoutedApp;

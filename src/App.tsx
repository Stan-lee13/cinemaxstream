
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import Index from "./pages/Index"; // Lazy load
// import ContentDetail from "./pages/ContentDetail"; // Lazy load
// import Category from "./pages/Category"; // Lazy load
// import NotFound from "./pages/NotFound"; // Lazy load
// import Auth from "./pages/Auth"; // Lazy load
// import UserProfile from "./pages/UserProfile"; // Lazy load
import SplashScreen from "./components/SplashScreen"; // SplashScreen is used as fallback, so not lazy loaded
// import ResetPassword from "./pages/ResetPassword"; // Lazy load
// import WatchHistory from "./pages/WatchHistory"; // Lazy load
// import Downloads from "./pages/Downloads"; // Lazy load
// import Settings from "./pages/Settings"; // Lazy load
// import SearchPage from "./pages/SearchPage"; // Lazy load
// import FavoritesPage from "./pages/FavoritesPage"; // Lazy load
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy load page components
const Index = React.lazy(() => import("./pages/Index"));
const ContentDetail = React.lazy(() => import("./pages/ContentDetail"));
const Category = React.lazy(() => import("./pages/Category"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Auth = React.lazy(() => import("./pages/Auth"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const WatchHistory = React.lazy(() => import("./pages/WatchHistory"));
const Downloads = React.lazy(() => import("./pages/Downloads"));
const Settings = React.lazy(() => import("./pages/Settings"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage")); // Lazy load FavoritesPage


const AppRoutes = () => {
  // Define JSX element for subscription page to avoid repetition
  // (DownloadsPage is now a separate component)
  const SubscriptionPage = (
    <div className="min-h-screen bg-background pt-20 px-4 container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Premium Subscription</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Subscription options */}
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
          <Button variant="outline" className="w-full">Current Plan</Button>
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
          <Button className="w-full bg-cinemax-500 hover:bg-cinemax-600">Upgrade Now</Button>
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
          <Button variant="outline" className="w-full hover:bg-cinemax-500 hover:text-white">Select Plan</Button>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/search" element={<SearchPage />} /> {/* Add SearchPage route BEFORE /:category */}
      <Route path="/movies" element={<Category />} />
      <Route path="/series" element={<Category />} />
      <Route path="/anime" element={<Category />} />
      <Route path="/sports" element={<Category />} />
      <Route path="/:category" element={<Category />} /> {/* Generic category route must be after specific ones */}

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/favorites" element={<FavoritesPage />} /> {/* Updated to FavoritesPage */}
        <Route path="/watch-history" element={<WatchHistory />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/subscription" element={SubscriptionPage} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true); // Keep initial splash screen logic

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Keep existing splash screen duration
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <React.Suspense fallback={<SplashScreen onComplete={() => {}} />}> {/* Use SplashScreen for Suspense fallback */}
              <AppRoutes />
            </React.Suspense>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
};

export default App;

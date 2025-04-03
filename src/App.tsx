
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuthState";
import { ThemeProvider } from "@/hooks/useTheme"; // Add this import
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import ContentDetail from "./pages/ContentDetail";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import SplashScreen from "./components/SplashScreen";
import ResetPassword from "./pages/ResetPassword";
import WatchHistory from "./pages/WatchHistory"; // Add this import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/movies" element={<Category />} />
      <Route path="/series" element={<Category />} />
      <Route path="/anime" element={<Category />} />
      <Route path="/sports" element={<Category />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/favorites" element={<Category />} />
      <Route path="/watch-history" element={<WatchHistory />} /> {/* Add this route */}
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
      } />
      <Route path="/:category" element={<Category />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider> {/* Add this provider */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <AppRoutes />
              )}
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

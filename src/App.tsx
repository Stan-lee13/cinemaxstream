
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuthState";
import Index from "./pages/Index";
import ContentDetail from "./pages/ContentDetail";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import SplashScreen from "./components/SplashScreen";

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
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/movies" element={<Category />} />
      <Route path="/series" element={<Category />} />
      <Route path="/anime" element={<Category />} />
      <Route path="/sports" element={<Category />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/favorites" element={<Category />} />
      <Route path="/downloads" element={
        <div className="min-h-screen pt-20 px-4 container mx-auto">
          <h1 className="text-3xl font-bold mb-4">Downloads</h1>
          <p className="text-gray-400">Your downloaded content will appear here.</p>
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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuthState";
import Index from "./pages/Index";
import ContentDetail from "./pages/ContentDetail";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

// Route guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

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
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Category />
        </ProtectedRoute>
      } />
      <Route path="/downloads" element={
        <ProtectedRoute>
          <div className="min-h-screen pt-20 px-4 container mx-auto">
            <h1 className="text-3xl font-bold mb-4">Downloads</h1>
            <p className="text-gray-400">Your downloaded content will appear here.</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/:category" element={<Category />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

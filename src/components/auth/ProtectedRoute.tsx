import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthState';
import SplashScreen from '@/components/SplashScreen'; // Or any other loading component

interface ProtectedRouteProps {
  children?: React.ReactNode; // For wrapping multiple routes or direct children
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while checking auth status
    // You might want a more persistent splash screen or a spinner
    return <SplashScreen onComplete={() => {}} />; // Simplified onComplete for this context
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    // Pass the current location to redirect back after login (optional)
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child components
  // Outlet is used if this ProtectedRoute is used as a layout route for nested routes
  // Children is used if direct children are passed
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

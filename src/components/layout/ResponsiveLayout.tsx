/**
 * Responsive Layout Component
 * 
 * Provides consistent layout structure across all devices.
 * Handles mobile navigation, safe areas, and scroll behavior.
 */

import React, { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavigation from "@/components/navigation/MobileNavigation";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showMobileNav?: boolean;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = memo(({ 
  children, 
  showMobileNav = true,
  className = ''
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-background antialiased ${className}`}>
      {/* Main Content Area */}
      <main 
        id="main-content"
        className={`
          min-h-screen
          ${isMobile && showMobileNav ? 'pb-24' : ''}
          transition-all duration-300 ease-in-out
        `}
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Mobile Navigation - Fixed at bottom */}
      {isMobile && showMobileNav && (
        <aside 
          role="navigation" 
          aria-label="Mobile navigation"
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <MobileNavigation />
        </aside>
      )}
    </div>
  );
});

ResponsiveLayout.displayName = 'ResponsiveLayout';

export default ResponsiveLayout;

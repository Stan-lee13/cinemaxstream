
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavigation from "@/components/navigation/MobileNavigation";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showMobileNav?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  showMobileNav = true 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <main 
        id="main-content"
        className={isMobile && showMobileNav ? "pb-20" : ""}
        role="main"
        aria-label="Main content"
        tabIndex={-1}
      >
        {children}
      </main>
      {isMobile && showMobileNav && (
        <aside role="navigation" aria-label="Mobile navigation">
          <MobileNavigation />
        </aside>
      )}
    </div>
  );
};

export default ResponsiveLayout;

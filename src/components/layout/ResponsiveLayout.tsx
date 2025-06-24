
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
      <main className={isMobile && showMobileNav ? "pb-20" : ""}>
        {children}
      </main>
      {isMobile && showMobileNav && <MobileNavigation />}
    </div>
  );
};

export default ResponsiveLayout;

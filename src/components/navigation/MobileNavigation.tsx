
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Film, Tv, Play, Heart, User, Search, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/movies", icon: Film, label: "Movies" },
    { path: "/series", icon: Tv, label: "Series" },
    { path: "/anime", icon: Play, label: "Anime" },
    ...(isAuthenticated ? [
      { path: "/downloads", icon: Download, label: "Downloads" },
      { path: "/favorites", icon: Heart, label: "Favorites" },
      { path: "/profile", icon: User, label: "Profile" }
    ] : [])
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-t border-border safe-area-pb md:hidden mobile-nav">
      <div className="flex items-center justify-around py-2 px-1 safe-area-pb">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors max-w-[80px] focus:outline-none focus:ring-2 focus:ring-cinemax-500 ${
              isActive(path)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-current={isActive(path) ? 'page' : undefined}
          >
            <Icon size={20} />
            <span className="text-xs font-medium text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;


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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-gray-800 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2 min-h-[60px] max-w-screen overflow-hidden">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors min-w-0 flex-1 ${
              isActive(path)
                ? "text-cinemax-400 bg-cinemax-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span className="text-xs font-medium truncate max-w-[50px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;

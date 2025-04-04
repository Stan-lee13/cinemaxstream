
import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, isActive = false }) => {
  const { theme } = useTheme();
  
  // Theme-specific styles
  const getThemeStyles = () => {
    switch(theme) {
      case "midnight":
        return {
          active: "text-purple-400 border-b-2 border-purple-500",
          hover: "hover:text-purple-400 after:bg-purple-500"
        };
      case "neon":
        return {
          active: "text-green-400 neon-text border-b-2 border-green-400",
          hover: "hover:text-green-400 after:bg-green-400"
        };
      case "sunrise":
        return {
          active: "text-amber-400 border-b-2 border-amber-400",
          hover: "hover:text-amber-400 after:bg-amber-400"
        };
      case "forest":
        return {
          active: "text-emerald-400 border-b-2 border-emerald-400",
          hover: "hover:text-emerald-400 after:bg-emerald-400"
        };
      default: // default theme
        return {
          active: "text-white border-b-2 border-cinemax-500",
          hover: "hover:text-white after:bg-cinemax-500"
        };
    }
  };
  
  const styles = getThemeStyles();
  
  return (
    <Link 
      to={href} 
      className={`text-gray-300 transition-colors relative group ${isActive ? styles.active : ''}`}
    >
      <span>{children}</span>
      <span className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${isActive ? 'w-full' : `w-0 group-${styles.hover} group-hover:w-full`}`}></span>
    </Link>
  );
};

export default NavItem;

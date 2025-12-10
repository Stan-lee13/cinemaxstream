
import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, isActive = false }) => {
  
  // Theme-specific styles - properly structured
  const themeStyles = {
    midnight: {
      active: "text-purple-400 border-b-2 border-purple-500",
      underline: "group-hover:bg-purple-400"
    },
    neon: {
      active: "text-green-400 neon-text border-b-2 border-green-400",
      underline: "group-hover:bg-green-400"
    },
    sunrise: {
      active: "text-amber-400 border-b-2 border-amber-400",
      underline: "group-hover:bg-amber-400"
    },
    forest: {
      active: "text-emerald-400 border-b-2 border-emerald-400",
      underline: "group-hover:bg-emerald-400"
    },
    default: {
      active: "text-white border-b-2 border-cinemax-500",
      underline: "group-hover:bg-cinemax-500"
    }
  };
  
  const styles = themeStyles[theme as keyof typeof themeStyles] || themeStyles.default;
  
  return (
    <Link 
      to={href} 
      className={`text-gray-300 transition-colors relative group ${isActive ? styles.active : ''} hover:text-gray-100`}
    >
      <span>{children}</span>
      <span className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 bg-gray-100 ${isActive ? 'w-full' : `w-0 ${styles.underline} group-hover:w-full`}`}></span>
    </Link>
  );
};

export default NavItem;

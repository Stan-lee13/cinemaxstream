
import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, isActive = false }) => (
  <Link 
    to={href} 
    className={`text-gray-300 hover:text-white transition-colors relative group ${isActive ? 'text-white' : ''}`}
  >
    <span>{children}</span>
    <span className={`absolute -bottom-1 left-0 h-0.5 bg-cinemax-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
  </Link>
);

export default NavItem;

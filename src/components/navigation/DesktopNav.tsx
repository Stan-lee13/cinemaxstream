import React from "react";
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";

const DesktopNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <NavItem href="/" isActive={isActive('/')}>Home</NavItem>
      <NavItem href="/movies" isActive={isActive('/movies')}>Movies</NavItem>
      <NavItem href="/series" isActive={isActive('/series')}>TV Series</NavItem>
      <NavItem href="/anime" isActive={isActive('/anime')}>Anime</NavItem>
      {/* <NavItem href="/sports" isActive={isActive('/sports')}>Sports</NavItem> */}
    </nav>
  );
};

export default DesktopNav;

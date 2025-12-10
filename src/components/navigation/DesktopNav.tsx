
import React from "react";
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";

const DesktopNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <nav className="hidden md:flex items-center space-x-6" aria-label="Primary navigation">
      <NavItem href="/" isActive={isActive('/')}>Home</NavItem>
      <NavItem href="/movies" isActive={isActive('/movies')}>Movies</NavItem>
      <NavItem href="/series" isActive={isActive('/series')}>TV Series</NavItem>
      <NavItem href="/anime" isActive={isActive('/anime')}>Anime</NavItem>
    </nav>
  );
};

export default DesktopNav;

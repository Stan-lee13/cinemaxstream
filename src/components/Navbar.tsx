
import React from "react";
import { Link } from "react-router-dom";
import DesktopNav from "./navigation/DesktopNav";
import SearchBar from "./navigation/SearchBar";
import FavoritesButton from "./navigation/FavoritesButton";
import MobileMenu from "./navigation/MobileMenu";
import UserMenu from "./navigation/UserMenu";

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-gradient">CinemaxStream</h1>
            </Link>
            
            <DesktopNav />
          </div>
          
          <div className="flex items-center space-x-4">
            <SearchBar />
            <FavoritesButton />
            <MobileMenu />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

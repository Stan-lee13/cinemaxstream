
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('input[name="search"]')?.focus();
      }, 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    document.querySelector<HTMLInputElement>('input[name="search"]')?.focus();
  };

  return (
    <>
      {isSearchOpen ? (
        <form onSubmit={handleSearch} className="relative animate-fade-in">
          <Input 
            name="search"
            placeholder="Search for movies, series..." 
            className="w-60 bg-secondary/70 border-gray-700 focus:border-cinemax-500 text-white"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <Button 
              variant="ghost" 
              size="icon" 
              type="button"
              onClick={clearSearch}
              className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 p-0 text-gray-400"
            >
              <X size={14} />
            </Button>
          ) : null}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSearch}
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <X size={18} />
          </Button>
        </form>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSearch}
          className="text-gray-300 hover:text-white"
          aria-label="Search"
        >
          <Search size={20} />
        </Button>
      )}
    </>
  );
};

export default SearchBar;

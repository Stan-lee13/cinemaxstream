import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5)); // Only keep last 5 searches
        }
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    try {
      // Add current search to beginning, remove duplicates, keep only 5
      const updated = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

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
      saveRecentSearch(searchQuery.trim());
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

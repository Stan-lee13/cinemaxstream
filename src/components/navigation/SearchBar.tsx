
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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {isSearchOpen ? (
        <form onSubmit={handleSearch} className="relative animate-fade-in">
          <Input 
            placeholder="Search for movies, series..." 
            className="w-60 bg-secondary/70 border-gray-700 focus:border-cinemax-500 text-white"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

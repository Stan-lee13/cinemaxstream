
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { tmdbApi } from "@/services/tmdbApi";
import { ContentItem } from "@/types/content";
import { useQuery } from "@tanstack/react-query";

const SmartSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, []);

  // Fetch search suggestions with better error handling
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['search-suggestions', searchQuery],
    queryFn: async () => {
      try {
        const results = await tmdbApi.searchContent(searchQuery, 1);
        return Array.isArray(results) ? results : [];
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
    retry: 1,
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    try {
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
        inputRef.current?.focus();
      }, 100);
    } else {
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (item: ContentItem) => {
    saveRecentSearch(item.title);
    navigate(`/content/${item.id}`);
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative">
      {isSearchOpen ? (
        <div className="relative animate-fade-in">
          <form onSubmit={handleSearch}>
            <Input 
              ref={inputRef}
              name="search"
              placeholder="Search movies, series, anime..." 
              className="w-60 bg-secondary/70 border-gray-700 focus:border-cinemax-500 text-white"
              autoFocus
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
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

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cinemax-500 mx-auto"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-400">
                  Search temporarily unavailable
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs text-gray-400 px-2 py-1 mb-2">Search Results</div>
                  {suggestions.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                        <img
                          src={item.poster || item.image || '/placeholder.svg'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{item.year}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-cinemax-500/20 text-cinemax-400 rounded">
                            {item.type}
                          </span>
                          {item.rating && (
                            <span className="text-xs text-yellow-500">★ {item.rating}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              ) : null}

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-2 border-t border-gray-700">
                  <div className="text-xs text-gray-400 px-2 py-1 mb-2">Recent Searches</div>
                  {recentSearches.map((query, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(query);
                        handleSearch(new Event('submit') as any);
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                    >
                      <Search size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-300">{query}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default SmartSearch;

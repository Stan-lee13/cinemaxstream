
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
// use native input for proper accessibility binding
import { useNavigate } from 'react-router-dom';
import { searchContent } from '@/services/tmdbApi';
import { SearchResult } from '@/types/content';
import { toast } from 'sonner';

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounce search with AbortController for cancellation
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const searchResults = await searchContent(query);
        
        if (!isMountedRef.current) return;
        
        // Results are already proper SearchResult types from tmdbApiProduction
        const mappedResults: SearchResult[] = (searchResults?.results || [])
          .slice(0, 8);
        setResults(mappedResults);
        setSelectedIndex(-1);
      } catch (error) {
        if (!isMountedRef.current) return;
        
        const errorMsg = error instanceof Error ? error.message : 'Search failed';
        // Only show error if not aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setError('Search failed. Please try again.');
          setResults([]);
          toast.error(errorMsg || 'Search failed. Please try again.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  // Close search when clicking outside and handle Escape key
  // Handle result click (stable) — defined before effects that reference it
  const handleResultClick = useCallback((result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    const searchType = result.media_type || (result.name ? 'tv' : 'movie');
    navigate(`/content/${result.id}`, { state: { contentType: searchType } });
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [results, selectedIndex, handleResultClick]);

  // (moved above) stable callback for selecting a result

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setSelectedIndex(-1);
  }, []);

  const getImageUrl = (posterPath: string | null | undefined) => {
    if (!posterPath) return 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=200&h=300&fit=crop&crop=entropy';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  const getTitle = (result: SearchResult) => {
    return result.title || result.name || 'Untitled';
  };

  const getYear = (result: SearchResult) => {
    const date = result.release_date || result.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  const getMediaType = (result: SearchResult) => {
    if (result.media_type === 'movie') return 'Movie';
    if (result.media_type === 'tv') return 'TV Show';
    return 'Content';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <>
          <label id="search-input-label" htmlFor="search-input" className="sr-only">Search movies and shows</label>
          <input
            id="search-input"
            type="search"
            placeholder="Search movies, shows..."
            aria-labelledby="search-input-label"
            title="Search movies and shows"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            ref={inputRef}
            className="pl-10 pr-10 bg-background/50 border-gray-700 focus:border-cinemax-500 text-foreground placeholder-gray-400 w-full rounded-md py-2 px-3"
          />
        </>
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query || isLoading) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-cinemax-500" />
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="py-2" role="presentation">
              {results.map((result, idx) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleResultClick(result);
                  }}
                  tabIndex={0}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`flex items-center gap-3 p-3 cursor-pointer group transition-colors ${
                    idx === selectedIndex ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageUrl(result.poster_path)}
                      alt={getTitle(result)}
                      className="w-12 h-16 object-cover rounded bg-gray-800 group-hover:ring-2 group-hover:ring-cinemax-500 transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=200&h=300&fit=crop&crop=entropy';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-cinemax-400 transition-colors">
                      {getTitle(result)}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                        {getMediaType(result)}
                      </span>
                      {getYear(result) && (
                        <>
                          <span>•</span>
                          <span>{getYear(result)}</span>
                        </>
                      )}
                      {result.vote_average && result.vote_average > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {result.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

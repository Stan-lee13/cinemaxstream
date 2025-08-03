
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { searchContent } from '@/services/tmdbApi';
import { toast } from 'sonner';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const SmartSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchContent(query);
        setResults(searchResults?.results?.slice(0, 8) || []);
      } catch (error) {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
        setResults([]);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    
    // Navigate to content detail page
    navigate(`/content/${result.id}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  const getImageUrl = (posterPath: string | null) => {
    if (!posterPath) return 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=200&h=300&fit=crop&crop=face';
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
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search movies, shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-background/50 border-gray-700 focus:border-cinemax-500 text-white placeholder-gray-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
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
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors cursor-pointer group rounded-lg mx-2"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageUrl(result.poster_path)}
                      alt={getTitle(result)}
                      className="w-12 h-16 object-cover rounded bg-gray-800 group-hover:ring-2 group-hover:ring-cinemax-500 transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=200&h=300&fit=crop&crop=face';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded group-hover:from-cinemax-500/20 transition-colors"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-cinemax-400 transition-colors">
                      {getTitle(result)}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs font-medium">
                        {getMediaType(result)}
                      </span>
                      {getYear(result) && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-300">{getYear(result)}</span>
                        </>
                      )}
                      {result.vote_average && result.vote_average > 0 && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-yellow-400 font-medium">{result.vote_average.toFixed(1)}</span>
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

export default SmartSearch;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For a possible search input on the page
import { Skeleton } from '@/components/ui/skeleton';
import { tmdbApi, ContentItem } from '@/services/tmdbApi'; // Assuming ContentItem is exported
import { Play, Download, Search as SearchIcon } from 'lucide-react'; // SearchIcon for input

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useQuery();
  const searchQuery = queryParams.get('q') || '';

  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchQuery); // For input field on page

  useEffect(() => {
    window.scrollTo(0, 0);
    if (searchQuery) {
      const fetchResults = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const results = await tmdbApi.searchContent(searchQuery);
          setSearchResults(results);
        } catch (err) {
          setError('Failed to fetch search results. Please try again.');
          console.error("Search error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResults();
    } else {
      setSearchResults([]); // Clear results if no query
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentSearchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(currentSearchTerm.trim())}`);
    }
  };

  const renderContentGrid = (items: ContentItem[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {items.map(item => (
        <div
          key={item.id}
          className="movie-card cursor-pointer animate-fade-in bg-card rounded-lg overflow-hidden shadow-lg group"
          // No direct onClick here, Link handles navigation
        >
          <Link to={`/content/${item.id}`} className="block">
            <img
              src={item.image || '/placeholder.svg'}
              alt={item.title}
              className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="p-3">
            <Link to={`/content/${item.id}`} className="block">
              <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-cinemax-500 transition-colors">
                {item.title}
              </h3>
            </Link>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{item.year}</span>
              <span className="capitalize">{item.type || item.category}</span>
            </div>
            {/* Placeholder for Play/Download buttons if needed in future, for now, focusing on display */}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array(10).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800 mt-2" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Results</h1>
          {searchQuery && <p className="text-gray-400">Showing results for: "{searchQuery}"</p>}
        </div>

        {/* Optional: Search input directly on the page for new searches */}
        <form onSubmit={handleSearchSubmit} className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for movies, series, anime..."
              value={currentSearchTerm}
              onChange={(e) => setCurrentSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-lg"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button type="submit" className="w-full mt-3 bg-cinemax-500 hover:bg-cinemax-600">
            Search
          </Button>
        </form>

        {isLoading ? (
          renderSkeletonGrid()
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        ) : !searchQuery ? (
           <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-6 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">Find Your Favorite Content</h2>
            <p className="text-gray-400">
              Enter a movie, series, or anime name in the search bar above.
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          renderContentGrid(searchResults)
        ) : (
          <div className="text-center py-12">
             <img src="/icons/empty-search.svg" alt="No results" className="w-32 h-32 mx-auto mb-6 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-gray-400">
              We couldn't find any content matching "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Download, Search, ImageOff } from "lucide-react";
import { tmdbApi, ContentItem } from "@/services/tmdbApi";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalizedRecommendations } from "@/utils/videoUtils";

const CategoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  
  // Get category from URL path
  const category = location.pathname.slice(1); // Remove leading slash
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(1);
    setAllContent([]);
    setHasMoreContent(true);
  }, [category]);
  
  // Get personalized recommendations if user is logged in
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => user?.id ? getPersonalizedRecommendations(user.id) : Promise.resolve([]),
    enabled: !!user?.id && category === 'recommendations',
  });
  
  // Fetch data based on category with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['category', category, page],
    queryFn: async () => {
      if (category === 'recommendations' && user?.id) {
        return [];
      }
      
      let result: ContentItem[] = [];
      
      if (category === 'movies') {
        result = await tmdbApi.getPopularMovies();
      } else if (category === 'series') {
        // Get both popular TV shows and mix in some animated series
        const tvShows = await tmdbApi.getPopularTvShows();
        const animeShows = await tmdbApi.getAnime();
        // Mix them for "best of both worlds" - 70% regular series, 30% anime
        const mixedSeries = [
          ...tvShows.slice(0, 14),
          ...animeShows.slice(0, 6)
        ].sort(() => Math.random() - 0.5); // Shuffle for variety
        result = mixedSeries;
      } else if (category === 'anime') {
        result = await tmdbApi.getAnime();
      } else {
        result = await tmdbApi.getContentByCategory(category || 'trending');
      }
      
      // Limit to 20 items per page
      const startIndex = (page - 1) * 20;
      const paginatedResult = result.slice(startIndex, startIndex + 20);
      
      // Check if there's more content
      setHasMoreContent(result.length > page * 20);
      
      return paginatedResult;
    },
    enabled: category !== 'recommendations' || !user?.id,
  });
  
  // Update content list when new data comes in
  useEffect(() => {
    if (data && data.length > 0) {
      if (page === 1) {
        setAllContent(data);
      } else {
        setAllContent(prev => [...prev, ...data]);
      }
    }
  }, [data, page]);
  
  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchData = await tmdbApi.searchContent(searchQuery);
      const results = searchData.results || [];
      
      // Filter results based on current category
      if (category && category !== 'trending' && category !== 'recommendations') {
        const filteredResults = results.filter(item => {
          if (category === 'movies') return item.category === 'movie';
          if (category === 'series') return item.category === 'series' || item.category === 'anime';
          if (category === 'anime') return item.category === 'anime' || 
            (item.category === 'series' && item.description?.toLowerCase().includes('anime'));
          return true;
        });
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      // Silently handle search errors in production
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };
  
  // Load more content
  const loadMoreContent = () => {
    if (!isLoading && hasMoreContent) {
      setPage(prev => prev + 1);
    }
  };
  
  // Determine title and description based on category
  const getCategoryInfo = () => {
    switch (category) {
      case 'movies':
        return { 
          title: "Movies",
          description: "Explore our collection of the latest blockbusters, indie gems, and classic films."
        };
      case 'series':
        return { 
          title: "TV Series",
          description: "Dive into captivating TV series and anime - the best of both worlds in entertainment."
        };
      case 'anime':
        return { 
          title: "Anime",
          description: "Discover the best in Japanese animation, from action-packed adventures to heartwarming stories."
        };
      case 'sports':
        return {
          title: "Sports",
          description: "Catch up on the latest sports content, highlights, and documentaries."
        };
      case 'documentary':
        return {
          title: "Documentaries",
          description: "Explore real stories and fascinating documentaries from around the world."
        };
      case 'trending':
        return { 
          title: "Trending Now",
          description: "Discover what's popular and trending in movies and TV shows right now."
        };
      case 'recommendations':
        return {
          title: "For You",
          description: "Personalized recommendations based on your viewing history."
        };
      default:
        return { 
          title: "Explore",
          description: "Browse our extensive collection of entertainment content."
        };
    }
  };
  
  const { title, description } = getCategoryInfo();
  
  // Handle content click
  const handleContentClick = (id: string, type: string) => {
    navigate(`/content/${id}`);
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array(20).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
    </div>
  );

  // Render content card with proper error handling
  const renderContentCard = (item: ContentItem) => (
    <div 
      key={item.id} 
      className="movie-card cursor-pointer animate-fade-in"
      onClick={() => handleContentClick(item.id, item.category)}
    >
      {item.image ? (
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full aspect-[2/3] object-cover rounded-lg"
          onError={(e) => {
            // Handle image loading errors by showing a fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              // Create fallback element using DOM methods
              const fallback = document.createElement('div');
              fallback.className = 'flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg';
              fallback.setAttribute('role', 'img');
              fallback.setAttribute('aria-label', `Image unavailable for ${item.title}`);
              
              // Create SVG using DOM
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('class', 'mx-auto text-gray-600');
              svg.setAttribute('width', '42');
              svg.setAttribute('height', '42');
              svg.setAttribute('fill', 'none');
              svg.setAttribute('viewBox', '0 0 24 24');
              svg.setAttribute('aria-hidden', 'true');
              
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', 'M9.44 9.44a5 5 0 0 0 7.07 7.07m-1.06-8.13a5 5 0 0 0-7.07 7.07M9 5v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 3l18 18');
              path.setAttribute('stroke', 'currentColor');
              path.setAttribute('stroke-width', '2');
              path.setAttribute('stroke-linecap', 'round');
              path.setAttribute('stroke-linejoin', 'round');
              
              svg.appendChild(path);
              
              const text = document.createElement('span');
              text.className = 'text-xs mt-1 text-gray-500';
              text.textContent = 'Image unavailable';
              
              fallback.appendChild(svg);
              fallback.appendChild(text);
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <div 
          className="flex flex-col items-center justify-center h-full w-full bg-gray-950/90 rounded-lg"
          role="img"
          aria-label={`No image available for ${item.title}`}
        >
          <ImageOff size={42} className="mx-auto text-gray-600" aria-hidden="true" />
          <span className="text-xs mt-1 text-gray-500">Image unavailable</span>
        </div>
      )}
      <div className="movie-overlay">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span className="text-yellow-500 font-medium">{item.rating}</span>
          </span>
          <span className="text-xs">{item.year}</span>
        </div>
        <h3 className="font-medium line-clamp-1">{item.title}</h3>
        
        <div className="flex gap-2 mt-2">
          <Button className="h-9 rounded-md px-3 w-full gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Play size={14} />
            <span>Play</span>
          </Button>
          <Button className="h-9 rounded-md px-3 w-8 h-8 p-0 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Download size={14} />
          </Button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Error Loading Content</h1>
            <p className="text-gray-400">There was a problem loading the content. Please try again later.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const contentToDisplay = searchQuery ? searchResults : allContent;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
              <p className="text-gray-400 max-w-2xl">{description}</p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchQuery && (
                  <Button
                    type="button"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:bg-accent hover:text-accent-foreground"
                    onClick={clearSearch}
                  >
                    ×
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* Search Results or Main Content */}
          {searchQuery && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">
                {isSearching 
                  ? "Searching..." 
                  : searchResults.length > 0 
                    ? `Search Results for "${searchQuery}"` 
                    : `No results found for "${searchQuery}"`}
              </h2>
              
              {isSearching ? renderSkeleton() : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {searchResults.map(renderContentCard)}
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="text-center mt-6">
                  <Button className="hover:bg-accent hover:text-accent-foreground" onClick={clearSearch}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Main Content */}
          {!searchQuery && (
            <>
              {category === 'recommendations' && user?.id ? (
                <>
                  {loadingRecommendations ? renderSkeleton() : recommendations && recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {recommendations.map(renderContentCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-medium mb-2">No recommendations yet</h3>
                      <p className="text-gray-400 mb-6">
                        Watch more content to get personalized recommendations.
                      </p>
                      <Button onClick={() => navigate('/')}>
                        Explore Content
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isLoading && page === 1 ? renderSkeleton() : contentToDisplay.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {contentToDisplay.map(renderContentCard)}
                      </div>
                      
                      {/* Load More Button */}
                      {hasMoreContent && (
                        <div className="mt-12 flex justify-center">
                          <Button 
                            className="bg-cinemax-500 hover:bg-cinemax-600 px-8"
                            onClick={loadMoreContent}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                              </>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-medium mb-2">No content found</h3>
                      <p className="text-gray-400 mb-6">
                        We couldn't find any content in this category.
                      </p>
                      <Button onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
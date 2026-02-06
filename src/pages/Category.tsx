import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import BackButton from "@/components/BackButton";

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
  const { category: categoryId } = useParams(); // For /similar/:category route
  
  // Check if we're on a similar content route
  const isSimilarRoute = location.pathname.startsWith('/similar/');
  
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
  
  // Fetch data based on category with real TMDB pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['category', category, page, categoryId],
    queryFn: async () => {
      if (category === 'recommendations' && user?.id) {
        return [];
      }
      
      let result: ContentItem[] = [];
      
      // Handle similar content route
      if (isSimilarRoute && categoryId) {
        result = await tmdbApi.getSimilarContent(categoryId, 'movie');
      } else if (category === 'movies') {
        result = await tmdbApi.getPopularMovies(page);
      } else if (category === 'series') {
        const tvShows = await tmdbApi.getPopularTvShows(page);
        result = tvShows;
      } else if (category === 'anime') {
        result = await tmdbApi.getAnime(page);
      } else {
        result = await tmdbApi.getContentByCategory(category || 'trending', page);
      }
      
      // TMDB returns 20 per page; if we got results, there's likely more
      setHasMoreContent(result.length >= 20);
      
      return result;
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
    if (isSimilarRoute) {
      return { 
        title: "More Like This",
        description: "Discover content similar to what you've watched."
      };
    }
    
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
      case 'featured':
        return { 
          title: "Featured Content",
          description: "Hand-picked selection of top movies and shows just for you."
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
  
  // Render content card
  const renderContentCard = (item: ContentItem) => {
    // Use image directly if it's already a full URL, otherwise construct TMDB URL
    const imageUrl = item.image?.startsWith('http') ? item.image : (item.image ? `https://image.tmdb.org/t/p/w500${item.image}` : null);
    
    return (
    <div 
      key={item.id} 
      className="group relative cursor-pointer"
      onClick={() => navigate(`/content/${item.id}`, { state: { contentType: item.category } })}
    >
      <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative movie-card">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <ImageOff className="h-8 w-8 text-gray-500" />
          </div>
        )}
        
        <div className="movie-overlay">
          <div className="flex gap-2 mb-2">
            <Button 
              size="icon" 
              className="h-8 w-8 bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                // Handle play action
              }}
            >
              <Play size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="secondary"
              className="h-8 w-8 bg-white/10 hover:bg-white/20 border-none"
              onClick={(e) => {
                e.stopPropagation();
                // Handle download action
              }}
            >
              <Download size={16} />
            </Button>
          </div>
          
          <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
          <p className="text-xs text-gray-300 mt-1">
            {item.year} • {item.rating}
          </p>
        </div>
      </div>
    </div>
    );
  };
  
  // Render skeleton loading
  const renderSkeleton = (count: number = 20) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
    </div>
  );
  
  // Content to display (either allContent or data depending on page)
  const contentToDisplay = page > 1 ? allContent : (data || []);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-gray-400 max-w-2xl">
              {description}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-10">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-3 bg-secondary/50 border-border focus:border-cinemax-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
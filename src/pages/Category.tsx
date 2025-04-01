
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Download, Search } from "lucide-react";
import { tmdbApi, ContentItem } from "@/services/tmdbApi";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthState";
import { getPersonalizedRecommendations } from "@/utils/videoUtils";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);
  
  // Get personalized recommendations if user is logged in
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => user?.id ? getPersonalizedRecommendations(user.id) : Promise.resolve([]),
    enabled: !!user?.id && category === 'recommendations',
  });
  
  // Fetch data based on category
  const { data, isLoading, error } = useQuery({
    queryKey: ['category', category, page],
    queryFn: async () => {
      if (category === 'recommendations' && user?.id) {
        return [];
      }
      return await tmdbApi.getContentByCategory(category || 'trending');
    },
    enabled: category !== 'recommendations' || !user?.id,
  });
  
  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await tmdbApi.searchContent(searchQuery);
      
      // Filter results if we're on a specific category page
      if (category && category !== 'trending' && category !== 'recommendations') {
        const filteredResults = results.filter(item => {
          if (category === 'movies') return item.category === 'movie';
          if (category === 'series') return item.category === 'series';
          if (category === 'anime') return item.category === 'anime' || 
            (item.category === 'series' && item.description?.toLowerCase().includes('anime'));
          return true;
        });
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
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
          description: "Dive into captivating TV series across all genres, from drama to comedy and beyond."
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

  // Loading state for search
  const renderSearchSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
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
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400"
                    onClick={clearSearch}
                  >
                    ×
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* Search Results */}
          {searchQuery && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">
                {isSearching 
                  ? "Searching..." 
                  : searchResults.length > 0 
                    ? `Search Results for "${searchQuery}"` 
                    : `No results found for "${searchQuery}"`}
              </h2>
              
              {isSearching ? (
                renderSearchSkeleton()
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {searchResults.map((item) => (
                    <div 
                      key={item.id} 
                      className="movie-card cursor-pointer animate-fade-in"
                      onClick={() => handleContentClick(item.id, item.category)}
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full aspect-[2/3] object-cover rounded-lg"
                      />
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
                          <Button variant="secondary" size="sm" className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none">
                            <Play size={14} />
                            <span>Play</span>
                          </Button>
                          <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/10 hover:bg-white/20 border-none">
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="text-center mt-6">
                  <Button variant="ghost" onClick={clearSearch}>
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
                  {loadingRecommendations ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {Array(10).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
                          <Skeleton className="h-4 w-2/3 bg-gray-800" />
                          <Skeleton className="h-4 w-1/2 bg-gray-800" />
                        </div>
                      ))}
                    </div>
                  ) : recommendations && recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {recommendations.map((item) => (
                        <div 
                          key={item.id} 
                          className="movie-card cursor-pointer animate-fade-in"
                          onClick={() => handleContentClick(item.id, item.category)}
                        >
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full aspect-[2/3] object-cover rounded-lg"
                          />
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
                              <Button variant="secondary" size="sm" className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none">
                                <Play size={14} />
                                <span>Play</span>
                              </Button>
                              <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/10 hover:bg-white/20 border-none">
                                <Download size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
                          <Skeleton className="h-4 w-2/3 bg-gray-800" />
                          <Skeleton className="h-4 w-1/2 bg-gray-800" />
                        </div>
                      ))}
                    </div>
                  ) : data && data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {data.map((item) => (
                        <div 
                          key={item.id} 
                          className="movie-card cursor-pointer animate-fade-in"
                          onClick={() => handleContentClick(item.id, item.category)}
                        >
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full aspect-[2/3] object-cover rounded-lg"
                          />
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
                              <Button variant="secondary" size="sm" className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none">
                                <Play size={14} />
                                <span>Play</span>
                              </Button>
                              <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/10 hover:bg-white/20 border-none">
                                <Download size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
              
              <div className="mt-12 flex justify-center">
                <Button 
                  className="bg-secondary hover:bg-secondary/80 px-8"
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading || !data || data.length === 0}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;

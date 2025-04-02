
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { tmdbApi } from "@/services/tmdbApi";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch data using React Query
  const { data: trendingMovies, isLoading: loadingTrendingMovies } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: () => tmdbApi.getTrendingMovies(),
  });

  const { data: popularMovies, isLoading: loadingPopularMovies } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: () => tmdbApi.getPopularMovies(),
  });

  const { data: popularTvShows, isLoading: loadingPopularTvShows } = useQuery({
    queryKey: ['popularTvShows'],
    queryFn: () => tmdbApi.getPopularTvShows(),
  });

  const { data: trendingTvShows, isLoading: loadingTrendingTvShows } = useQuery({
    queryKey: ['trendingTvShows'],
    queryFn: () => tmdbApi.getTrendingTvShows(),
  });

  // Create a combined trending list for the hero section
  const featuredContent: FeaturedContent[] = trendingMovies?.slice(0, 3).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.backdrop,
    category: item.category,
    year: item.year,
    duration: item.duration,
    rating: item.rating
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {loadingTrendingMovies ? (
          <div className="h-[85vh] w-full bg-gray-900 animate-pulse"></div>
        ) : (
          <HeroSection featuredContent={featuredContent} />
        )}
        
        {loadingTrendingMovies || loadingTrendingTvShows ? (
          <ContentRowSkeleton title="Trending Now" />
        ) : (
          <ContentRow 
            title="Trending Now" 
            viewAllLink="/trending" 
            items={[...trendingMovies || [], ...trendingTvShows || []].slice(0, 8) as Content[]} 
          />
        )}
        
        {loadingPopularMovies ? (
          <ContentRowSkeleton title="Popular Movies" />
        ) : (
          <ContentRow 
            title="Popular Movies" 
            viewAllLink="/movies" 
            items={popularMovies || [] as Content[]} 
          />
        )}
        
        {loadingPopularTvShows ? (
          <ContentRowSkeleton title="TV Series" />
        ) : (
          <ContentRow 
            title="TV Series" 
            viewAllLink="/series" 
            items={popularTvShows || [] as Content[]} 
          />
        )}
        
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-xl p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Experience Premium Streaming and Downloads</h2>
                <p className="text-gray-300 mb-6">
                  Get unlimited access to thousands of movies, TV shows, anime and sports. 
                  Watch on any device or download for offline viewing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button className="bg-cinemax-500 hover:bg-cinemax-600 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button className="bg-transparent border border-gray-600 hover:border-white text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Skeleton component for loading state
const ContentRowSkeleton = ({ title }: { title: string }) => (
  <div className="py-8">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto scrollbar-none pb-2">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="w-[180px] sm:w-[220px]">
            <Skeleton className="h-[260px] sm:h-[300px] rounded-lg bg-gray-800" />
            <Skeleton className="h-5 w-2/3 mt-2 bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Index;

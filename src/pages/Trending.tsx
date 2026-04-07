import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import ContentCard from "@/components/ContentCard";
import { ContentItem } from "@/types/content";
import BackButton from "@/components/BackButton";

const TrendingPage = () => {
  const navigate = useNavigate();

  const { data: trendingMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["trending-movies"],
    queryFn: () => tmdbApi.getTrendingMovies(1),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: trendingTV, isLoading: tvLoading } = useQuery({
    queryKey: ["trending-tv"],
    queryFn: () => tmdbApi.getTrendingTvShows(1),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !moviesLoading // Only run after movies query completes to stagger loading
  });

  // Combine trending movies and TV shows
  const allTrending = [...(trendingMovies || []), ...(trendingTV || [])];

  // Remove duplicates based on ID
  const uniqueTrending = allTrending.filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );

  // Sort randomly to prevent visual repetition
  const shuffledTrending = [...uniqueTrending].sort(() => Math.random() - 0.5);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BackButton className="mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Trending Now</h1>
            <p className="text-gray-400 max-w-2xl">
              Discover what's popular right now in movies and TV shows. Updated daily with the latest trending content.
            </p>
          </div>

          {(moviesLoading || tvLoading) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-800 rounded" />
                  <div className="h-4 w-1/2 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : shuffledTrending.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {shuffledTrending.map((item: ContentItem) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No trending content found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any trending content at the moment.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrendingPage;
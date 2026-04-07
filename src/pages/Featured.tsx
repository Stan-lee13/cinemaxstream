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

const FeaturedPage = () => {
  const navigate = useNavigate();

  const { data: featuredContent, isLoading } = useQuery({
    queryKey: ["featured-content"],
    queryFn: () => tmdbApi.getFeaturedContent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Featured Content</h1>
            <p className="text-gray-400 max-w-2xl">
              Handpicked selection of the best movies and TV shows currently available. Updated regularly with fresh picks.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-800 rounded" />
                  <div className="h-4 w-1/2 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : featuredContent && featuredContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Randomize order to prevent visual repetition */}
              {featuredContent.sort(() => Math.random() - 0.5).map((item: ContentItem) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No featured content found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any featured content at the moment.
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

export default FeaturedPage;
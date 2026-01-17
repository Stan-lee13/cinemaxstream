import React, { memo } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import SeriesSection from "@/components/SeriesSection";
import Footer from "@/components/Footer";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import ContinueWatching from "@/components/ContinueWatching";
import useAuth from "@/contexts/authHooks";
import CategoryBanner from "@/components/CategoryBanner";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import ContentCard from "@/components/ContentCard";
import { ContentItem } from "@/types/content";

/**
 * Homepage - Main landing page
 * 
 * Features:
 * - Hero section with featured content
 * - Continue Watching section (authenticated users)
 * - Just for You personalized content
 * - Content rows by category
 */
const Index = memo(() => {
  const { isAuthenticated } = useAuth();

  // Get hourly rotating "Just for You" content
  const { data: rotatingContent, isLoading: rotatingLoading } = useQuery({
    queryKey: ['rotating-content', Math.floor(Date.now() / (1000 * 60 * 60))],
    queryFn: async () => {
      const [trending, popular, anime] = await Promise.all([
        tmdbApi.getTrendingMovies(1),
        tmdbApi.getPopularMovies(1),
        tmdbApi.getAnime(1),
      ]);
      
      const mixedContent = [...trending.slice(0, 4), ...popular.slice(0, 3), ...anime.slice(0, 3)];
      return mixedContent.sort(() => Math.random() - 0.5).slice(0, 10);
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <ResponsiveLayout>
      <Navbar />
      <HeroSection />
      
      <div className="py-8 md:py-16 space-y-8 md:space-y-16">
        {/* Continue Watching - Only for authenticated users */}
        {isAuthenticated && <ContinueWatching />}

        {/* Just for You - Personalized Recommendations */}
        {isAuthenticated && (
          <section className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Just for You</h2>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                Refreshes Hourly
              </span>
            </div>
            
            {rotatingLoading ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="min-w-[180px] h-[260px] bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rotatingContent && rotatingContent.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
                {rotatingContent.map((item: ContentItem) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : null}
          </section>
        )}
        
        <ContentRow 
          title="Trending Now" 
          category="trending" 
          showViewAll={true}
        />
        <ContentRow 
          title="Popular Movies" 
          category="movies" 
          showViewAll={true}
        />
        <SeriesSection />
        <ContentRow 
          title="Featured Content" 
          category="featured" 
          showViewAll={true}
        />

        {/* Documentaries Section */}
        <div>
          <CategoryBanner category="documentary" />
          <ContentRow 
            title="Explore Documentaries" 
            category="documentary" 
            showViewAll={true}
          />
        </div>

        <ContentRow 
          title="Anime Collection" 
          category="anime" 
          showViewAll={true}
        />
      </div>
      <Footer />
    </ResponsiveLayout>
  );
});

Index.displayName = 'Index';

export default Index;

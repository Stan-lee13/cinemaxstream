
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import SeriesSection from "@/components/SeriesSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuthState";
import CategoryBanner from "@/components/CategoryBanner";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="py-16 space-y-16">
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
        {isAuthenticated && (
          <ContentRow 
            title="Recommended for You" 
            category="recommended" 
            showViewAll={true}
          />
        )}

        {/* Sports Picks Row - visually improved */}
        <div>
          <CategoryBanner category="sports" />
          <ContentRow 
            title="Live & Top Sports" 
            category="sports" 
            showViewAll={true}
          />
        </div>
        
        {/* Documentaries Row - visually improved */}
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
    </div>
  );
};

export default Index;

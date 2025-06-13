
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import SeriesSection from "@/components/SeriesSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuthState";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Provider wrapper is in App.tsx */}
      <Navbar />
      <HeroSection />
      
      {/* Content Sections */}
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
        
        {/* Series Section */}
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
        
        <ContentRow 
          title="Anime Collection" 
          category="anime" 
          showViewAll={true}
        />
        
        <ContentRow 
          title="Sports & Documentaries" 
          category="sports" 
          showViewAll={true}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

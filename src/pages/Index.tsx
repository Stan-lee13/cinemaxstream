
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import SeriesSection from "@/components/SeriesSection";
import Footer from "@/components/Footer";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import PersonalizedSections from "@/components/PersonalizedSections";
import { useAuth } from "@/contexts/AuthContext";
import CategoryBanner from "@/components/CategoryBanner";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ResponsiveLayout>
      <Navbar />
      <HeroSection />
      <div className="py-8 md:py-16 space-y-8 md:space-y-16">
        {/* Personalized sections for authenticated users */}
        {isAuthenticated && <PersonalizedSections />}
        
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

        {/* Documentaries Row */}
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
};

export default Index;

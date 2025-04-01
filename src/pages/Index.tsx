
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { moviesData, seriesData, animeData, sportsData, trendingData, popularData } from "@/data/mockData";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        
        <ContentRow 
          title="Trending Now" 
          viewAllLink="/trending" 
          items={trendingData} 
        />
        
        <ContentRow 
          title="Popular Movies" 
          viewAllLink="/movies" 
          items={moviesData} 
        />
        
        <ContentRow 
          title="TV Series" 
          viewAllLink="/series" 
          items={seriesData} 
        />
        
        <ContentRow 
          title="Anime" 
          viewAllLink="/anime" 
          items={animeData} 
        />
        
        <ContentRow 
          title="Sports" 
          viewAllLink="/sports" 
          items={sportsData} 
        />
        
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
                  <button className="bg-cinemax-500 hover:bg-cinemax-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Start Free Trial
                  </button>
                  <button className="bg-transparent border border-gray-600 hover:border-white text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Learn More
                  </button>
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

export default Index;

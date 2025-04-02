
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentRow from '@/components/ContentRow';
import Footer from '@/components/Footer';
import { tmdbApi } from '@/services/tmdbApi';
import { getPersonalizedRecommendations } from '@/utils/videoUtils';
import { useAuth } from '@/hooks/useAuthState';
import SplashScreen from '@/components/SplashScreen';

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState<Content[]>([]);
  const [popularShows, setPopularShows] = useState<Content[]>([]);
  const [animeContent, setAnimeContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Map TMDB content to our app's content format
  const mapToContentType = (item: any): Content => {
    return {
      id: item.id.toString(),
      title: item.title || '',
      image: item.image || item.poster || '',
      poster: item.image || item.poster || '',
      backdrop: item.backdrop || '',
      description: item.description || '',
      year: item.year || '',
      rating: item.rating || '',
      category: item.category || '',
      duration: item.duration || '',
      type: item.type || '',
      trailer_key: item.id.toString() // Using ID as placeholder for trailer key
    };
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending movies
        const movies = await tmdbApi.getTrendingMovies();
        setTrendingMovies(movies.map(mapToContentType));
        
        // Set featured content from trending movies
        if (movies.length > 0) {
          const featuredItems: FeaturedContent[] = movies.slice(0, 3).map(item => ({
            id: item.id.toString(),
            title: item.title,
            description: item.description,
            image: item.backdrop || item.image,
            category: item.category,
            year: item.year,
            duration: item.duration || 'N/A',
            rating: item.rating,
            trailer_key: item.id.toString() // Using ID as placeholder for trailer key
          }));
          
          setFeaturedContent(featuredItems);
        }
        
        // Fetch popular TV shows
        const shows = await tmdbApi.getPopularTvShows();
        setPopularShows(shows.map(mapToContentType));
        
        // Fetch anime content
        const anime = await tmdbApi.getAnime();
        setAnimeContent(anime.map(mapToContentType));
        
        // Fetch personalized recommendations if user is authenticated
        if (isAuthenticated && user) {
          const recommendations = await getPersonalizedRecommendations(user.id);
          setPersonalizedContent(
            Array.isArray(recommendations) 
              ? recommendations.map((item: any) => mapToContentType(item)) 
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-700 mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <>
          <Navbar />
          
          <main>
            <HeroSection featuredContent={featuredContent} />
            
            {isAuthenticated && personalizedContent.length > 0 && (
              <ContentRow 
                title="Recommended for You" 
                viewAllLink="/recommendations" 
                items={personalizedContent} 
              />
            )}
            
            <ContentRow 
              title="Trending Movies" 
              viewAllLink="/movies" 
              items={trendingMovies} 
            />
            
            <ContentRow 
              title="Popular TV Shows" 
              viewAllLink="/series" 
              items={popularShows} 
            />
            
            <ContentRow 
              title="Anime" 
              viewAllLink="/anime" 
              items={animeContent} 
            />
          </main>
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;

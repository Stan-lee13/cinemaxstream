
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentRow from '@/components/ContentRow';
import Footer from '@/components/Footer';
import { tmdbApi } from '@/services/tmdbApi';
import { getPersonalizedRecommendations } from '@/utils/videoUtils';
import { useAuth } from '@/hooks/useAuthState';
import SplashScreen from '@/components/SplashScreen';
import LoadingState from '@/components/LoadingState';

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
        console.log("Fetching data for Index page");
        setIsLoading(true);
        
        // Fetch trending movies
        const movies = await tmdbApi.getTrendingMovies();
        console.log("Fetched trending movies:", movies.length);
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
        console.log("Fetched popular shows:", shows.length);
        setPopularShows(shows.map(mapToContentType));
        
        // Fetch anime content
        const anime = await tmdbApi.getAnime();
        console.log("Fetched anime:", anime.length);
        setAnimeContent(anime.map(mapToContentType));
        
        // Fetch personalized recommendations if user is authenticated
        if (isAuthenticated && user) {
          console.log("Fetching recommendations for user:", user.id);
          try {
            const recommendations = await getPersonalizedRecommendations(user.id);
            console.log("Fetched recommendations:", recommendations);
            setPersonalizedContent(
              Array.isArray(recommendations) 
                ? recommendations.map((item: any) => mapToContentType(item)) 
                : []
            );
          } catch (recError) {
            console.error("Error fetching recommendations:", recError);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        console.log("Finished loading data");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user]);

  // Hide splash screen after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  
  if (isLoading) {
    return <LoadingState message="Loading amazing content for you..." />;
  }
  
  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
};

export default Index;

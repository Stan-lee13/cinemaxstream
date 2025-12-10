import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Play, Download, Star } from 'lucide-react';
import { tmdbApi, ContentItem } from '@/services/tmdbApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';

const TopRated = () => {
  const navigate = useNavigate();

  // Fetch top rated content
  const { data: topMovies, isLoading: loadingMovies } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: () => tmdbApi.getTopRated(1),
  });

  const { data: topSeries, isLoading: loadingSeries } = useQuery({
    queryKey: ['top-rated-series'],
    queryFn: () => tmdbApi.getTopRated(1),
  });

  const isLoading = loadingMovies || loadingSeries;

  const handleContentClick = (id: string) => {
    navigate(`/content/${id}`);
  };

  const renderContentGrid = (content: ContentItem[], title: string) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="h-6 w-6 text-yellow-500" />
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {content?.map((item, index) => (
          <div 
            key={item.id} 
            className="movie-card cursor-pointer animate-fade-in relative"
            onClick={() => handleContentClick(item.id)}
          >
            {/* Ranking badge */}
            <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {index + 1}
            </div>
            
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full aspect-[2/3] object-cover rounded-lg"
            />
            <div className="movie-overlay">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-yellow-500 font-medium">{item.rating}</span>
                </span>
                <span className="text-xs">{item.year}</span>
              </div>
              <h3 className="font-medium line-clamp-1">{item.title}</h3>
              
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" size="sm" className="w-full gap-1 bg-white/10 hover:bg-white/20 border-none">
                  <Play size={14} />
                  <span>Play</span>
                </Button>
                <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/10 hover:bg-white/20 border-none">
                  <Download size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = (count: number = 10) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Top Rated</h1>
            <p className="text-gray-400 max-w-2xl">
              Discover the highest-rated movies and TV series based on user reviews and critical acclaim. Only the best content makes it here!
            </p>
          </div>

          {isLoading ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Top Rated Movies</h2>
              {renderSkeleton()}
              <h2 className="text-2xl font-bold mb-6">Top Rated TV Series</h2>
              {renderSkeleton()}
            </>
          ) : (
            <>
              {topMovies && topMovies.length > 0 && renderContentGrid(topMovies, "Top Rated Movies")}
              {topSeries && topSeries.length > 0 && renderContentGrid(topSeries, "Top Rated TV Series")}
              
              {(!topMovies || topMovies.length === 0) && (!topSeries || topSeries.length === 0) && (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No top rated content found</h2>
                  <p className="text-gray-400 mb-6">
                    Check back later for updated ratings.
                  </p>
                  <Button onClick={() => navigate('/')}>
                    Browse All Content
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TopRated;
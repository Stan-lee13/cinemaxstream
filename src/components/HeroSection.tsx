
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdbApi';
import { ContentItem } from '@/types/content';

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: featuredContent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['featured-content'],
    queryFn: tmdbApi.getFeaturedContent,
  });

  // Rotate hero content every 10 seconds
  useEffect(() => {
    if (featuredContent && featuredContent.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [featuredContent]);

  // Generate random index on component mount and when refreshed
  useEffect(() => {
    if (featuredContent && featuredContent.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * featuredContent.length));
    }
  }, [featuredContent]);

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 text-white">
          <div className="max-w-2xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4 w-32"></div>
              <div className="h-16 bg-gray-700 rounded mb-6 w-96"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-24"></div>
              <div className="h-20 bg-gray-700 rounded mb-8"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-700 rounded w-32"></div>
                <div className="h-12 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredContent || featuredContent.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to CinemaxStream
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Your ultimate destination for movies, TV series, anime, and more.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentContent = featuredContent[currentIndex];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ 
          backgroundImage: `url(${currentContent.backdrop || currentContent.image})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-white">
        <div className="max-w-2xl">
          {/* Movie Info */}
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-cinemax-500 px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{currentContent.rating}</span>
              <span>•</span>
              <span>{currentContent.year}</span>
              <span>•</span>
              <span>{currentContent.duration}</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {currentContent.title}
          </h1>
          
          {/* Category */}
          <p className="text-cinemax-400 text-lg mb-4 font-medium capitalize">
            {currentContent.category}
          </p>
          
          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed line-clamp-3">
            {currentContent.description || "Discover amazing content on CinemaxStream."}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/content/${currentContent.id}`}
              className="inline-flex items-center justify-center gap-3 bg-cinemax-500 hover:bg-cinemax-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Play className="w-6 h-6 fill-current" />
              Watch Now
            </Link>
            
            <Link
              to={`/content/${currentContent.id}`}
              className="inline-flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <Info className="w-6 h-6" />
              More Info
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm">Scroll for more</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce mx-auto" />
          </div>
        </div>
      </div>

      {/* Indicators */}
      {featuredContent.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-cinemax-500' : 'bg-white/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;

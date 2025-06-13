
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';

const HeroSection = () => {
  const featuredContent = {
    id: "featured-movie-2024",
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    backgroundImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    year: "2024",
    rating: "8.9",
    duration: "2h 46m",
    genre: "Sci-Fi, Adventure"
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${featuredContent.backgroundImage})` }}
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
              <span>{featuredContent.rating}</span>
              <span>•</span>
              <span>{featuredContent.year}</span>
              <span>•</span>
              <span>{featuredContent.duration}</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {featuredContent.title}
          </h1>
          
          {/* Genre */}
          <p className="text-cinemax-400 text-lg mb-4 font-medium">
            {featuredContent.genre}
          </p>
          
          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed line-clamp-3">
            {featuredContent.description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/content/${featuredContent.id}`}
              className="inline-flex items-center justify-center gap-3 bg-cinemax-500 hover:bg-cinemax-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Play className="w-6 h-6 fill-current" />
              Watch Now
            </Link>
            
            <Link
              to={`/content/${featuredContent.id}`}
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
    </section>
  );
};

export default HeroSection;

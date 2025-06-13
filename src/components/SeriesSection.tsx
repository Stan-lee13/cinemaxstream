
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Clock } from 'lucide-react';

const SeriesSection = () => {
  const series = [
    {
      id: "halo-series",
      title: "Halo",
      description: "Based on the legendary video game series, this epic sci-fi drama follows Master Chief and the fight for humanity's survival.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "8.7",
      seasons: 2,
      episodes: 18,
      genre: "Sci-Fi, Action"
    },
    {
      id: "rise-of-jackal",
      title: "The Rise of the Jackal",
      description: "A gripping thriller series about an assassin known as the Jackal and the intelligence officer pursuing him.",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "9.1",
      seasons: 1,
      episodes: 10,
      genre: "Thriller, Drama"
    },
    {
      id: "dune-prophecy",
      title: "Dune: Prophecy",
      description: "Set 10,000 years before the events of Dune, this series follows the origins of the Bene Gesserit sisterhood.",
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "8.9",
      seasons: 1,
      episodes: 6,
      genre: "Sci-Fi, Fantasy"
    },
    {
      id: "the-bear",
      title: "The Bear",
      description: "A young chef returns to Chicago to run his deceased brother's Italian beef sandwich shop.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "9.3",
      seasons: 3,
      episodes: 28,
      genre: "Comedy, Drama"
    },
    {
      id: "house-dragon",
      title: "House of the Dragon",
      description: "The Targaryen civil war known as the Dance of the Dragons unfolds in this Game of Thrones prequel.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "8.8",
      seasons: 2,
      episodes: 18,
      genre: "Fantasy, Drama"
    },
    {
      id: "wednesday",
      title: "Wednesday",
      description: "Wednesday Addams navigates her years as a student at Nevermore Academy while solving a supernatural mystery.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      year: "2024",
      rating: "8.5",
      seasons: 2,
      episodes: 16,
      genre: "Comedy, Horror"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cinemax-500 to-purple-500 bg-clip-text text-transparent">
            Popular Series
          </h2>
          <p className="text-gray-400 text-lg">
            Binge-watch the most captivating series of the year
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {series.map((show) => (
            <Link
              key={show.id}
              to={`/content/${show.id}`}
              className="group bg-card rounded-xl overflow-hidden border border-gray-800 hover:border-cinemax-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative">
                <img
                  src={show.image}
                  alt={show.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Play className="w-5 h-5" />
                      <span className="text-sm font-medium">Watch Now</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{show.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-cinemax-400 transition-colors">
                    {show.title}
                  </h3>
                  <span className="text-cinemax-400 font-medium">{show.year}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {show.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{show.seasons} Season{show.seasons > 1 ? 's' : ''}</span>
                    </div>
                    <span>•</span>
                    <span>{show.episodes} Episodes</span>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {show.genre}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/series"
            className="inline-flex items-center gap-2 bg-cinemax-500 hover:bg-cinemax-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            View All Series
            <Play className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeriesSection;

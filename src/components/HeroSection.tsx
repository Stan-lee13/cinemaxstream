import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Download, Heart } from "lucide-react";

interface HeroSectionProps {
  featuredContent?: FeaturedContent[];
}

// Default featured content in case API fails
const defaultFeaturedContent = [
  {
    id: "1",
    title: "Inception",
    description: "A thief who enters the dreams of others to steal their secrets gets a final mission that could give him his life back.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1920&q=80",
    category: "Sci-Fi",
    year: "2010",
    duration: "148m",
    rating: "8.8"
  },
  {
    id: "2",
    title: "The Matrix",
    description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80",
    category: "Action",
    year: "1999",
    duration: "136m",
    rating: "8.7"
  },
  {
    id: "3",
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1920&q=80",
    category: "Adventure",
    year: "2014",
    duration: "169m",
    rating: "8.6"
  }
];

const HeroSection = ({ featuredContent = defaultFeaturedContent }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto slide change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredContent.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [currentIndex, featuredContent.length]);
  
  const currentContent = featuredContent[currentIndex];

  return (
    <section className="relative h-[85vh] overflow-hidden">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/20"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-end pb-20">
        <div className="w-full md:max-w-2xl animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <span className="px-2 py-1 rounded-md bg-cinemax-500/20 text-cinemax-400 text-xs font-semibold">
              {currentContent.category}
            </span>
            <span className="text-gray-400 text-sm">{currentContent.year}</span>
            <span className="text-gray-400 text-sm">{currentContent.duration}</span>
            <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-yellow-500 text-xs font-medium">{currentContent.rating}</span>
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{currentContent.title}</h1>
          <p className="text-gray-300 mb-8 text-sm md:text-base max-w-lg">
            {currentContent.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-cinemax-500 hover:bg-cinemax-600 gap-2 px-6" 
              size="lg"
            >
              <Play size={18} />
              <span>Watch Now</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 border-gray-600 hover:bg-secondary hover:text-white px-6" 
              size="lg"
            >
              <Download size={18} />
              <span>Download</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full border border-gray-700 hover:bg-gray-700/50"
              aria-label="Add to favorites"
            >
              <Heart size={18} />
            </Button>
          </div>
        </div>
        
        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index 
                  ? "w-8 bg-cinemax-500" 
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`View slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

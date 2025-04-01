
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { moviesData, seriesData, animeData, sportsData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);
  
  // Determine which data to use based on the category
  const getCategoryData = () => {
    switch (category) {
      case "movies":
        return { 
          title: "Movies",
          description: "Explore our collection of the latest blockbusters, indie gems, and classic films.",
          data: moviesData
        };
      case "series":
        return { 
          title: "TV Series",
          description: "Dive into captivating TV series across all genres, from drama to comedy and beyond.",
          data: seriesData
        };
      case "anime":
        return { 
          title: "Anime",
          description: "Discover the best anime series and movies from Japan and around the world.",
          data: animeData
        };
      case "sports":
        return { 
          title: "Sports",
          description: "Watch live sports events, matches, highlights, and documentaries.",
          data: sportsData
        };
      default:
        return { 
          title: "Content",
          description: "Browse our extensive collection of entertainment content.",
          data: [...moviesData, ...seriesData, ...animeData, ...sportsData]
        };
    }
  };
  
  const { title, description, data } = getCategoryData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            <p className="text-gray-400 max-w-2xl">{description}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.map((item) => (
              <div key={item.id} className="movie-card">
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
          
          <div className="mt-12 flex justify-center">
            <Button className="bg-secondary hover:bg-secondary/80 px-8">
              Load More
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;

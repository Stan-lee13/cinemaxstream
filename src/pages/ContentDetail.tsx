
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Download, Heart, ArrowLeft, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentRow from "@/components/ContentRow";
import { moviesData, seriesData, animeData, sportsData, popularData } from "@/data/mockData";

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setIsLoading(true);
    
    // Find content from all data sources
    const numericId = parseInt(id || "0");
    const allContent = [...moviesData, ...seriesData, ...animeData, ...sportsData];
    const foundContent = allContent.find(item => item.id === numericId);
    
    // Simulate loading
    setTimeout(() => {
      setContent(foundContent || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

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

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
        <p className="text-gray-400 mb-8">The content you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Banner */}
        <div className="relative h-[70vh]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative h-full flex items-end pb-16">
            <div className="w-full lg:w-2/3 animate-fade-in">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-2 py-1 rounded-md bg-cinemax-500/20 text-cinemax-400 text-xs font-semibold">
                  {content.category}
                </span>
                <span className="text-gray-400 text-sm">{content.year}</span>
                <span className="text-gray-400 text-sm">{content.duration}</span>
                <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-yellow-500 text-xs font-medium">{content.rating}</span>
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
              <p className="text-gray-300 mb-8 text-sm md:text-base max-w-2xl">
                {content.description}
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
                  className={`rounded-full border ${
                    liked 
                      ? "bg-cinemax-500/20 border-cinemax-500 text-cinemax-500" 
                      : "border-gray-700 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setLiked(!liked)}
                  aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full border border-gray-700 hover:bg-gray-700/50"
                  aria-label="Add to watchlist"
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Details Tabs */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex border-b border-gray-800 mb-6">
              <button className="px-4 py-2 border-b-2 border-cinemax-500 text-white font-medium">
                Overview
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors">
                Trailers
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors">
                More Like This
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors">
                Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Synopsis</h2>
                <p className="text-gray-300 mb-8">
                  {content.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed euismod, nunc sit amet ultricies lacinia, nisi nisl aliquam eros, eget aliquet 
                  nunc nisl eu nunc. Sed euismod, nunc sit amet ultricies lacinia, nisi nisl aliquam 
                  eros, eget aliquet nunc nisl eu nunc.
                </p>
                
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                      <Play size={24} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="glass-card rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Available Downloads</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <div>
                        <p className="font-medium">Full HD (1080p)</p>
                        <p className="text-sm text-gray-400">File size: 2.1 GB</p>
                      </div>
                      <Button size="sm" className="gap-1 bg-cinemax-500 hover:bg-cinemax-600">
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <div>
                        <p className="font-medium">HD (720p)</p>
                        <p className="text-sm text-gray-400">File size: 1.3 GB</p>
                      </div>
                      <Button size="sm" className="gap-1 bg-cinemax-500 hover:bg-cinemax-600">
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">SD (480p)</p>
                        <p className="text-sm text-gray-400">File size: 720 MB</p>
                      </div>
                      <Button size="sm" className="gap-1 bg-cinemax-500 hover:bg-cinemax-600">
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Cast & Crew</h3>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div>
                          <p className="font-medium">Actor Name</p>
                          <p className="text-sm text-gray-400">Character</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ContentRow 
          title="More Like This" 
          viewAllLink="#" 
          items={popularData} 
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default ContentDetail;

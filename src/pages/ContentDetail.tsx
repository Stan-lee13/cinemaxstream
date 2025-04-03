
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentRow from "@/components/ContentRow";
import VideoPlayerWrapper from "@/components/VideoPlayerWrapper";
import TrailerModal from "@/components/TrailerModal";
import EpisodeSelector from "@/components/EpisodeSelector";
import PremiumBadge from "@/components/PremiumBadge";
import PremiumCodeModal from "@/components/PremiumCodeModal";
import MovieDetail from "@/components/MovieDetail";
import BackButton from "@/components/BackButton";
import DownloadOptions from "@/components/DownloadOptions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FastForward, Crown, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuthState";
import { toast } from "sonner";
import { 
  getTrailerUrl,
  getAvailableProviders,
  hasPremiumAccess
} from "@/utils/videoUtils";
import { tmdbApi } from "@/services/tmdbApi";

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_xyz');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number | undefined>();
  const [currentEpisode, setCurrentEpisode] = useState<number | undefined>();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  const availableProviders = id ? getAvailableProviders(id, content?.content_type || 'movie') : [];
  
  const isPremiumContent = content?.is_premium || (content?.rating && parseFloat(content.rating) > 8.0);
  const canAccessPremium = hasPremiumAccess();

  // Fetch content details
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    setIsLoading(true);
    
    const fetchContent = async () => {
      try {
        if (!id) return;
        
        // Fetch content details with type assertion
        const { data: contentData, error: contentError } = await (supabase
          .from('content') as any)
          .select('*, content_categories(*)')
          .eq('id', id)
          .single();
        
        if (contentError) {
          // If the content is not in our database, fetch from TMDB
          const tmdbContent = await tmdbApi.getContentDetails(id);
          if (tmdbContent) {
            setContent({
              id: tmdbContent.id,
              title: tmdbContent.title,
              description: tmdbContent.description,
              image_url: tmdbContent.image,
              image: tmdbContent.image,
              category_id: null,
              content_type: tmdbContent.type || 'movie',
              year: tmdbContent.year,
              duration: tmdbContent.duration,
              rating: tmdbContent.rating,
              featured: false,
              trending: true,
              popular: true,
              trailer_key: tmdbContent.trailer_key || id, // Using provided trailer key or ID as a placeholder
              is_premium: parseFloat(tmdbContent.rating) > 8.0,
              content_categories: {
                id: '1',
                name: tmdbContent.category,
                slug: tmdbContent.category.toLowerCase(),
                description: null
              }
            });
            
            // Try to get trailer URL
            try {
              const trailer = await getTrailerUrl(id, tmdbContent.type || 'movie');
              setTrailerUrl(trailer);
            } catch (e) {
              console.error('Error fetching trailer:', e);
            }
            
            // Fetch related content from TMDB
            const similar = await tmdbApi.getSimilarContent(id, tmdbContent.type || 'movie');
            setRelatedContent(similar);
            
            // If it's a TV show, fetch seasons and episodes
            if (tmdbContent.type === 'series' || tmdbContent.type === 'anime') {
              // Simulate seasons and episodes with mock data
              const mockSeasons: Season[] = Array.from({ length: 3 }, (_, i) => ({
                id: `season-${i+1}`,
                season_number: i+1,
                title: `Season ${i+1}`,
                episode_count: 10,
                episodes: Array.from({ length: 10 }, (_, j) => ({
                  id: `ep-${i+1}-${j+1}`,
                  title: `Episode ${j+1}: ${tmdbContent.title} Part ${j+1}`,
                  episode_number: j+1,
                  season_number: i+1,
                  description: `This is episode ${j+1} of season ${i+1} of ${tmdbContent.title}`,
                  duration: "45 min",
                  air_date: new Date().toISOString()
                })),
                poster: tmdbContent.image,
                air_date: new Date().toISOString()
              }));
              
              setSeasons(mockSeasons);
            }
            
            setIsLoading(false);
            return;
          }
          
          throw contentError;
        }
        
        setContent(contentData);
        
        // Try to get trailer URL
        try {
          const trailer = await getTrailerUrl(id, contentData.content_type || 'movie');
          setTrailerUrl(trailer);
        } catch (e) {
          console.error('Error fetching trailer:', e);
        }
        
        // Check if user has liked this content
        if (isAuthenticated && user) {
          const { data: favoriteData } = await (supabase
            .from('user_favorites') as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', id)
            .single();
          
          setLiked(!!favoriteData);
        }
        
        // Fetch related content from the same category
        if (contentData.category_id) {
          const { data: relatedData } = await (supabase
            .from('content') as any)
            .select('*')
            .eq('category_id', contentData.category_id)
            .neq('id', id)
            .limit(10);
          
          setRelatedContent(relatedData || []);
        } else {
          // If no category ID, fetch related content from TMDB
          const similar = await tmdbApi.getSimilarContent(id, contentData.content_type);
          setRelatedContent(similar);
        }
        
        // If it's a TV show or anime, fetch seasons and episodes
        if (contentData.content_type === 'series' || contentData.content_type === 'anime') {
          // In a real app, fetch actual seasons and episodes
          // For now, creating mock data
          const mockSeasons: Season[] = Array.from({ length: 3 }, (_, i) => ({
            id: `season-${i+1}`,
            season_number: i+1,
            title: `Season ${i+1}`,
            episode_count: 10,
            episodes: Array.from({ length: 10 }, (_, j) => ({
              id: `ep-${i+1}-${j+1}`,
              title: `Episode ${j+1}: ${contentData.title} Part ${j+1}`,
              episode_number: j+1,
              season_number: i+1,
              description: `This is episode ${j+1} of season ${i+1} of ${contentData.title}`,
              duration: "45 min",
              air_date: new Date().toISOString()
            })),
            poster: contentData.image_url,
            air_date: new Date().toISOString()
          }));
          
          setSeasons(mockSeasons);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id, isAuthenticated, user]);

  // Handle favorite toggle
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add favorites");
      return;
    }
    
    if (!id || !user) return;
    
    try {
      if (liked) {
        // Remove from favorites
        await (supabase
          .from('user_favorites') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', id);
        
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const favoriteData = {
          user_id: user.id,
          content_id: id
        };
        
        await (supabase
          .from('user_favorites') as any)
          .insert(favoriteData);
        
        toast.success("Added to favorites");
      }
      
      setLiked(!liked);
    } catch (error) {
      toast.error("Error updating favorites");
      console.error(error);
    }
  };

  // Start watching
  const startWatching = () => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    setIsPlaying(true);
  };
  
  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    if (isPremiumContent && !canAccessPremium) {
      toast.error("Premium content requires subscription or premium code");
      setShowPremiumModal(true);
      return;
    }
    
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episodeNumber);
    setIsPlaying(true);
  };

  // Handle back navigation
  const handleGoBack = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
        <Button className="gap-2" onClick={handleGoBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Video Player (shown when isPlaying is true) */}
        {isPlaying ? (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                  {content.title}
                  {currentSeason && currentEpisode && 
                    ` - S${currentSeason}:E${currentEpisode}`
                  }
                </h1>
                
                <BackButton onClick={() => setIsPlaying(false)} />
              </div>
              
              <VideoPlayerWrapper 
                contentId={content.id}
                contentType={content.content_type}
                userId={user?.id}
                episodeId={currentEpisode ? `ep-${currentSeason}-${currentEpisode}` : undefined}
                seasonNumber={currentSeason}
                episodeNumber={currentEpisode}
                autoPlay={true}
                onEnded={() => setIsPlaying(false)}
                poster={content.image_url || content.image}
                title={content.title}
                usePlyr={true}
              />
              
              {/* Episode selector for series/anime */}
              {(content.content_type === 'series' || content.content_type === 'anime') && seasons.length > 0 && (
                <div className="mt-8">
                  <EpisodeSelector
                    seasons={seasons}
                    onEpisodeSelect={handleEpisodeSelect}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <MovieDetail 
              content={content}
              liked={liked}
              toggleFavorite={toggleFavorite}
              showTrailer={() => setShowTrailer(true)}
              startWatching={startWatching}
            />
            
            {/* Content Details Tabs */}
            <div className="py-8">
              <div className="container mx-auto px-4">
                <div className="flex border-b border-gray-800 mb-6 overflow-x-auto scrollbar-none">
                  <button className="px-4 py-2 border-b-2 border-cinemax-500 text-white font-medium whitespace-nowrap">
                    Overview
                  </button>
                  <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors whitespace-nowrap">
                    Trailers
                  </button>
                  <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors whitespace-nowrap">
                    More Like This
                  </button>
                  <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors whitespace-nowrap">
                    Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Synopsis</h2>
                    <p className="text-gray-300 mb-8">
                      {content.description}
                    </p>
                    
                    <div 
                      className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 cursor-pointer"
                      onClick={startWatching}
                    >
                      <div 
                        className="w-full h-full flex items-center justify-center bg-cover bg-center"
                        style={{ backgroundImage: `url(${content.image_url || content.image || ''})` }}
                      >
                        <div className="absolute inset-0 bg-black/40"></div>
                        <Button className="relative z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                          <Play size={24} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Episode selector for series/anime */}
                    {(content.content_type === 'series' || content.content_type === 'anime') && seasons.length > 0 && (
                      <div className="mt-8">
                        <EpisodeSelector
                          seasons={seasons}
                          onEpisodeSelect={handleEpisodeSelect}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <DownloadOptions 
                      contentId={content.id}
                      contentType={content.content_type}
                      isPremium={isPremiumContent}
                      episodeId={currentEpisode ? `ep-${currentSeason}-${currentEpisode}` : undefined}
                    />
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-4">Category</h3>
                      <Link 
                        to={`/${content.content_categories?.slug || 'category'}`}
                        className="inline-block px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700 transition-colors"
                      >
                        {content.content_categories?.name || content.category || 'Uncategorized'}
                      </Link>
                    </div>
                    
                    {isPremiumContent && !canAccessPremium && (
                      <div className="mt-6 p-4 bg-cinemax-500/10 border border-cinemax-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Crown size={24} className="text-yellow-500 shrink-0 mt-1" />
                          <div>
                            <h3 className="text-lg font-bold text-yellow-500 mb-2">Premium Content</h3>
                            <p className="text-gray-300 text-sm mb-3">
                              This is premium content. Subscribe or enter premium code to watch.
                            </p>
                            <Button 
                              className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                              onClick={() => setShowPremiumModal(true)}
                            >
                              Enter Premium Code
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-4">Available Sources</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableProviders.map(provider => (
                          <Button
                            key={provider.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveProvider(provider.id);
                              toast.info(`Selected ${provider.name} as source`);
                            }}
                            className={`justify-start ${activeProvider === provider.id ? "border-cinemax-500 text-cinemax-500" : ""}`}
                          >
                            <FastForward size={14} className="mr-2" />
                            {provider.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {!isPlaying && (
          <ContentRow 
            title="More Like This" 
            viewAllLink={`/${content.content_type}`} 
            items={relatedContent.map(item => ({
              id: item.id,
              title: item.title,
              image: item.image_url || item.image,
              poster: item.image_url || item.image,
              description: item.description || '',
              year: item.year || '',
              rating: item.rating || '',
              category: item.content_type || item.type || '',
              duration: item.duration || '',
              type: item.content_type || item.type
            }))} 
          />
        )}
      </main>
      
      {/* Modals */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerKey={trailerUrl || ''}
        title={content.title}
      />
      
      <PremiumCodeModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
      
      <Footer />
    </div>
  );
};

export default ContentDetail;

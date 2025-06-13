
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentRow from "@/components/ContentRow";
import VideoPlayerWrapper from "@/components/VideoPlayerWrapper";
import TrailerModal from "@/components/TrailerModal";
import EpisodeSelector from "@/components/EpisodeSelector";
import PremiumCodeModal from "@/components/PremiumCodeModal";
import MovieDetail from "@/components/MovieDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, List, Grid3X3 } from "lucide-react";
import useContentDetail from "@/hooks/useContentDetail";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner"; // Import toast
import PlaySplashScreen from "@/components/PlaySplashScreen";
import NeonEdgeEffect from "@/components/NeonEdgeEffect";
import VideoAssistant from "@/components/VideoAssistant";
import StreamingProviderSelector from "@/components/StreamingProviderSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cleanupRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [providerViewMode, setProviderViewMode] = useState<'grid' | 'list'>('grid'); // New state for view mode
  
  const {
    content,
    isLoading,
    liked,
    toggleFavorite,
    relatedContent,
    isPlaying,
    setIsPlaying,
    showTrailer,
    setShowTrailer,
    showPremiumModal,
    setShowPremiumModal,
    activeProvider,
    setActiveProvider,
    seasons,
    currentSeason,
    currentEpisode,
    trailerUrl,
    isPremiumContent,
    canAccessPremium,
    availableProviders,
    startWatching,
    handleEpisodeSelect,
    loadEpisodesForSeason,
    showSplashScreen,
    showNeonEffect,
    user
  } = useContentDetail(id);

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

  // Load episodes for first season when seasons change
  useEffect(() => {
    if (seasons.length > 0) {
      loadEpisodesForSeason(seasons[0].season_number);
    }
  }, [seasons.length]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current = true;
      // Force cleanup of any remaining player resources
      if (setIsPlaying) {
        setIsPlaying(false);
      }
      if (setShowTrailer) {
        setShowTrailer(false);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading content details..." />;
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

  const handleSkipPlayback = (seconds: number) => {
    toast.info(`Attempting to skip ${seconds} seconds...`);
    // Actual skip logic would be handled by the video player instance
  };

  const handleResumePlayback = () => {
    toast.info("Playback resume requested.");
    // Actual resume logic would be handled by the video player instance or by setting isPlaying(true)
    // For now, let's assume it should try to start watching or resume if player is already initialized.
    if (!isPlaying) {
      startWatching(); // Or a more specific resume function if available
    }
  };

  const handleShowInfo = () => {
    toast.info(`Info requested for ${content?.title}`);
    // Logic to show more info, e.g., scroll to details tab or open a modal
    // For now, this toast is the placeholder action.
    // Example: navigate to a specific part of the page or open an info modal
    const tabs = document.querySelector('[role="tablist"]');
    if (tabs) {
      const overviewButton = tabs.querySelector('button[value="overview"]') as HTMLElement;
      overviewButton?.click(); // Switch to overview tab
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Splash screen animation */}
        <PlaySplashScreen 
          isShowing={showSplashScreen} 
          contentTitle={content.title} 
        />
        
        {/* Neon edge effect for immersive viewing */}
        <NeonEdgeEffect isActive={showNeonEffect && isPlaying} color="multi" />
        
        {/* Video Player (shown when isPlaying is true) */}
        {isPlaying && !cleanupRef.current ? (
          <div ref={containerRef} className="container mx-auto px-4 py-8 relative">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                  {content.title}
                  {currentSeason && currentEpisode && 
                    ` - S${currentSeason}:E${currentEpisode}`
                  }
                </h1>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setIsPlaying(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>
              </div>
              
              <div className="mb-4">
                <StreamingProviderSelector
                  providers={availableProviders}
                  activeProvider={activeProvider}
                  contentType={content.content_type}
                  onProviderChange={setActiveProvider}
                  variant="inline"
                />
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
            
            {/* Video Assistant */}
            <VideoAssistant 
              contentTitle={content.title}
              contentType={content.content_type}
              onRequestEpisode={handleEpisodeSelect}
              onRequestSkip={handleSkipPlayback}
              onRequestResumePlayback={handleResumePlayback}
              onRequestShowInfo={handleShowInfo}
            />
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
            
            {/* Content Details */}
            <div className="py-8">
              <div className="container mx-auto px-4">
                {/* Content Details Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-6 border-b border-gray-800 w-full justify-start rounded-none bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-cinemax-500 rounded-none">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="trailers" className="data-[state=active]:border-b-2 data-[state=active]:border-cinemax-500 rounded-none">
                      Trailers
                    </TabsTrigger>
                    <TabsTrigger value="similar" className="data-[state=active]:border-b-2 data-[state=active]:border-cinemax-500 rounded-none">
                      More Like This
                    </TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-cinemax-500 rounded-none">
                      Details
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    {/* Content layout with two columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        {/* Synopsis */}
                        <h2 className="text-xl font-bold mb-4">Synopsis</h2>
                        <p className="text-gray-300 mb-8">
                          {content.description}
                        </p>
                        
                        {/* Preview thumbnail */}
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
                              <div className="ml-1 w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent"></div>
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
                      
                      {/* Right sidebar - Streaming sources, premium info */}
                      <div>
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Available Sources</h3>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${providerViewMode === 'list' ? 'bg-secondary' : ''}`}
                                onClick={() => setProviderViewMode('list')}
                                aria-label="List view for providers"
                              >
                                <List className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${providerViewMode === 'grid' ? 'bg-secondary' : ''}`}
                                onClick={() => setProviderViewMode('grid')}
                                aria-label="Grid view for providers"
                              >
                                <Grid3X3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <StreamingProviderSelector
                            providers={availableProviders}
                            activeProvider={activeProvider}
                            contentType={content.content_type}
                            onProviderChange={setActiveProvider}
                            variant={providerViewMode} // Pass the view mode
                          />
                        </div>
                        
                        {/* Premium content notice */}
                        {isPremiumContent && !canAccessPremium && (
                          <div className="mt-6 p-4 bg-cinemax-500/10 border border-cinemax-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="text-yellow-500 shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M6 3h12l4 8-10 13L2 11l4-8z"></path>
                                </svg>
                              </div>
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
                        
                        {/* Category */}
                        <div className="mt-6">
                          <h3 className="text-lg font-bold mb-4">Category</h3>
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/${content.content_categories?.slug || content.content_type || 'category'}`)}
                            className="px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700 transition-colors"
                          >
                            {content.content_categories?.name || content.category || content.content_type || 'Uncategorized'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trailers">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                        {trailerUrl ? (
                          <iframe
                            src={trailerUrl}
                            className="w-full h-full"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No trailer available
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-bold mb-2">{content.title} - Official Trailer</h2>
                        <p className="text-gray-400">{content.year}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="similar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {relatedContent.map(item => (
                        <div 
                          key={item.id}
                          className="rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => navigate(`/content/${item.id}`)}
                        >
                          <div className="aspect-[2/3] relative">
                            <img 
                              src={item.image_url || item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                              <div className="text-xs text-gray-300">{item.year}</div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                            <div className="flex items-center mt-1">
                              <div className="text-xs text-yellow-500">{item.rating}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-4">Content Details</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Title</dt>
                            <dd className="text-white mt-1">{content.title}</dd>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Release Year</dt>
                            <dd className="text-white mt-1">{content.year}</dd>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Content Type</dt>
                            <dd className="text-white mt-1 capitalize">{content.content_type}</dd>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Category</dt>
                            <dd className="text-white mt-1">{content.content_categories?.name || 'Uncategorized'}</dd>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Duration</dt>
                            <dd className="text-white mt-1">{content.duration}</dd>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <dt className="text-sm text-gray-400">Rating</dt>
                            <dd className="text-white mt-1">{content.rating}/10</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
      {showTrailer && trailerUrl && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          trailerKey={trailerUrl}
          title={content.title}
        />
      )}
      
      {showPremiumModal && (
        <PremiumCodeModal 
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
      
      <Footer />
      
      {/* AI Video Assistant (only when not playing) */}
      {!isPlaying && (
        <VideoAssistant 
          contentTitle={content.title}
          contentType={content.content_type}
          onRequestEpisode={handleEpisodeSelect}
          // Pass other handlers if VideoAssistant is used when not playing.
          // For this task, VideoAssistant when not playing already has its existing handlers.
          // The new handlers are primarily for when it's active during playback.
        />
      )}
    </div>
  );
};

export default ContentDetail;

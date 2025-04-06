
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
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";
import { useContentDetail } from "@/hooks/useContentDetail";
import LoadingState from "@/components/LoadingState";

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cleanupRef = useRef(false);
  
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
    loadEpisodesForSeason
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Video Player (shown when isPlaying is true) */}
        {isPlaying && !cleanupRef.current ? (
          <div className="container mx-auto px-4 py-8">
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
            
            {/* Content Details */}
            <div className="py-8">
              <div className="container mx-auto px-4">
                {/* Content Details Tabs */}
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
                  
                  {/* Right sidebar - download options, providers, premium info */}
                  <div>
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-4">Available Sources</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableProviders.map(provider => (
                          <Button
                            key={provider.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveProvider(provider.id)}
                            className={`justify-start ${activeProvider === provider.id ? "border-cinemax-500 text-cinemax-500" : ""}`}
                          >
                            {provider.name}
                            {provider.isTorrent && <span className="text-xs ml-1 text-yellow-500">(Torrent)</span>}
                          </Button>
                        ))}
                      </div>
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
    </div>
  );
};

export default ContentDetail;

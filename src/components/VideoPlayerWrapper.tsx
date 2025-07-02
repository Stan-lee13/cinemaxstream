
import { useState, useEffect, useRef } from "react";
import { getAvailableProviders } from "@/utils/contentUtils";
import { getStreamingUrl } from "@/utils/streamingUtils";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import StreamingProviderSelector from "./StreamingProviderSelector";
import UpgradeModal from "./UpgradeModal";

interface VideoPlayerWrapperProps {
  contentId: string;
  contentType: string;
  userId?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number; 
  autoPlay?: boolean;
  onEnded?: () => void;
  poster?: string;
  title?: string;
}

const VideoPlayerWrapper = ({
  contentId,
  contentType,
  userId,
  episodeId,
  seasonNumber,
  episodeNumber,
  autoPlay = false,
  onEnded,
  poster,
  title
}: VideoPlayerWrapperProps) => {
  const availableProviders = getAvailableProviders(contentId, contentType);
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_su');
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [key, setKey] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Credit system hooks
  const { userProfile, canStream } = useCreditSystem();
  const { startWatchSession } = useWatchTracking();
  
  // Check streaming eligibility before loading
  useEffect(() => {
    const loadSource = async () => {
      console.log(`Loading video source for content: ${contentId}, provider: ${activeProvider}`);
      setIsLoading(true);
      setIsError(false);
      
      const options: any = {
        contentType,
        autoplay: autoPlay
      };
      
      if (episodeId) options.episode = episodeId;
      if (typeof seasonNumber === 'number' && !isNaN(seasonNumber)) options.season = seasonNumber;
      if (typeof episodeNumber === 'number' && !isNaN(episodeNumber)) options.episodeNum = episodeNumber;
      if (title) options.title = title;
      
      try {
        const src = getStreamingUrl(contentId, activeProvider, options);
        console.log(`Generated streaming URL: ${src}`);
        setVideoSrc(src);
        setKey(prev => prev + 1);
        
        // Start watch session if user can stream
        if (canStream() && userProfile) {
          try {
            await startWatchSession(contentId, title);
          } catch (error) {
            console.error('Failed to start watch session:', error);
          }
        }
        
        // Set loading to false after a short delay to allow iframe to load
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
      } catch (error) {
        console.error("Error getting streaming URL:", error);
        setIsError(true);
        setIsLoading(false);
        toast.error(`Failed to load video from ${activeProvider}`);
      }
    };

    // Check if user can stream before loading
    if (userProfile && !canStream()) {
      setShowUpgradeModal(true);
      return;
    }
    
    loadSource();
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay, userProfile]);
  
  const handleProviderChange = (providerId: string) => {
    console.log(`Changing provider from ${activeProvider} to ${providerId}`);
    setActiveProvider(providerId);
  };
  
  const handleReload = () => {
    setIsError(false);
    setIsLoading(true);
    setKey(prev => prev + 1);
    
    // Reload iframe after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleIframeLoad = () => {
    console.log(`Video loaded successfully from ${activeProvider}`);
    setIsLoading(false);
    setIsError(false);
  };

  const handleIframeError = () => {
    console.error(`Failed to load video from provider: ${activeProvider}`);
    setIsLoading(false);
    setIsError(true);
  };

  // Show upgrade modal if user can't stream
  if (userProfile && !canStream()) {
    return (
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="streaming"
        currentRole={userProfile.role}
      />
    );
  }
  
  return (
    <div className="player-container relative bg-black rounded-lg overflow-hidden w-full aspect-video">
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500 mx-auto mb-4"></div>
            <p className="text-white">Loading video from {activeProvider}...</p>
          </div>
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4 text-center">
          <p className="text-red-500 mb-4">Failed to load video from {activeProvider}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              onClick={handleReload}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            <StreamingProviderSelector
              providers={availableProviders}
              activeProvider={activeProvider}
              contentType={contentType}
              onProviderChange={handleProviderChange}
              variant="inline"
            />
          </div>
        </div>
      )}
      
      {videoSrc && (
        <iframe
          ref={iframeRef}
          key={`iframe-${contentId}-${activeProvider}-${key}`}
          src={videoSrc}
          className="w-full h-full"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          style={{ border: 'none' }}
        />
      )}
      
      {/* Provider selector overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <StreamingProviderSelector
          providers={availableProviders}
          activeProvider={activeProvider}
          contentType={contentType}
          onProviderChange={handleProviderChange}
        />
      </div>
    </div>
  );
};

export default VideoPlayerWrapper;

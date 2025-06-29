
import { useState, useEffect, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerPlyr from "./VideoPlayerPlyr";
import VideoPlayerVideoJS from "./VideoPlayerVideoJS";
import VideoPlayerIframe from "./VideoPlayerIframe";
import UpgradeModal from "./UpgradeModal";
import { getAvailableProviders, getBestProviderForContentType } from "@/utils/contentUtils";
import { getStreamingUrl, isIframeSource } from "@/utils/streamingUtils";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { toast } from "sonner";

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
  usePlyr?: boolean;
  useVideoJS?: boolean;
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
  title,
  usePlyr = false,
  useVideoJS = true
}: VideoPlayerWrapperProps) => {
  const availableProviders = getAvailableProviders(contentId, contentType);
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_su');
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [key, setKey] = useState<number>(0);
  const [requiresIframe, setRequiresIframe] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const loadingTimerRef = useRef<number | null>(null);
  
  // Credit system hooks
  const { userProfile, canStream } = useCreditSystem();
  const { startWatchSession, addWatchEvent, endWatchSession } = useWatchTracking();
  
  // Check streaming eligibility before loading
  useEffect(() => {
    const loadSource = async () => {
      console.log(`Loading video source for content: ${contentId}, provider: ${activeProvider}`);
      setIsLoading(true);
      setIsError(false);
      
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      
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
        
        const isIframe = isIframeSource(activeProvider);
        setRequiresIframe(isIframe);
        
        setKey(prev => prev + 1);
        setErrorCount(0);
        
        // Start watch session if user can stream
        if (canStream() && userProfile) {
          try {
            await startWatchSession(contentId, title);
          } catch (error) {
            console.error('Failed to start watch session:', error);
            // Don't block video playback if tracking fails
          }
        }
        
        // Set a timeout to detect if the video fails to load
        loadingTimerRef.current = window.setTimeout(() => {
          if (isLoading) {
            console.log(`${activeProvider} is taking too long to load. Trying another provider...`);
            handleError();
          }
        }, 10000); // Reduced timeout to 10 seconds
        
        // Mark as loaded immediately for iframe sources
        if (isIframe) {
          setTimeout(() => {
            setIsLoading(false);
          }, 2000);
        }
      } catch (error) {
        console.error("Error getting streaming URL:", error);
        setIsError(true);
        setErrorCount(prev => prev + 1);
        toast.error(`Failed to load video from ${activeProvider}. Trying another provider...`);
      }
    };

    // Check if user can stream before loading
    if (userProfile && !canStream()) {
      setShowUpgradeModal(true);
      return;
    }
    
    loadSource();
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay, userProfile]);
  
  const handleProviderChange = (providerId: string) => {
    console.log(`Changing provider from ${activeProvider} to ${providerId}`);
    setActiveProvider(providerId);
  };
  
  const handleError = () => {
    setIsError(true);
    setErrorCount(prev => prev + 1);
    console.error(`Failed to load video from provider: ${activeProvider}`);
    
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };
  
  const handleLoaded = () => {
    console.log(`Video loaded successfully from ${activeProvider}`);
    setIsLoading(false);
    
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  // Video event handlers with watch tracking
  const handlePlay = (currentTime: number) => {
    try {
      if (canStream() && userProfile) {
        addWatchEvent('play', currentTime);
      }
    } catch (error) {
      console.error('Failed to track play event:', error);
    }
  };

  const handlePause = (currentTime: number) => {
    try {
      if (canStream() && userProfile) {
        addWatchEvent('pause', currentTime);
      }
    } catch (error) {
      console.error('Failed to track pause event:', error);
    }
  };

  const handleSeek = (currentTime: number) => {
    try {
      if (canStream() && userProfile) {
        addWatchEvent('seek', currentTime);
      }
    } catch (error) {
      console.error('Failed to track seek event:', error);
    }
  };

  const handleEnded = () => {
    try {
      if (canStream() && userProfile) {
        addWatchEvent('ended', 0);
        endWatchSession();
      }
    } catch (error) {
      console.error('Failed to track end event:', error);
    }
    if (onEnded) onEnded();
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
  
  const renderPlayer = () => {
    const playerProps = {
      src: videoSrc,
      contentId,
      contentType,
      userId,
      episodeId,
      autoPlay,
      onEnded: handleEnded,
      poster,
      title,
      availableProviders,
      activeProvider,
      onProviderChange: handleProviderChange,
      onError: handleError,
      onLoaded: handleLoaded,
      onPlay: handlePlay,
      onPause: handlePause,
      onSeek: handleSeek
    };

    console.log(`Rendering player - iframe: ${requiresIframe}, src: ${videoSrc}`);

    if (requiresIframe) {
      return (
        <VideoPlayerIframe
          key={`iframe-${contentId}-${activeProvider}-${key}`}
          {...playerProps}
        />
      );
    }
    
    if (useVideoJS) {
      return (
        <VideoPlayerVideoJS
          key={`vjs-${contentId}-${activeProvider}-${key}`}
          {...playerProps}
        />
      );
    }
    
    if (usePlyr) {
      return (
        <VideoPlayerPlyr
          key={`plyr-${contentId}-${activeProvider}-${key}`}
          {...playerProps}
        />
      );
    }
    
    return (
      <VideoPlayer
        key={`basic-${contentId}-${activeProvider}-${key}`}
        {...playerProps}
      />
    );
  };
  
  // If there's an error and there are other providers, try to suggest an alternative
  useEffect(() => {
    if (isError && availableProviders.length > 1 && errorCount < 3) {
      const currentIndex = availableProviders.findIndex(p => p.id === activeProvider);
      const nextIndex = (currentIndex + 1) % availableProviders.length;
      const nextProvider = availableProviders[nextIndex];
      
      if (nextProvider && nextProvider.id !== activeProvider) {
        console.log(`Trying alternative provider: ${nextProvider.id}`);
        toast.info(`Switching to ${nextProvider.name}...`);
        
        setTimeout(() => {
          setActiveProvider(nextProvider.id);
        }, 1000);
      }
    } else if (errorCount >= 3) {
      toast.error("Multiple providers failed. Please try selecting a different provider manually.");
      setIsLoading(false);
    }
  }, [isError, availableProviders, activeProvider, errorCount]);
  
  return (
    <div className="player-container relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500 mx-auto mb-4"></div>
            <p className="text-white">Loading video from {activeProvider}...</p>
          </div>
        </div>
      )}
      {renderPlayer()}
    </div>
  );
};

export default VideoPlayerWrapper;

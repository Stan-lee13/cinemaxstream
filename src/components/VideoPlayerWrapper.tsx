
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
    if (userProfile && !canStream()) {
      setShowUpgradeModal(true);
      return;
    }
    
    const loadSource = async () => {
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
        setVideoSrc(src);
        
        const isIframe = isIframeSource(activeProvider);
        setRequiresIframe(isIframe);
        
        setKey(prev => prev + 1);
        setErrorCount(0);
        
        // Start watch session
        if (canStream()) {
          await startWatchSession(contentId, title);
        }
        
        loadingTimerRef.current = window.setTimeout(() => {
          if (isLoading) {
            toast.error(`${activeProvider} is taking too long to load. Trying another provider...`);
            handleError();
          }
        }, 15000);
      } catch (error) {
        console.error("Error getting streaming URL:", error);
        setIsError(true);
        setErrorCount(prev => prev + 1);
        toast.error(`Failed to load video from ${activeProvider}. Trying another provider...`);
      }
    };
    
    loadSource();
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay, userProfile, canStream, startWatchSession]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
  };
  
  const handleError = () => {
    setIsError(true);
    setErrorCount(prev => prev + 1);
    console.error(`Failed to load video from provider: ${activeProvider}`);
  };
  
  const handleLoaded = () => {
    setIsLoading(false);
    
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  // Video event handlers with watch tracking
  const handlePlay = (currentTime: number) => {
    addWatchEvent('play', currentTime);
  };

  const handlePause = (currentTime: number) => {
    addWatchEvent('pause', currentTime);
  };

  const handleSeek = (currentTime: number) => {
    addWatchEvent('seek', currentTime);
  };

  const handleEnded = (currentTime: number) => {
    addWatchEvent('ended', currentTime);
    endWatchSession();
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
      
      if (nextProvider) {
        console.log(`Trying alternative provider: ${nextProvider.id}`);
        toast.info(`Switching to ${nextProvider.name}...`);
        
        setTimeout(() => {
          setActiveProvider(nextProvider.id);
        }, 1000);
      }
    } else if (errorCount >= 3) {
      toast.error("Multiple providers failed. Please try again later or select a different provider manually.");
    }
  }, [isError, availableProviders, activeProvider, errorCount]);
  
  return (
    <div className="player-container">
      {renderPlayer()}
    </div>
  );
};

export default VideoPlayerWrapper;

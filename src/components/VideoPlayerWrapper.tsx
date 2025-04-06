
import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerPlyr from "./VideoPlayerPlyr";
import VideoPlayerVideoJS from "./VideoPlayerVideoJS";
import VideoPlayerIframe from "./VideoPlayerIframe";
import { getAvailableProviders, getBestProviderForContentType } from "@/utils/contentUtils";
import { getStreamingUrl, isIframeSource } from "@/utils/streamingUtils";
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
  useVideoJS = true // Default to VideoJS
}: VideoPlayerWrapperProps) => {
  const availableProviders = getAvailableProviders(contentId, contentType);
  const [activeProvider, setActiveProvider] = useState<string>(getBestProviderForContentType(contentType));
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [key, setKey] = useState<number>(0); // Key to force re-mount of player components
  const [requiresIframe, setRequiresIframe] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [manualProviderChange, setManualProviderChange] = useState<boolean>(false);
  
  useEffect(() => {
    // Update source when provider or content changes
    const loadSource = async () => {
      setIsError(false);
      
      const options: any = {
        contentType,
        autoplay: autoPlay
      };
      
      // Ensure we're using actual numbers and not NaN for seasons/episodes
      if (episodeId) options.episode = episodeId;
      if (seasonNumber && !isNaN(seasonNumber)) options.season = seasonNumber;
      if (episodeNumber && !isNaN(episodeNumber)) options.episodeNum = episodeNumber;
      if (title) options.title = title;
      
      try {
        const src = getStreamingUrl(contentId, activeProvider, options);
        setVideoSrc(src);
        
        // Check if this is an iframe source
        const isIframe = isIframeSource(activeProvider);
        setRequiresIframe(isIframe);
        
        // Increment key to force remount of player when source changes
        setKey(prev => prev + 1);

        // Reset error count when source changes successfully
        setErrorCount(0);
      } catch (error) {
        console.error("Error getting streaming URL:", error);
        setIsError(true);
        setErrorCount(prev => prev + 1);
        toast.error(`Failed to load video from ${activeProvider}.`);
      }
    };
    
    loadSource();
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
    setManualProviderChange(true); // Mark this as a manual change
  };
  
  const handleError = () => {
    setIsError(true);
    setErrorCount(prev => prev + 1);
    console.error(`Failed to load video from provider: ${activeProvider}`);
  };
  
  // Determine which player to use based on source type and props
  const renderPlayer = () => {
    // If source requires an iframe, use the iframe player regardless of other settings
    if (requiresIframe) {
      return (
        <VideoPlayerIframe
          key={`iframe-${contentId}-${activeProvider}-${key}`}
          src={videoSrc}
          contentId={contentId}
          contentType={contentType}
          userId={userId}
          episodeId={episodeId}
          autoPlay={autoPlay}
          onEnded={onEnded}
          poster={poster}
          title={title}
          availableProviders={availableProviders}
          activeProvider={activeProvider}
          onProviderChange={handleProviderChange}
          onError={handleError}
        />
      );
    }
    
    // For direct video sources, use the specified player
    if (useVideoJS) {
      return (
        <VideoPlayerVideoJS
          key={`vjs-${contentId}-${activeProvider}-${key}`}
          src={videoSrc}
          contentId={contentId}
          contentType={contentType}
          userId={userId}
          episodeId={episodeId}
          autoPlay={autoPlay}
          onEnded={onEnded}
          poster={poster}
          title={title}
          availableProviders={availableProviders}
          activeProvider={activeProvider}
          onProviderChange={handleProviderChange}
          onError={handleError}
        />
      );
    }
    
    // If using Plyr
    if (usePlyr) {
      return (
        <VideoPlayerPlyr
          key={`plyr-${contentId}-${activeProvider}-${key}`}
          src={videoSrc}
          contentId={contentId}
          contentType={contentType}
          userId={userId}
          episodeId={episodeId}
          autoPlay={autoPlay}
          onEnded={onEnded}
          poster={poster}
          title={title}
          availableProviders={availableProviders}
          activeProvider={activeProvider}
          onProviderChange={handleProviderChange}
        />
      );
    }
    
    // Default fallback to basic player
    return (
      <VideoPlayer
        key={`basic-${contentId}-${activeProvider}-${key}`}
        src={videoSrc}
        contentId={contentId}
        userId={userId}
        episodeId={episodeId}
        autoPlay={autoPlay}
        onEnded={onEnded}
        poster={poster}
      />
    );
  };
  
  // Only auto-switch if it's not a manual provider change and there's an error
  useEffect(() => {
    if (isError && availableProviders.length > 1 && errorCount < 3 && !manualProviderChange) {
      // Find the next provider that isn't the current one
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
      toast.error("Multiple providers failed. Please select a different provider manually.");
    }
  }, [isError, availableProviders, activeProvider, errorCount, manualProviderChange]);
  
  return (
    <div className="player-container">
      {renderPlayer()}
    </div>
  );
};

export default VideoPlayerWrapper;

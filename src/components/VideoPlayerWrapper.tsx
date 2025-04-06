
import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerPlyr from "./VideoPlayerPlyr";
import VideoPlayerVideoJS from "./VideoPlayerVideoJS";
import VideoPlayerIframe from "./VideoPlayerIframe";
import { getAvailableProviders, getBestProviderForContentType } from "@/utils/contentUtils";
import { getStreamingUrl, isIframeSource } from "@/utils/streamingUtils";

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
  
  useEffect(() => {
    // Update source when provider or content changes
    const options: any = {
      contentType,
      autoplay: autoPlay
    };
    
    if (episodeId) options.episode = episodeId;
    if (seasonNumber) options.season = seasonNumber;
    if (episodeNumber) options.episodeNum = episodeNumber;
    if (title) options.title = title;
    
    try {
      const src = getStreamingUrl(contentId, activeProvider, options);
      setVideoSrc(src);
      
      // Check if this is an iframe source
      const isIframe = isIframeSource(activeProvider);
      setRequiresIframe(isIframe);
      
      // Increment key to force remount of player when source changes
      setKey(prev => prev + 1);
    } catch (error) {
      console.error("Error getting streaming URL:", error);
    }
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
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
  
  return (
    <div className="player-container">
      {renderPlayer()}
    </div>
  );
};

export default VideoPlayerWrapper;

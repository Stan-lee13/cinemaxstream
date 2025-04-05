
import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerPlyr from "./VideoPlayerPlyr";
import VideoPlayerVideoJS from "./VideoPlayerVideoJS";
import { getAvailableProviders, getBestProviderForContentType } from "@/utils/contentUtils";
import { getStreamingUrl } from "@/utils/streamingUtils";

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
      // Increment key to force remount of player when source changes
      setKey(prev => prev + 1);
    } catch (error) {
      console.error("Error getting streaming URL:", error);
    }
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
  };
  
  // Determine which player to use based on props
  const renderPlayer = () => {
    // If using VideoJS (default and recommended)
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
      
      {/* Only show provider selector for basic player */}
      {!useVideoJS && !usePlyr && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Source:</span>
            {availableProviders.map(provider => (
              <button
                key={provider.id}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeProvider === provider.id 
                    ? "bg-cinemax-500 text-white" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleProviderChange(provider.id)}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerWrapper;

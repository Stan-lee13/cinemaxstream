
import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerPlyr from "./VideoPlayerPlyr";
import { getAvailableProviders, getBestProviderForContentType, getStreamingUrl } from "@/utils/videoUtils";

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
  usePlyr = true
}: VideoPlayerWrapperProps) => {
  const availableProviders = getAvailableProviders(contentId, contentType);
  const [activeProvider, setActiveProvider] = useState<string>(getBestProviderForContentType(contentType));
  const [videoSrc, setVideoSrc] = useState<string>("");
  
  useEffect(() => {
    // Update source when provider changes
    const src = getStreamingUrl(
      contentId,
      contentType,
      activeProvider as any,
      episodeId,
      seasonNumber,
      episodeNumber
    );
    setVideoSrc(src);
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
  };
  
  if (usePlyr) {
    return (
      <VideoPlayerPlyr
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
  
  return (
    <div className="flex flex-col gap-4">
      <VideoPlayer
        src={videoSrc}
        contentId={contentId}
        userId={userId}
        episodeId={episodeId}
        autoPlay={autoPlay}
        onEnded={onEnded}
        poster={poster}
      />
      
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
    </div>
  );
};

export default VideoPlayerWrapper;

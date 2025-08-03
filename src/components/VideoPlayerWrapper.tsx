
import { useState, useEffect } from "react";
import { getAvailableProviders } from "@/utils/contentUtils";
import { getStreamingUrl } from "@/utils/streamingUtils";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { toast } from "sonner";
import AdBlockingVideoPlayer from "./AdBlockingVideoPlayer";
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
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  
  // Credit system hooks
  const { userProfile, canStream } = useCreditSystem();
  const { startWatchSession } = useWatchTracking();
  
  // Load video source
  useEffect(() => {
    const loadSource = async () => {
      if (userProfile && !canStream()) {
        setShowUpgradeModal(true);
        return;
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
        
        // Start watch session if user can stream
        if (canStream() && userProfile && userId) {
          await startWatchSession(contentId, title || `Content ${contentId}`);
        }
      } catch (error) {
        console.error("Error getting streaming URL:", error);
        toast.error(`Failed to load video from ${activeProvider}`);
      }
    };
    
    loadSource();
  }, [contentId, contentType, activeProvider, episodeId, seasonNumber, episodeNumber, title, autoPlay, userProfile, canStream, startWatchSession, userId]);
  
  const handleProviderChange = (providerId: string) => {
    setActiveProvider(providerId);
    toast.info(`Switching to ${providerId.replace('_', ' ')} provider`);
  };

  return (
    <>
      {/* Show upgrade modal if user can't stream */}
      {userProfile && !canStream() && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason="streaming"
          currentRole={userProfile.role}
        />
      )}
      
      {/* Show video player if user can stream */}
      {(!userProfile || canStream()) && videoSrc && (
        <AdBlockingVideoPlayer
          src={videoSrc}
          contentId={contentId}
          contentType={contentType}
          title={title}
          poster={poster}
          autoPlay={autoPlay}
          onEnded={onEnded}
          onProviderChange={handleProviderChange}
          availableProviders={availableProviders}
          activeProvider={activeProvider}
        />
      )}
    </>
  );
};

export default VideoPlayerWrapper;

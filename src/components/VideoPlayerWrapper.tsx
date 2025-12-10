
import { useState, useEffect } from "react";
import { getAvailableProviders } from "@/utils/contentUtils";
import { getStreamingUrl } from "@/utils/streamingUtils";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { toast } from "sonner";
import UpgradeModal from "./UpgradeModal";
import { Button } from "./ui/button";

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
  const [activeProvider, setActiveProvider] = useState<string>('vidsrc_xyz');
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  
  // Credit system hooks
  const { userProfile, canStream } = useCreditSystem();
  const { startWatchSession } = useWatchTracking();
  
  // Load video source - add key dependency to force reload
  useEffect(() => {
    const loadSource = async () => {
      if (userProfile && !canStream()) {
        setShowUpgradeModal(true);
        return;
      }

      type StreamOptions = {
        contentType: string;
        autoplay?: boolean;
        episode?: string;
        season?: number;
        episodeNum?: number;
        title?: string;
      };

      const options: StreamOptions = {
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
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            key={`${contentId}-${seasonNumber}-${episodeNumber}-${activeProvider}`}
            src={videoSrc}
            className="absolute inset-0 w-full h-full"
            referrerPolicy="origin"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; screen-orientation-lock"
            title={title || "Video Player"}
          />
        </div>
      )}
    </>
  );
};

export default VideoPlayerWrapper;

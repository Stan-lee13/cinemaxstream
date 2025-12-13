/**
 * Video Player Wrapper Component
 * Uses obfuscated source labels (Source 1-5)
 * Includes VidRock progress listener and ad-free playback
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useUserTier } from "@/hooks/useUserTier"; // Add our new hook
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { toast } from "sonner";
import UpgradeModal from "./UpgradeModal";
import SourceSelector from "./SourceSelector";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  getStreamingUrlForSource,
  getAvailableSources,
  getDefaultSource,
  isVidRockSource
} from "@/utils/providers/providerUtils";

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
  // Credit system and User tier
  const { userProfile, canStream, userUsage } = useCreditSystem();
  const { tier, isPremium } = useUserTier(userId); // Use our new hook
  
  // Source state with persistence
  const [savedSource, setSavedSource] = useLocalStorage<number>(
    'preferred-source',
    getDefaultSource(isPremium)
  );
  const [activeSource, setActiveSource] = useState<number>(savedSource || getDefaultSource(isPremium));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [failedSources, setFailedSources] = useState<number[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasStartedSession = useRef<boolean>(false);
  const vidRockListenerRef = useRef<boolean>(false);

  // Hooks
  const { startWatchSession } = useWatchTracking();
  const { saveProgress } = useVideoProgress();

  // Build video source URL using obfuscated source system
  const videoSrc = useMemo(() => {
    return getStreamingUrlForSource(contentId, activeSource, {
      contentType,
      autoplay: autoPlay,
      season: typeof seasonNumber === 'number' && !isNaN(seasonNumber) ? seasonNumber : undefined,
      episodeNum: typeof episodeNumber === 'number' && !isNaN(episodeNumber) ? episodeNumber : undefined,
    });
  }, [contentId, contentType, activeSource, seasonNumber, episodeNumber, autoPlay]);

  // VidRock message listener for enhanced progress tracking
  useEffect(() => {
    if (!isVidRockSource(activeSource)) return;
    if (vidRockListenerRef.current) return;
    vidRockListenerRef.current = true;

    const handleMessage = (event: MessageEvent) => {
      // Security: only accept messages from vidrock
      if (!event.origin.includes('vidrock.net')) return;

      try {
        const data = event.data;
        if (data?.type === 'MEDIA_DATA' && data.data) {
          // Store VidRock progress
          localStorage.setItem('vidRockProgress', JSON.stringify(data.data));
          
          // Also save to our progress system
          if (data.data.currentTime && data.data.duration) {
            saveProgress({
              contentId,
              contentType,
              season: seasonNumber,
              episode: episodeNumber,
              position: data.data.currentTime,
              duration: data.data.duration,
              timestamp: Date.now(),
              source: activeSource,
              title,
              poster
            });
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      vidRockListenerRef.current = false;
    };
  }, [activeSource, contentId, contentType, seasonNumber, episodeNumber, title, poster, saveProgress]);

  // Check streaming permission using both credit system and user tier
  useEffect(() => {
    if (userProfile && userUsage && !canStream()) {
      setShowUpgradeModal(true);
    }
  }, [userProfile, userUsage, canStream]);

  // Start watch session only once
  useEffect(() => {
    if (!hasStartedSession.current && canStream() && userProfile && userId) {
      hasStartedSession.current = true;
      startWatchSession(contentId, title || `Content ${contentId}`);
    }
  }, [contentId, title, userProfile, userId, canStream, startWatchSession]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
    setFailedSources(prev => {
      if (prev.includes(activeSource)) return prev;
      return [...prev, activeSource];
    });
  }, [activeSource]);

  // Auto-fallback to next source on error
  useEffect(() => {
    if (!loadError) return;

    const allSources = getAvailableSources();
    if (failedSources.length >= allSources.length) {
      toast.error('All sources appear to be blocked. Please try again later.');
      return;
    }

    const nextSource = allSources.find(s => !failedSources.includes(s));
    if (!nextSource || nextSource === activeSource) return;

    const timer = window.setTimeout(() => {
      toast.warning(`Source ${activeSource} blocked. Switching to Source ${nextSource}.`);
      setIsLoading(true);
      setLoadError(false);
      setActiveSource(nextSource);
      setSavedSource(nextSource);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loadError, failedSources, activeSource, setSavedSource]);

  // Source change handler
  const handleSourceChange = useCallback((sourceNum: number) => {
    if (sourceNum === activeSource) return;

    setIsLoading(true);
    setLoadError(false);
    setFailedSources([]);
    setActiveSource(sourceNum);
    setSavedSource(sourceNum);

    toast.info(`Switched to Source ${sourceNum}`);
  }, [activeSource, setSavedSource]);

  // Retry with next source
  const handleRetry = useCallback(() => {
    const allSources = getAvailableSources();
    const currentIndex = allSources.findIndex(s => s === activeSource);
    const nextIndex = (currentIndex + 1) % allSources.length;
    handleSourceChange(allSources[nextIndex]);
  }, [activeSource, handleSourceChange]);

  // Reset all sources
  const resetSources = useCallback(() => {
    const defaultSource = getDefaultSource(isPremium);
    setFailedSources([]);
    setLoadError(false);
    setIsLoading(true);
    setActiveSource(defaultSource);
    setSavedSource(defaultSource);
  }, [isPremium, setSavedSource]);

  // Reset on content change
  useEffect(() => {
    setFailedSources([]);
    setLoadError(false);
    setIsLoading(true);
  }, [contentId, seasonNumber, episodeNumber]);

  // Generate iframe key for controlled re-renders
  const iframeKey = `${contentId}-${seasonNumber ?? 1}-${episodeNumber ?? 1}-${activeSource}`;

  return (
    <div className="space-y-3">
      {/* Source Selector - Obfuscated labels */}
      <SourceSelector
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        isLoading={isLoading}
        isPremium={isPremium}
        disabled={loadError}
      />

      {/* Upgrade modal if user can't stream */}
      {userProfile && userUsage && !canStream() && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason="streaming"
          currentRole={userProfile.role}
        />
      )}

      {/* Video player */}
      {(!userProfile || canStream()) && (
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading video...</span>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-4 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Source unavailable</p>
              <p className="text-sm text-muted-foreground">
                Source {activeSource} is not loading. We're switching automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button onClick={handleRetry} className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Next Source
                </Button>
                <Button variant="outline" onClick={resetSources} className="flex-1">
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={videoSrc}
              className="absolute inset-0 w-full h-full border-0"
              referrerPolicy="origin"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              title={title || "Video Player"}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayerWrapper;
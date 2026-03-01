/**
 * Modern Video Player Wrapper Component
 * Clean, minimal UI with smooth transitions
 * Uses obfuscated source labels for provider protection
 * Includes: mobile fullscreen landscape, PiP support, cast
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useUserTier } from "@/hooks/useUserTier";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { toast } from "sonner";
import UpgradeModal from "./UpgradeModal";
import SourceSelector from "./SourceSelector";
import CastButton from "./CastButton";
import { AlertCircle, RefreshCw, PictureInPicture2, Maximize } from "lucide-react";
import { Button } from "./ui/button";
import { requestFullscreenLandscape, exitFullscreenAndUnlock, isPipSupported, isMobileDevice } from "@/utils/playerUtils";
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
  const { userProfile, canStream, userUsage } = useCreditSystem();
  const { tier, isPremium } = useUserTier(userId);
  
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
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedSession = useRef<boolean>(false);
  const vidRockListenerRef = useRef<boolean>(false);
  const hasAutoFullscreened = useRef<boolean>(false);

  const { startWatchSession } = useWatchTracking();
  const { saveProgress } = useVideoProgress();

  const videoSrc = useMemo(() => {
    return getStreamingUrlForSource(contentId, activeSource, {
      contentType,
      autoplay: autoPlay,
      season: typeof seasonNumber === 'number' && !isNaN(seasonNumber) ? seasonNumber : undefined,
      episodeNum: typeof episodeNumber === 'number' && !isNaN(episodeNumber) ? episodeNumber : undefined,
    });
  }, [contentId, contentType, activeSource, seasonNumber, episodeNumber, autoPlay]);

  // Auto fullscreen landscape on mobile when player loads
  useEffect(() => {
    if (isMobileDevice() && !hasAutoFullscreened.current && containerRef.current && !isLoading) {
      hasAutoFullscreened.current = true;
      requestFullscreenLandscape(containerRef.current);
    }
  }, [isLoading]);

  // Release orientation lock when unmounted
  useEffect(() => {
    return () => {
      if (hasAutoFullscreened.current) {
        exitFullscreenAndUnlock();
      }
    };
  }, []);

  // VidRock message listener
  useEffect(() => {
    if (!isVidRockSource(activeSource)) return;
    if (vidRockListenerRef.current) return;
    vidRockListenerRef.current = true;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vidrock.net')) return;
      try {
        const data = event.data;
        if (data?.type === 'MEDIA_DATA' && data.data) {
          localStorage.setItem('vidRockProgress', JSON.stringify(data.data));
          if (data.data.currentTime && data.data.duration) {
            saveProgress({
              contentId, contentType, season: seasonNumber, episode: episodeNumber,
              position: data.data.currentTime, duration: data.data.duration,
              timestamp: Date.now(), source: activeSource, title, poster
            });
          }
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      vidRockListenerRef.current = false;
    };
  }, [activeSource, contentId, contentType, seasonNumber, episodeNumber, title, poster, saveProgress]);

  // Check streaming permission
  useEffect(() => {
    if (userProfile && userUsage && !canStream()) {
      setShowUpgradeModal(true);
    }
  }, [userProfile, userUsage, canStream]);

  // Start watch session once
  useEffect(() => {
    if (!hasStartedSession.current && canStream() && userProfile && userId) {
      hasStartedSession.current = true;
      startWatchSession(contentId, title || `Content ${contentId}`);
    }
  }, [contentId, title, userProfile, userId, canStream, startWatchSession]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
    setFailedSources(prev => prev.includes(activeSource) ? prev : [...prev, activeSource]);
  }, [activeSource]);

  // Auto-fallback
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

  const handleSourceChange = useCallback((sourceNum: number) => {
    if (sourceNum === activeSource) return;
    setIsLoading(true);
    setLoadError(false);
    setFailedSources([]);
    setActiveSource(sourceNum);
    setSavedSource(sourceNum);
    toast.info(`Switched to Source ${sourceNum}`);
  }, [activeSource, setSavedSource]);

  const handleRetry = useCallback(() => {
    const allSources = getAvailableSources();
    const currentIndex = allSources.findIndex(s => s === activeSource);
    const nextIndex = (currentIndex + 1) % allSources.length;
    handleSourceChange(allSources[nextIndex]);
  }, [activeSource, handleSourceChange]);

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
    hasAutoFullscreened.current = false;
  }, [contentId, seasonNumber, episodeNumber]);

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      requestFullscreenLandscape(containerRef.current);
    }
  }, []);

  const handlePiP = useCallback(async () => {
    // PiP requires a real <video> element; with iframes we attempt via the iframe's video
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      
      // Try getting video from within iframe (same-origin only)
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const video = iframeDoc.querySelector('video');
          if (video && document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
            return;
          }
        }
      } catch {
        // Cross-origin — can't access iframe content
      }

      toast.info('PiP is not available for this source. Try a different source.');
    } catch {
      toast.error('Picture-in-Picture failed');
    }
  }, []);

  const iframeKey = `${contentId}-${seasonNumber ?? 1}-${episodeNumber ?? 1}-${activeSource}`;
  const showPiP = isPipSupported();

  return (
    <div className="space-y-4">
      {/* Source Selector + Controls */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <SourceSelector
            activeSource={activeSource}
            onSourceChange={handleSourceChange}
            isLoading={isLoading}
            isPremium={isPremium}
            disabled={loadError}
          />
        </div>
        <CastButton videoUrl={videoSrc} title={title} />
        {showPiP && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={handlePiP}
            title="Picture-in-Picture"
          >
            <PictureInPicture2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleFullscreen}
          title="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Upgrade modal */}
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
        <div
          ref={containerRef}
          className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-black/95 to-black z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Loading video...</p>
                  <p className="text-xs text-muted-foreground mt-1">Source {activeSource}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-black/95 to-black z-10 gap-6 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">Source Unavailable</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Source {activeSource} isn't responding. Switching automatically...
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Button onClick={handleRetry} className="flex-1 gap-2 h-11">
                  <RefreshCw className="h-4 w-4" />
                  Next Source
                </Button>
                <Button variant="outline" onClick={resetSources} className="flex-1 h-11">
                  Reset All
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
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

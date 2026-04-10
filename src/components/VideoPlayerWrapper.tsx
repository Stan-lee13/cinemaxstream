/**
 * Modern Video Player Wrapper Component
 * Smart Source Engine integration, anti-ad protection, aspect ratio controls
 * 4 sources: Videasy, Vidnest, Vidrock, Vidlink
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
import { AlertCircle, RefreshCw, Maximize, Loader2, Monitor, Expand, RectangleHorizontal, Tv } from "lucide-react";
import { Button } from "./ui/button";
import { requestFullscreenLandscape, exitFullscreenAndUnlock, isMobileDevice } from "@/utils/playerUtils";
import {
  getStreamingUrlForSource,
  getAvailableSources,
  getDefaultSource,
  isVidRockSource,
  getSourceConfig,
} from "@/utils/providers/providerUtils";
import {
  getAdaptiveSource,
  recordSourceResult,
  getNextFallback,
  getHealthSummary,
  getRankedSources,
} from "@/utils/providers/smartSourceEngine";
import { saveGlobalState, loadGlobalState } from "@/utils/globalState";
import { Skeleton } from "./ui/skeleton";

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
  forcedSource?: number;
}

const LOAD_TIMEOUT_MS = 20_000;

type AspectRatio = 'fit' | 'fill' | 'cinema' | 'fullscreen';

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  fit: 'object-contain',
  fill: 'object-cover',
  cinema: 'object-cover',
  fullscreen: 'object-cover',
};

const ASPECT_STYLES: Record<AspectRatio, string> = {
  fit: '16/9',
  fill: '16/9',
  cinema: '2.35/1',
  fullscreen: '16/9',
};

const ASPECT_ICONS: Record<AspectRatio, React.ElementType> = {
  fit: Monitor,
  fill: Expand,
  cinema: RectangleHorizontal,
  fullscreen: Tv,
};

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
  forcedSource,
}: VideoPlayerWrapperProps) => {
  const { userProfile, canStream, userUsage } = useCreditSystem();
  const { tier, isPremium } = useUserTier(userId);

  // Load persisted state
  const globalState = loadGlobalState();

  const [savedSource, setSavedSource] = useLocalStorage<number>(
    'preferred-source',
    getAdaptiveSource()
  );
  const [activeSource, setActiveSource] = useState<number>(savedSource || getAdaptiveSource());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [failedSources, setFailedSources] = useState<number[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    (globalState.preferredAspectRatio as AspectRatio) || 'fit'
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStartedSession = useRef<boolean>(false);
  const hasAutoFullscreened = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartRef = useRef<number>(Date.now());

  const { startWatchSession, addWatchEvent, endWatchSession } = useWatchTracking();
  const { saveProgress, getProgress } = useVideoProgress();
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Health data for source selector
  const healthData = useMemo(() => {
    const summary = getHealthSummary();
    const map: Record<number, { healthy: boolean; latency: number }> = {};
    summary.forEach(s => { map[s.source] = { healthy: s.healthy, latency: s.latency }; });
    return map;
  }, [activeSource, isLoading]);

  const progressState = useMemo(() => {
    return getProgress(contentId, seasonNumber, episodeNumber);
  }, [getProgress, contentId, seasonNumber, episodeNumber]);

  const videoSrc = useMemo(() => {
    return getStreamingUrlForSource(contentId, activeSource, {
      contentType,
      autoplay: autoPlay,
      season: typeof seasonNumber === 'number' && !isNaN(seasonNumber) ? seasonNumber : undefined,
      episodeNum: typeof episodeNumber === 'number' && !isNaN(episodeNumber) ? episodeNumber : undefined,
      progress: progressState?.position,
    });
  }, [contentId, contentType, activeSource, seasonNumber, episodeNumber, autoPlay, progressState]);

  // Resolve source from ContentDetail selector
  useEffect(() => {
    if (typeof forcedSource === 'number' && forcedSource >= 1) {
      setActiveSource(forcedSource);
      setSavedSource(forcedSource);
    }
  }, [forcedSource, setSavedSource]);

  // Get referrer for current source
  const sourceReferrer = useMemo(() => {
    const cfg = getSourceConfig(activeSource);
    return cfg.referrer || '';
  }, [activeSource]);

  // 20-second timeout detection with smart fallback
  useEffect(() => {
    if (!isLoading) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    loadStartRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        // Record failure
        recordSourceResult(activeSource, LOAD_TIMEOUT_MS, false);
        setFailedSources(prev => prev.includes(activeSource) ? prev : [...prev, activeSource]);

        // Try smart fallback
        const next = getNextFallback(activeSource, failedSources);
        if (next !== null) {
          toast.warning(`${getSourceConfig(activeSource).label} timed out. Switching to ${getSourceConfig(next).label}...`);
          setIsLoading(true);
          setLoadError(false);
          setActiveSource(next);
          setSavedSource(next);
        } else {
          setIsLoading(false);
          setLoadError(true);
        }
      }
    }, LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, activeSource, failedSources]);

  // Auto fullscreen landscape on mobile
  useEffect(() => {
    if (isMobileDevice() && !hasAutoFullscreened.current && containerRef.current && !isLoading) {
      hasAutoFullscreened.current = true;
      requestFullscreenLandscape(containerRef.current);
    }
  }, [isLoading]);

  // Release orientation lock on unmount
  useEffect(() => {
    return () => {
      if (hasAutoFullscreened.current) exitFullscreenAndUnlock();
    };
  }, []);

  // Videasy/VidRock progress message listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Videasy progress format
        if (data.timestamp && data.duration) {
          saveProgress({
            contentId, contentType, season: seasonNumber, episode: episodeNumber,
            position: data.timestamp, duration: data.duration,
            timestamp: Date.now(), source: activeSource, title, poster
          });
        }

        // VidRock format
        if (data?.type === 'MEDIA_DATA' && data.data?.currentTime && data.data?.duration) {
          saveProgress({
            contentId, contentType, season: seasonNumber, episode: episodeNumber,
            position: data.data.currentTime, duration: data.data.duration,
            timestamp: Date.now(), source: activeSource, title, poster
          });
        }
      } catch { /* ignore non-JSON messages */ }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeSource, contentId, contentType, seasonNumber, episodeNumber, title, poster, saveProgress]);

  // Check streaming permission
  useEffect(() => {
    if (userProfile && userUsage && !canStream()) setShowUpgradeModal(true);
  }, [userProfile, userUsage, canStream]);

  // Start watch session once + periodic watch time updates
  useEffect(() => {
    if (!hasStartedSession.current && canStream() && userProfile && userId) {
      hasStartedSession.current = true;
      startWatchSession(contentId, title || `Content ${contentId}`);

      // Estimate watch time: every 60s, add 60s of watched time
      // This is the best we can do without cross-origin iframe access
      watchIntervalRef.current = setInterval(() => {
        if (!isLoading && !loadError) {
          addWatchEvent('pause', 0);
        }
      }, 60_000);
    }

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      if (hasStartedSession.current) {
        endWatchSession();
      }
    };
  }, [contentId, title, userProfile, userId, canStream, startWatchSession, addWatchEvent, endWatchSession, isLoading, loadError]);

  const handleIframeLoad = useCallback(() => {
    const latency = Date.now() - loadStartRef.current;
    recordSourceResult(activeSource, latency, true);
    setIsLoading(false);
    setLoadError(false);
  }, [activeSource]);

  const handleIframeError = useCallback(() => {
    recordSourceResult(activeSource, LOAD_TIMEOUT_MS, false);
    setIsLoading(false);
    setLoadError(true);
    setFailedSources(prev => prev.includes(activeSource) ? prev : [...prev, activeSource]);
  }, [activeSource]);

  // Auto-fallback on error
  useEffect(() => {
    if (!loadError) return;
    const next = getNextFallback(activeSource, failedSources);
    if (next === null) return;
    const timer = setTimeout(() => {
      toast.warning(`${getSourceConfig(activeSource).label} unavailable. Switching to ${getSourceConfig(next).label}...`);
      setIsLoading(true);
      setLoadError(false);
      setActiveSource(next);
      setSavedSource(next);
    }, 1000);
    return () => clearTimeout(timer);
  }, [loadError, failedSources, activeSource, setSavedSource]);

  const handleSourceChange = useCallback((sourceNum: number) => {
    if (sourceNum === activeSource) return;
    setIsLoading(true);
    setLoadError(false);
    setFailedSources([]);
    setActiveSource(sourceNum);
    setSavedSource(sourceNum);
    saveGlobalState({ preferredSource: sourceNum });
    toast.info(`Switched to ${getSourceConfig(sourceNum).label}`);
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
    if (containerRef.current) requestFullscreenLandscape(containerRef.current);
  }, []);


  const cycleAspectRatio = useCallback(() => {
    const ratios: AspectRatio[] = ['fit', 'fill', 'cinema', 'fullscreen'];
    const idx = ratios.indexOf(aspectRatio);
    const next = ratios[(idx + 1) % ratios.length];
    setAspectRatio(next);
    saveGlobalState({ preferredAspectRatio: next });
    toast.info(`Aspect: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
  }, [aspectRatio]);

  const iframeKey = `${contentId}-${seasonNumber ?? 1}-${episodeNumber ?? 1}-${activeSource}`;
  const allSourcesFailed = failedSources.length >= getAvailableSources().length;
  const AspectIcon = ASPECT_ICONS[aspectRatio];

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
            healthMap={healthData}
          />
        </div>
        <CastButton videoUrl={videoSrc} title={title} />
        {/* Aspect ratio */}
        <Button
          variant="ghost" size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={cycleAspectRatio}
          title={`Aspect: ${aspectRatio}`}
          data-player-ui
        >
          <AspectIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
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
          className="video-player-container relative w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10"
          style={{ aspectRatio: ASPECT_STYLES[aspectRatio] }}
        >
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
              <Skeleton className="absolute inset-0 bg-muted/20" />
              <div className="relative flex flex-col items-center gap-4 z-20">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <Loader2 className="relative w-12 h-12 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Loading stream...</p>
                  <p className="text-xs text-muted-foreground mt-1">{getSourceConfig(activeSource).label}</p>
                </div>
              </div>
            </div>
          )}

          {/* All sources failed */}
          {allSourcesFailed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-6 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">Streaming Temporarily Unavailable</p>
                <p className="text-sm text-muted-foreground max-w-xs">All sources are currently down. Please try again later.</p>
              </div>
              <Button onClick={resetSources} className="gap-2 h-11">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          ) : loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-6 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">Source Unavailable</p>
                <p className="text-sm text-muted-foreground max-w-xs">{getSourceConfig(activeSource).label} isn't responding. Switching automatically...</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Button onClick={handleRetry} className="flex-1 gap-2 h-11">
                  <RefreshCw className="h-4 w-4" /> Next Source
                </Button>
                <Button variant="outline" onClick={resetSources} className="flex-1 h-11">Reset All</Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={videoSrc}
              className={`absolute inset-0 w-full h-full border-0 ${ASPECT_CLASSES[aspectRatio]}`}
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

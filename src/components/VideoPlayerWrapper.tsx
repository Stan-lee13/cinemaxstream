import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getAvailableProviders, streamingProviders } from "@/utils/contentUtils";
import { getStreamingUrl } from "@/utils/streamingUtils";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import UpgradeModal from "./UpgradeModal";
import { AlertCircle, RefreshCw, Check } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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
  const [savedProvider, setSavedProvider] = useLocalStorage<string>('preferred-provider', 'vidsrc_embed_ru');
  const [activeProvider, setActiveProvider] = useState<string>(savedProvider || 'vidsrc_embed_ru');
  const [lastErrorProvider, setLastErrorProvider] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [failedProviders, setFailedProviders] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasStartedSession = useRef<boolean>(false);
  
  // Credit system hooks
  const { userProfile, canStream } = useCreditSystem();
  const { startWatchSession } = useWatchTracking();

  // Memoize the video source URL to prevent unnecessary recalculations
  const videoSrc = useMemo(() => {
    const options = {
      contentType,
      autoplay: autoPlay,
      season: typeof seasonNumber === 'number' && !isNaN(seasonNumber) ? seasonNumber : undefined,
      episodeNum: typeof episodeNumber === 'number' && !isNaN(episodeNumber) ? episodeNumber : undefined,
    };
    return getStreamingUrl(contentId, activeProvider, options);
  }, [contentId, contentType, activeProvider, seasonNumber, episodeNumber, autoPlay]);

  // Check streaming permission
  useEffect(() => {
    if (userProfile && !canStream()) {
      setShowUpgradeModal(true);
    }
  }, [userProfile, canStream]);

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
    setLastErrorProvider(activeProvider);
    setFailedProviders(prev => {
      if (prev.includes(activeProvider)) {
        return prev;
      }
      return [...prev, activeProvider];
    });
  }, [activeProvider]);

  useEffect(() => {
    if (!loadError) return;
    if (failedProviders.length >= streamingProviders.length) {
      toast.error('All providers appear to be blocked. Please try again later or clear your cache.');
      return;
    }

    const ordered = streamingProviders.map(p => p.id);
    const nextProvider = ordered.find(id => !failedProviders.includes(id));

    if (!nextProvider || nextProvider === activeProvider) {
      return;
    }

    const timer = window.setTimeout(() => {
      const providerName = streamingProviders.find(p => p.id === nextProvider)?.name || nextProvider;
      toast.warning(`Provider blocked / failed. Switching to ${providerName}.`);
      setIsLoading(true);
      setLoadError(false);
      setActiveProvider(nextProvider);
      setSavedProvider(nextProvider);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loadError, failedProviders, activeProvider, setSavedProvider]);

  // Provider change handler
  const handleProviderChange = useCallback((providerId: string) => {
    if (providerId === activeProvider) return;
    
    setIsLoading(true);
    setLoadError(false);
    setFailedProviders([]);
    setLastErrorProvider(null);
    setActiveProvider(providerId);
    setSavedProvider(providerId);
    
    const providerName = streamingProviders.find(p => p.id === providerId)?.name || providerId;
    toast.info(`Switched to ${providerName}`);
  }, [activeProvider, setSavedProvider]);

  // Retry with next provider
  const handleRetry = useCallback(() => {
    const ordered = streamingProviders.map(p => p.id);
    const currentIndex = ordered.findIndex(id => id === activeProvider);
    const nextIndex = (currentIndex + 1) % ordered.length;
    handleProviderChange(ordered[nextIndex]);
  }, [activeProvider, handleProviderChange]);

  const resetProviderCycle = useCallback(() => {
    const defaultProvider = savedProvider || streamingProviders[0]?.id || 'vidsrc_embed_ru';
    setFailedProviders([]);
    setLoadError(false);
    setIsLoading(true);
    setLastErrorProvider(null);
    setActiveProvider(defaultProvider);
    setSavedProvider(defaultProvider);
  }, [savedProvider, setSavedProvider]);

  useEffect(() => {
    setFailedProviders([]);
    setLastErrorProvider(null);
    setLoadError(false);
    setIsLoading(true);
  }, [contentId, seasonNumber, episodeNumber]);

  // Generate iframe key for controlled re-renders
  const iframeKey = `${contentId}-${seasonNumber ?? 1}-${episodeNumber ?? 1}-${activeProvider}`;

  return (
    <div className="space-y-3">
      {/* Provider Selector - Inline buttons */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-secondary/30 rounded-lg" data-tour-id="provider-selector">
        <span className="text-sm text-muted-foreground whitespace-nowrap mr-1">Source:</span>
        {streamingProviders.map((provider) => (
          <Button
            key={provider.id}
            variant={activeProvider === provider.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleProviderChange(provider.id)}
            disabled={isLoading && activeProvider !== provider.id}
            className={cn(
              "h-7 px-3 text-xs transition-all",
              activeProvider === provider.id && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
          >
            {activeProvider === provider.id && <Check className="h-3 w-3 mr-1" />}
            {provider.name}
          </Button>
        ))}
        {isLoading && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
        )}
      </div>

      {/* Upgrade modal if user can't stream */}
      {userProfile && !canStream() && (
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
              <p className="text-lg font-semibold">Provider blocked / failed</p>
              <p className="text-sm text-muted-foreground">
                {lastErrorProvider
                  ? `${streamingProviders.find(p => p.id === lastErrorProvider)?.name || 'This provider'} is not loading.`
                  : 'The current provider may be unavailable.'}
                {" "}We’re switching sources automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button onClick={handleRetry} className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Another Source
                </Button>
                <Button variant="outline" onClick={resetProviderCycle} className="flex-1">
                  Reset Providers
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

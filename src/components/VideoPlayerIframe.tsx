
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";
import { toast } from "sonner";
import StreamingProviderSelector from "./StreamingProviderSelector";

interface VideoPlayerIframeProps {
  src: string;
  contentId: string;
  contentType: string;
  userId?: string;
  episodeId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  poster?: string;
  title?: string;
  availableProviders: any[];
  activeProvider: string;
  onProviderChange: (providerId: string) => void;
  onError?: () => void;
  onLoaded?: () => void;
}

const VideoPlayerIframe: React.FC<VideoPlayerIframeProps> = ({ 
  src, 
  contentId, 
  contentType,
  userId,
  episodeId,
  autoPlay = false,
  onEnded,
  poster,
  title = "Video",
  availableProviders,
  activeProvider,
  onProviderChange,
  onError,
  onLoaded
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now()); // For forcing iframe reload
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up activity tracking
  useEffect(() => {
    // Only track if we have a user ID
    if (!userId) return;
    
    // Start tracking after a few seconds (assuming content has started playing)
    const tracker = setTimeout(() => {
      trackStreamingActivity(contentId, userId, 0, episodeId);
      
      // Set up periodic tracking
      const interval = setInterval(() => {
        trackStreamingActivity(contentId, userId, 15, episodeId);
      }, 15000);
      
      return () => clearInterval(interval);
    }, 3000);
    
    return () => clearTimeout(tracker);
  }, [contentId, userId, episodeId, src]);
  
  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    toast.success(`Now playing: ${title}`, { id: "player-loaded", duration: 2000 });
    if (onLoaded) onLoaded();
  };
  
  // Handle errors
  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load content from this provider. Try another source.");
    toast.error("Failed to load video", { id: "player-error" });
    if (onError) onError();
  };
  
  // Reload iframe
  const reloadPlayer = () => {
    setIsLoading(true);
    setError(null);
    setKey(Date.now());
  };

  // Add event listener for iframe loading errors
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoadError = () => handleIframeError();
    
    // Modern browsers might not trigger error events on iframes due to security
    // This timeout is a fallback for detecting stalled loads
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        // Check if iframe has loaded content
        try {
          const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (!iframeDoc || iframeDoc.readyState !== 'complete') {
            handleIframeError();
          }
        } catch (e) {
          // If we can't access the document (cross-origin), assume it's loading
          // Cross-origin iframe, can't check load state
        }
      }
    }, 10000);

    iframe.addEventListener('error', handleLoadError);
    
    return () => {
      iframe.removeEventListener('error', handleLoadError);
      clearTimeout(loadTimeout);
    };
  }, [isLoading]);
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden w-full aspect-video"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              onClick={reloadPlayer}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            <StreamingProviderSelector
              providers={availableProviders}
              activeProvider={activeProvider}
              contentType={contentType}
              onProviderChange={onProviderChange}
              variant="inline"
            />
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        key={`iframe-${key}`}
        src={src}
        className="w-full h-full"
        allowFullScreen
        onLoad={handleIframeLoad}
        sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        style={{ border: 'none' }}
      ></iframe>
      
      {/* Custom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <StreamingProviderSelector
          providers={availableProviders}
          activeProvider={activeProvider}
          contentType={contentType}
          onProviderChange={onProviderChange}
        />
      </div>
    </div>
  );
};

export default VideoPlayerIframe;

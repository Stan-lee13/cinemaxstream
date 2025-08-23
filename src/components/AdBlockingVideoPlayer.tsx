import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings } from 'lucide-react';
import { useVideoControls } from '@/hooks/useVideoControls';
import { toast } from 'sonner';

interface AdBlockingVideoPlayerProps {
  src: string;
  contentId: string;
  contentType: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onProviderChange?: (provider: string) => void;
  availableProviders?: any[];
  activeProvider?: string;
}

const AdBlockingVideoPlayer: React.FC<AdBlockingVideoPlayerProps> = ({
  src,
  contentId,
  contentType,
  title = "Video Player",
  poster,
  autoPlay = false,
  onEnded,
  onProviderChange,
  availableProviders = [],
  activeProvider = 'vidsrc_su'
}) => {
  const {
    videoRef,
    containerRef,
    isFullscreen,
    isPipActive,
    toggleFullscreen,
    togglePictureInPicture,
    fullscreenSupported,
    pipSupported
  } = useVideoControls();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [adBlocked, setAdBlocked] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const adBlockerRef = useRef<HTMLDivElement>(null);

  // Ad blocking script injection
  const adBlockingScript = `
    (function() {
      // Block common ad selectors
      const adSelectors = [
        '[class*="ad"]',
        '[id*="ad"]',
        '[class*="banner"]',
        '[class*="popup"]',
        '[class*="overlay"]',
        '.advertisement',
        '.ads',
        '.sponsored',
        '.promo'
      ];
      
      // Remove ad elements
      function removeAds() {
        adSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el && el.parentNode) {
                el.parentNode.removeChild(el);
              }
            });
          } catch(e) {}
        });
      }
      
      // Block ad network requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string') {
          const adDomains = ['doubleclick', 'googleads', 'googlesyndication', 'adsystem'];
          if (adDomains.some(domain => url.includes(domain))) {
            return Promise.reject(new Error('Ad blocked'));
          }
        }
        return originalFetch.apply(this, args);
      };
      
      // Initial ad removal
      removeAds();
      
      // Set up mutation observer for dynamic content
      const observer = new MutationObserver(removeAds);
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Remove ads on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeAds);
      }
      
      // Periodic cleanup
      setInterval(removeAds, 1000);
    })();
  `;

  // Handle iframe load with ad blocking
  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Inject ad blocking script
        const script = iframe.contentDocument?.createElement('script');
        if (script) {
          script.textContent = adBlockingScript;
          iframe.contentDocument?.head?.appendChild(script);
          setAdBlocked(true);
          toast.success("Ad blocking activated", { duration: 2000 });
        }
      }
    } catch (e) {
      // Cross-origin restrictions - expected for external iframes
      // Cross-origin iframe - ad blocking script injection blocked
    }
    
    toast.success(`${title} loaded successfully`);
  };

  const handlePlayClick = () => {
    setShowPlayButton(false);
    setIsLoading(true);
    
    // Add slight delay to simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);
    }, 1500);
  };

  const handleProviderSwitch = (provider: string) => {
    if (onProviderChange) {
      setIsLoading(true);
      setError(null);
      setShowPlayButton(true);
      onProviderChange(provider);
      toast.info(`Switching to ${provider.replace('_', ' ')}`);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load video. Try switching providers.");
    setShowPlayButton(true);
    toast.error("Video failed to load");
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setShowPlayButton(false);
    
    // Force iframe reload
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Show/hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden w-full aspect-video group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading {title}...</p>
            {adBlocked && <p className="text-sm text-green-400 mt-2">🛡️ Ad blocking active</p>}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 p-6 text-center">
          <div className="text-white space-y-4">
            <h3 className="text-xl font-semibold">Playback Error</h3>
            <p className="text-gray-300">{error}</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              {availableProviders.length > 1 && (
                <div className="flex gap-2">
                  {availableProviders
                    .filter(p => p.id !== activeProvider)
                    .slice(0, 2)
                    .map(provider => (
                    <Button
                      key={provider.id}
                      onClick={() => handleProviderSwitch(provider.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Try {provider.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {showPlayButton && !isLoading && !error && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Button
            onClick={handlePlayClick}
            size="lg"
            className="rounded-full w-20 h-20 bg-primary/90 hover:bg-primary"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

      {/* Ad Blocker Overlay */}
      <div 
        ref={adBlockerRef}
        className="absolute inset-0 bg-black/80 z-5 pointer-events-none"
        style={{ display: adBlocked ? 'none' : 'block' }}
      />

      {/* Main Video Iframe */}
      {src && !showPlayButton && (
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full h-full"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleError}
          sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="no-referrer"
          style={{ border: 'none' }}
        />
      )}

      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || isFullscreen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <div className="text-sm">
              {title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {availableProviders.length > 1 && (
              <select
                value={activeProvider}
                onChange={(e) => handleProviderSwitch(e.target.value)}
                className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
              >
                {availableProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            )}

            {pipSupported && (
              <Button
                onClick={togglePictureInPicture}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {fullscreenSupported && (
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ad Blocking Status */}
      {adBlocked && (
        <div className="absolute top-4 right-4 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
          🛡️ Ads Blocked
        </div>
      )}
    </div>
  );
};

export default AdBlockingVideoPlayer;
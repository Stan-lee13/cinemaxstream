/**
 * Cast to TV Button Component
 * Supports Google Cast (Chromecast) and AirPlay
 * Includes retry discovery loop and debug status
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Cast, Monitor, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CastButtonProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

type PresentationRequestLike = new (urls: string[]) => {
  start: () => Promise<{ addEventListener: (event: 'close', cb: () => void) => void }>;
};

type ChromeCastWindow = Window & {
  chrome?: {
    cast?: unknown;
  };
  PresentationRequest?: PresentationRequestLike;
};

const MAX_DISCOVERY_RETRIES = 3;
const RETRY_INTERVAL_MS = 2000;

const CastButton = ({ videoUrl, title, className }: CastButtonProps) => {
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const [deviceName, setDeviceName] = useState<string>('');
  const [discoveryState, setDiscoveryState] = useState<'idle' | 'discovering' | 'ready' | 'failed'>('idle');

  // Discovery with retry loop
  useEffect(() => {
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const attemptDiscovery = () => {
      if (cancelled) return;
      setDiscoveryState('discovering');

      const browserWindow = window as ChromeCastWindow;
      let found = false;

      // Check AirPlay (Safari)
      if ('WebKitPlaybackTargetAvailabilityEvent' in window) {
        found = true;
      }

      // Check Chrome Cast API
      if (browserWindow.chrome?.cast) {
        found = true;
      }

      // Check Remote Playback API
      if ('RemotePlayback' in window) {
        found = true;
      }

      if (found) {
        setCastAvailable(true);
        setDiscoveryState('ready');
        return;
      }

      retryCount++;
      if (retryCount < MAX_DISCOVERY_RETRIES) {
        retryTimer = setTimeout(attemptDiscovery, RETRY_INTERVAL_MS);
      } else {
        setDiscoveryState('failed');
        setCastAvailable(false);
      }
    };

    // Wait for network + page load before starting discovery
    const startAfterReady = () => {
      if (document.readyState === 'complete') {
        attemptDiscovery();
      } else {
        window.addEventListener('load', attemptDiscovery, { once: true });
      }
    };

    startAfterReady();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, []);

  const handleCast = useCallback(async () => {
    if (isCasting) {
      setIsCasting(false);
      setDeviceName('');
      toast.info('Disconnected from cast device');
      return;
    }

    try {
      // Try Remote Playback API first (Chrome, Edge)
      if ('RemotePlayback' in window) {
        const video = document.createElement('video');
        video.src = videoUrl;

        if (video.remote) {
          try {
            await video.remote.prompt();
            setIsCasting(true);
            setDeviceName('External Display');
            toast.success('Now casting to external display');

            video.remote.addEventListener('disconnect', () => {
              setIsCasting(false);
              setDeviceName('');
              toast.info('Cast disconnected');
            });
            return;
          } catch {
            // User cancelled or no devices
          }
        }
      }

      // Fallback: Try Presentation API
      const browserWindow = window as ChromeCastWindow;
      if (typeof browserWindow.PresentationRequest === 'function') {
        try {
          const request = new browserWindow.PresentationRequest([videoUrl]);
          const connection = await request.start();
          setIsCasting(true);
          setDeviceName('Presentation Display');
          toast.success('Casting to display');

          connection.addEventListener('close', () => {
            setIsCasting(false);
            setDeviceName('');
          });
          return;
        } catch {
          // User cancelled
        }
      }

      toast.error('No cast devices found. Make sure your device is on the same network.');
    } catch (error) {
      console.error('Cast error:', error);
      toast.error('Failed to start casting');
    }
  }, [isCasting, videoUrl]);

  // Don't show until discovery completes
  if (discoveryState === 'idle' || discoveryState === 'discovering') {
    return (
      <div className={className}>
        <Button variant="ghost" size="sm" disabled className="gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs hidden sm:inline">Scanning...</span>
        </Button>
      </div>
    );
  }

  if (!castAvailable) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        variant={isCasting ? 'default' : 'ghost'}
        size="sm"
        onClick={handleCast}
        className={`gap-2 ${isCasting ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        title={isCasting ? `Casting to ${deviceName}` : (title ?? 'Cast to TV')}
      >
        {isCasting ? (
          <>
            <Monitor className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">{deviceName}</span>
            <X className="h-3 w-3" />
          </>
        ) : (
          <>
            <Cast className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Cast</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default CastButton;

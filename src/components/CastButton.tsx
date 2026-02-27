/**
 * Cast to TV Button Component
 * Supports Google Cast (Chromecast) and AirPlay
 * Only shows when cast-capable devices are available
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Cast, Monitor, X } from 'lucide-react';
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

const CastButton = ({ videoUrl, title, className }: CastButtonProps) => {
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const [deviceName, setDeviceName] = useState<string>('');
  const airplayRef = useRef<HTMLVideoElement | null>(null);

  // Check for Cast availability
  useEffect(() => {
    const browserWindow = window as ChromeCastWindow;

    // Check for AirPlay support (Safari)
    if ('WebKitPlaybackTargetAvailabilityEvent' in window) {
      setCastAvailable(true);
    }

    // Check for Chrome Cast API
    if (browserWindow.chrome?.cast) {
      setCastAvailable(true);
    }

    // For browsers with Remote Playback API
    if ('RemotePlayback' in window) {
      setCastAvailable(true);
    }
  }, []);

  const handleCast = useCallback(async () => {
    if (isCasting) {
      // Disconnect
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

      // No cast method worked
      toast.error('No cast devices found. Make sure your device is on the same network.');
    } catch (error) {
      console.error('Cast error:', error);
      toast.error('Failed to start casting');
    }
  }, [isCasting, videoUrl]);

  const browserWindow = window as ChromeCastWindow;

  // Don't show button if casting is not available at all
  if (!castAvailable && typeof browserWindow.PresentationRequest !== 'function' && !('RemotePlayback' in window)) {
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

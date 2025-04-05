
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Maximize, SkipForward, SkipBack, Download, Video } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";
import { toast } from "sonner";
import StreamingProviderSelector from "./StreamingProviderSelector";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerVideoJSProps {
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
}

const VideoPlayerVideoJS: React.FC<VideoPlayerVideoJSProps> = ({ 
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
  onProviderChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecordingFn, setStopRecordingFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  // Initialize Video.js
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.dispose();
    }
    
    const videoJsOptions = {
      autoplay: false, // We'll handle autoplay manually to avoid browser restrictions
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{
        src: src,
        type: 'video/mp4',
      }],
      poster: poster,
      muted: true, // Start muted to enable autoplay
      playsinline: true,
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      }
    };
    
    const player = videojs(videoRef.current, videoJsOptions, function() {
      setIsLoading(false);
      
      // Custom autoplay with muted state to bypass browser restrictions
      if (autoPlay) {
        player.muted(true);
        const playPromise = player.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Autoplay started successfully
              console.log("Autoplay started successfully");
            })
            .catch((error: any) => {
              console.error("Autoplay prevented:", error);
              // Show a clear message to the user
              toast("Click to start playback", {
                action: {
                  label: "Play",
                  onClick: () => player.play()
                }
              });
            });
        }
      }
    });
    
    playerRef.current = player;
    
    player.on('play', () => {
      // Track activity after 15 seconds of playing
      setTimeout(() => {
        if (userId && !player.paused()) {
          trackStreamingActivity(contentId, userId, Math.floor(player.currentTime()), episodeId);
        }
      }, 15000);
    });
    
    player.on('timeupdate', () => {
      // Track every 15 seconds
      const currentTime = Math.floor(player.currentTime());
      if (currentTime % 15 === 0 && userId && !player.paused()) {
        trackStreamingActivity(contentId, userId, currentTime, episodeId);
      }
    });
    
    player.on('ended', () => {
      if (onEnded) onEnded();
      if (userId) {
        markContentAsComplete(contentId, userId, episodeId);
      }
    });
    
    player.on('error', () => {
      setError("Error loading video. Please try another source or try again later.");
      setIsLoading(false);
      toast.error("Error loading video. Please try another source.");
    });
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);
  
  // Handle video source change
  useEffect(() => {
    if (playerRef.current && videoRef.current) {
      setIsLoading(true);
      setError(null);
      
      playerRef.current.src({
        src: src,
        type: 'video/mp4',
      });
      
      playerRef.current.poster(poster || '');
      
      // Attempt to play if autoplay is enabled
      if (autoPlay) {
        try {
          playerRef.current.muted(true);
          const playPromise = playerRef.current.play();
          
          if (playPromise !== undefined && typeof playPromise === 'object' && typeof playPromise.catch === 'function') {
            playPromise
              .then(() => {
                // Optional: Show unmute button to user
                toast("Video playing (muted). Click to unmute", {
                  action: {
                    label: "Unmute",
                    onClick: () => {
                      playerRef.current.muted(false);
                      setIsMuted(false);
                    }
                  }
                });
              })
              .catch((error: any) => {
                console.error("Autoplay blocked:", error);
                toast("Click to start playback", {
                  action: {
                    label: "Play",
                    onClick: () => playerRef.current.play()
                  }
                });
              });
          }
        } catch (error) {
          console.error("Error attempting to autoplay:", error);
        }
      }
      
      setIsLoading(false);
    }
  }, [src, poster, autoPlay]);
  
  // Recording functionality
  const toggleRecording = () => {
    if (!videoRef.current) return;
    
    if (!isRecording) {
      try {
        import('@/utils/streamingUtils').then(module => {
          module.startRecording().then(stream => {
            if (stream) {
              setStopRecordingFn(() => () => {
                stream.getTracks().forEach(track => track.stop());
                toast.success("Recording saved");
              });
              setIsRecording(true);
              toast.success("Recording started");
            }
          });
        });
      } catch (error) {
        console.error("Recording error:", error);
        toast.error("Failed to start recording");
      }
    } else if (stopRecordingFn) {
      stopRecordingFn();
      setIsRecording(false);
      setStopRecordingFn(null);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (!videoRef.current) return;
    
    const a = document.createElement('a');
    a.href = videoRef.current.src;
    a.download = `${title || 'video'}.mp4`;
    a.click();
    
    toast.success(`Starting download: ${title || 'video'}.mp4`);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden w-full aspect-video"
    >
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-4 text-center">
          <span className="text-red-500 mb-2">{error}</span>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                if (playerRef.current) {
                  playerRef.current.load();
                }
              }}
            >
              Try Again
            </Button>
            <StreamingProviderSelector
              providers={availableProviders}
              activeProvider={activeProvider}
              contentType={contentType}
              onProviderChange={onProviderChange}
            />
          </div>
        </div>
      )}
      
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-fantasy"
          playsInline
          crossOrigin="anonymous"
        />
      </div>
      
      {/* Custom Controls (shown outside the player UI) */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          onClick={toggleRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <Video size={18} className={isRecording ? "text-red-500" : "text-white"} />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          onClick={handleDownload}
          title="Download Video"
        >
          <Download size={18} className="text-white" />
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayerVideoJS;

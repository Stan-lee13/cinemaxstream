
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
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecordingFn, setStopRecordingFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  // Initialize Video.js
  useEffect(() => {
    // Make sure we have both the wrapper div and VideoJS loaded
    if (!videoRef.current || !videojs) {
      console.error("Missing required refs or videojs");
      return;
    }
    
    // Cleanup previous player instance
    if (playerRef.current) {
      try {
        playerRef.current.dispose();
        playerRef.current = null;
      } catch (e) {
        console.error("Error disposing previous player:", e);
      }
    }
    
    // Create a div for videojs to attach to
    const videoElement = document.createElement('video');
    videoElement.className = 'video-js vjs-big-play-centered';
    videoElement.setAttribute('playsinline', '');
    
    // Make sure any old elements are removed
    while (videoRef.current.firstChild) {
      videoRef.current.removeChild(videoRef.current.firstChild);
    }
    
    // Append the new video element
    videoRef.current.appendChild(videoElement);
    
    try {
      const videoJsOptions = {
        autoplay: false, // We'll handle autoplay manually
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: src,
          type: 'video/mp4',
        }],
        poster: poster || '',
        muted: true, // Start muted to enable autoplay
        playsinline: true,
      };
      
      // Initialize player
      const player = videojs(videoElement, videoJsOptions);
      playerRef.current = player;
      
      // Setup event handlers
      player.ready(() => {
        console.log('Player is ready');
        setIsLoading(false);
        
        // Handle autoplay with muted state to bypass restrictions
        if (autoPlay) {
          player.muted(true);
          setIsMuted(true);
          
          setTimeout(() => {
            try {
              const playPromise = player.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("Autoplay started successfully");
                    // Show unmute button
                    toast("Video playing (muted). Click to unmute", {
                      action: {
                        label: "Unmute",
                        onClick: () => {
                          player.muted(false);
                          setIsMuted(false);
                        }
                      }
                    });
                  })
                  .catch((error: any) => {
                    console.error("Autoplay prevented:", error);
                    toast("Click to start playback", {
                      action: {
                        label: "Play",
                        onClick: () => player.play()
                      }
                    });
                  });
              }
            } catch (error) {
              console.error("Error attempting to autoplay:", error);
            }
          }, 100);
        }
      });
      
      player.on('error', () => {
        console.error('Video.js error:', player.error());
        setError("Error loading video. Please try another source or try again later.");
        setIsLoading(false);
        toast.error("Error loading video. Please try another source.");
      });
      
      player.on('play', () => {
        // Track activity after a few seconds of playing
        setTimeout(() => {
          if (userId && player && !player.paused()) {
            trackStreamingActivity(contentId, userId, Math.floor(player.currentTime()), episodeId);
          }
        }, 15000);
      });
      
      player.on('timeupdate', () => {
        // Track every 15 seconds
        const currentTime = Math.floor(player.currentTime());
        if (currentTime % 15 === 0 && currentTime > 0 && userId && !player.paused()) {
          trackStreamingActivity(contentId, userId, currentTime, episodeId);
        }
      });
      
      player.on('ended', () => {
        if (onEnded) onEnded();
        if (userId) {
          markContentAsComplete(contentId, userId, episodeId);
        }
      });
      
    } catch (error) {
      console.error("Error initializing Video.js:", error);
      setError("Failed to initialize video player");
      setIsLoading(false);
    }
    
    // Cleanup
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (e) {
          console.error("Error disposing player:", e);
        }
      }
    };
  }, []);
  
  // Handle video source change
  useEffect(() => {
    if (playerRef.current) {
      setIsLoading(true);
      setError(null);
      
      try {
        playerRef.current.src([{
          src: src,
          type: 'video/mp4',
        }]);
        
        playerRef.current.poster(poster || '');
        
        // Attempt to play if autoplay is enabled
        if (autoPlay) {
          try {
            playerRef.current.muted(true);
            setIsMuted(true);
            
            setTimeout(() => {
              const playPromise = playerRef.current.play();
              
              if (playPromise !== undefined && typeof playPromise.then === 'function') {
                playPromise
                  .then(() => {
                    console.log("Source change autoplay successful");
                  })
                  .catch((error: any) => {
                    console.error("Source change autoplay prevented:", error);
                    toast("Click to play video", {
                      action: {
                        label: "Play",
                        onClick: () => playerRef.current?.play()
                      }
                    });
                  });
              }
            }, 100);
          } catch (error) {
            console.error("Error attempting to play after source change:", error);
          }
        }
        
      } catch (error) {
        console.error("Error changing video source:", error);
        setError("Failed to load new video source");
      } finally {
        setIsLoading(false);
      }
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
    if (playerRef.current) {
      const a = document.createElement('a');
      a.href = playerRef.current.currentSrc();
      a.download = `${title || 'video'}.mp4`;
      a.click();
      
      toast.success(`Starting download: ${title || 'video'}.mp4`);
    }
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
      
      <div ref={videoRef} data-vjs-player></div>
      
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

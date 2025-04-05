
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Video } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";
import { toast } from "sonner";
import StreamingProviderSelector from "./StreamingProviderSelector";
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
  const [playerInitialized, setPlayerInitialized] = useState(false);
  
  // Initialize Video.js
  useEffect(() => {
    // Dynamically import video.js to prevent SSR issues
    const setupPlayer = async () => {
      try {
        const videojs = (await import('video.js')).default;
        
        // Make sure we have the videoRef
        if (!videoRef.current) {
          console.error("Video ref is not available");
          return;
        }

        // Clean up any previous player instance
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
        
        // Clear any children from the container
        while (videoRef.current.firstChild) {
          videoRef.current.removeChild(videoRef.current.firstChild);
        }
        
        // Create a new video element
        const videoElement = document.createElement('video');
        videoElement.className = 'video-js vjs-big-play-centered';
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('controls', '');
        
        // Append video element to the container
        videoRef.current.appendChild(videoElement);
        
        // Configure videojs
        const videoJsOptions = {
          autoplay: false,
          controls: true,
          responsive: true,
          fluid: true,
          sources: [{
            src: src,
            type: 'video/mp4',
          }],
          poster: poster || '',
          muted: true,
          playsinline: true,
          html5: {
            nativeControlsForTouch: false,
            nativeAudioTracks: false,
            nativeVideoTracks: false
          }
        };
        
        // Initialize player
        const player = videojs(videoElement, videoJsOptions);
        playerRef.current = player;
        
        // Setup event handlers after player is ready
        player.ready(() => {
          console.log('Player is ready');
          setIsLoading(false);
          setPlayerInitialized(true);
          
          // Auto play logic
          if (autoPlay) {
            // Mute player to help with autoplay policies
            player.muted(true);
            setIsMuted(true);
            
            setTimeout(() => {
              player.play()
                .then(() => {
                  console.log("Autoplay started successfully");
                  toast("Video playing (muted). Click to unmute", {
                    action: {
                      label: "Unmute",
                      onClick: () => {
                        if (playerRef.current) {
                          playerRef.current.muted(false);
                          setIsMuted(false);
                        }
                      }
                    }
                  });
                })
                .catch((error: any) => {
                  console.error("Autoplay prevented:", error);
                  toast("Click to start playback", {
                    action: {
                      label: "Play",
                      onClick: () => {
                        if (playerRef.current) {
                          playerRef.current.play();
                        }
                      }
                    }
                  });
                });
            }, 100);
          }
        });
        
        // Error handling
        player.on('error', () => {
          console.error('Video.js error:', player.error());
          setError("Error loading video. Please try another source.");
          setIsLoading(false);
        });
        
        // Track playback
        player.on('play', () => {
          setTimeout(() => {
            if (userId && playerRef.current && !playerRef.current.paused()) {
              trackStreamingActivity(contentId, userId, Math.floor(playerRef.current.currentTime()), episodeId);
            }
          }, 15000);
        });
        
        player.on('timeupdate', () => {
          if (!playerRef.current) return;
          
          const currentTime = Math.floor(playerRef.current.currentTime());
          if (currentTime % 15 === 0 && currentTime > 0 && userId && !playerRef.current.paused()) {
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
    };
    
    setupPlayer();
    
    // Cleanup function
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
  
  // Handle source updates
  useEffect(() => {
    if (!playerRef.current || !playerInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      playerRef.current.src([{
        src: src,
        type: 'video/mp4',
      }]);
      
      if (poster) {
        playerRef.current.poster(poster);
      }
      
      // Reset player state
      playerRef.current.load();
      
      // Try to autoplay with the new source
      if (autoPlay) {
        playerRef.current.muted(true);
        setIsMuted(true);
        
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.play()
              .then(() => {
                console.log("Source change autoplay successful");
              })
              .catch((error: any) => {
                console.error("Source change autoplay prevented:", error);
                toast.info("Click play to start video");
              });
          }
        }, 100);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating video source:", error);
      setError("Failed to update video source");
      setIsLoading(false);
    }
  }, [src, poster, autoPlay, playerInitialized]);
  
  // Recording functionality
  const toggleRecording = () => {
    if (!videoRef.current) return;
    
    if (!isRecording) {
      try {
        import('@/utils/streamingUtils').then(module => {
          module.startRecording().then(stream => {
            if (stream) {
              const stopRecording = () => {
                stream.getTracks().forEach(track => track.stop());
                toast.success("Recording saved");
              };
              
              setStopRecordingFn(() => stopRecording);
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
      const currentSource = playerRef.current.currentSrc();
      if (currentSource) {
        const a = document.createElement('a');
        a.href = currentSource;
        a.download = `${title || 'video'}.mp4`;
        a.click();
        
        toast.success(`Starting download: ${title || 'video'}.mp4`);
      } else {
        toast.error("No video source available to download");
      }
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
      
      <div ref={videoRef} className="video-container" data-vjs-player></div>
      
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

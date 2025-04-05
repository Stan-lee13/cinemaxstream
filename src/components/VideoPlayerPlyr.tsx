
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Video } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";
import { toast } from "sonner";
import 'plyr/dist/plyr.css';
import StreamingProviderSelector from "./StreamingProviderSelector";

interface VideoPlayerPlyrProps {
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

const VideoPlayerPlyr: React.FC<VideoPlayerPlyrProps> = ({ 
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
  const [playerInitialized, setPlayerInitialized] = useState(false);
  
  // Initialize Plyr
  useEffect(() => {
    let plyr: any;
    
    const initPlyr = async () => {
      try {
        const Plyr = (await import('plyr')).default;
        
        if (!videoRef.current) {
          console.error("Video element ref is not available");
          return;
        }
        
        // Destroy existing player if it exists
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        
        // Create a new Plyr instance
        plyr = new Plyr(videoRef.current, {
          controls: [
            'play-large', 'play', 'progress', 'current-time', 'mute',
            'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
          ],
          seekTime: 10,
          keyboard: { focused: true, global: false },
          tooltips: { controls: true, seek: true },
          captions: { active: true, language: 'auto' },
          autoplay: false
        });
        
        playerRef.current = plyr;
        
        plyr.on('ready', () => {
          setIsLoading(false);
          setPlayerInitialized(true);
          
          // Try to autoplay after the player is ready
          if (autoPlay) {
            // Set volume to 0 initially to help with autoplay policies
            plyr.muted = true;
            
            // Small delay to ensure everything is set up
            setTimeout(() => {
              try {
                const playPromise = plyr.play();
                
                if (playPromise !== undefined) {
                  playPromise.then(() => {
                    console.log("Autoplay started successfully");
                    toast("Video playing (muted). Click to unmute", {
                      action: {
                        label: "Unmute",
                        onClick: () => {
                          if (playerRef.current) {
                            playerRef.current.muted = false;
                          }
                        }
                      }
                    });
                  }).catch((error: any) => {
                    console.error("Autoplay prevented:", error);
                    toast.info("Click play to start playback", {
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
                }
              } catch (error) {
                console.error("Error during autoplay:", error);
              }
            }, 100);
          }
        });
        
        plyr.on('play', () => {
          // Track activity after 15 seconds of playing
          setTimeout(() => {
            if (userId && plyr && !plyr.paused) {
              trackStreamingActivity(contentId, userId, Math.floor(plyr.currentTime), episodeId);
            }
          }, 15000);
        });
        
        plyr.on('timeupdate', () => {
          // Track every 15 seconds
          if (plyr && Math.floor(plyr.currentTime) % 15 === 0 && userId && !plyr.paused) {
            trackStreamingActivity(contentId, userId, Math.floor(plyr.currentTime), episodeId);
          }
        });
        
        plyr.on('ended', () => {
          if (onEnded) onEnded();
          if (userId) {
            markContentAsComplete(contentId, userId, episodeId);
          }
        });
        
        plyr.on('error', () => {
          setError("Error loading video. Please try another source or try again later.");
          setIsLoading(false);
          toast.error("Error loading video. Please try another source.");
        });
      } catch (err) {
        console.error("Error initializing Plyr:", err);
        setError("Failed to initialize video player");
        setIsLoading(false);
      }
    };
    
    initPlyr();
    
    // Cleanup function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error("Error destroying Plyr:", e);
        }
      }
    };
  }, []);
  
  // Handle video source change
  useEffect(() => {
    if (!videoRef.current || !playerInitialized || !playerRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update the video source
      if (videoRef.current) {
        videoRef.current.src = src;
        
        if (poster) {
          videoRef.current.poster = poster;
        }
        
        // Load the new source
        videoRef.current.load();
        
        if (playerRef.current) {
          // Force Plyr to recognize the new source
          playerRef.current.source = {
            type: 'video',
            sources: [{
              src: src,
              type: 'video/mp4',
            }]
          };
        }
        
        // Attempt to play if autoplay is enabled
        if (autoPlay && playerRef.current) {
          // Set muted to help with autoplay policies
          if (playerRef.current.muted !== undefined) {
            playerRef.current.muted = true;
          }
          
          setTimeout(() => {
            if (playerRef.current) {
              try {
                const playPromise = playerRef.current.play();
                
                if (playPromise !== undefined && typeof playPromise.then === 'function') {
                  playPromise.then(() => {
                    console.log("Source change autoplay successful");
                  }).catch((error: any) => {
                    console.error("Source change autoplay prevented:", error);
                    toast.info("Click play to start video");
                  });
                }
              } catch (error) {
                console.error("Error during source change autoplay:", error);
              }
            }
          }, 100);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating video source:", error);
      setError("Failed to load video");
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
    if (videoRef.current && videoRef.current.src) {
      const a = document.createElement('a');
      a.href = videoRef.current.src;
      a.download = `${title || 'video'}.mp4`;
      a.click();
      
      toast.success(`Starting download: ${title || 'video'}.mp4`);
    } else {
      toast.error("No video source available to download");
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
                if (videoRef.current) {
                  setError(null);
                  videoRef.current.load();
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
      
      <video
        ref={videoRef}
        className="plyr-react plyr w-full h-full"
        crossOrigin="anonymous"
        poster={poster}
        playsInline
        controls
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom Controls (shown outside the Plyr UI) */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20 opacity-0 hover:opacity-100 transition-opacity">
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

export default VideoPlayerPlyr;

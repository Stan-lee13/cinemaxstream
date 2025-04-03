
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Download, Video } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete, startRecording } from "@/utils/videoUtils";
import { toast } from "sonner";
import Plyr from 'plyr';
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
  const playerRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stopRecordingFn, setStopRecordingFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize Plyr
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    
    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'mute', 
        'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      seekTime: 10,
      keyboard: { focused: true, global: false },
      tooltips: { controls: true, seek: true },
      captions: { active: true, language: 'auto' },
      autoplay: autoPlay
    });
    
    playerRef.current = player;
    
    // Set up event listeners
    player.on('ready', () => {
      setIsLoading(false);
    });
    
    player.on('play', () => {
      // Track activity after 15 seconds of playing
      setTimeout(() => {
        if (userId && player.playing) {
          trackStreamingActivity(contentId, userId, Math.floor(player.currentTime), episodeId);
        }
      }, 15000);
    });
    
    player.on('timeupdate', () => {
      // Track every 15 seconds
      if (Math.floor(player.currentTime) % 15 === 0 && userId && player.playing) {
        trackStreamingActivity(contentId, userId, Math.floor(player.currentTime), episodeId);
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
        playerRef.current.destroy();
      }
    };
  }, [src, contentId, userId, episodeId, onEnded, autoPlay]);
  
  // Handle video source change
  useEffect(() => {
    if (playerRef.current && videoRef.current) {
      setIsLoading(true);
      setError(null);
      
      // Update the video source
      videoRef.current.src = src;
      
      // Load and play the new source
      playerRef.current.source = {
        type: 'video',
        sources: [
          {
            src: src,
            type: 'video/mp4',
          },
        ],
        poster: poster,
      };
      
      // Attempt to play if autoplay is enabled
      if (autoPlay) {
        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            toast.error("Autoplay blocked. Please interact with the player to enable playback.");
          });
        }
      }
    }
  }, [src, poster, autoPlay]);
  
  // Start/stop recording
  const toggleRecording = () => {
    if (!videoRef.current) return;
    
    if (!isRecording) {
      const stopFn = startRecording(videoRef.current, `${title || 'video'}-recording`);
      setStopRecordingFn(() => stopFn);
      setIsRecording(true);
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
      />
      
      {/* Custom Controls (shown outside the Plyr UI) */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
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

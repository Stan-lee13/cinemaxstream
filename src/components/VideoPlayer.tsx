import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";
import { toast } from "sonner";

interface VideoPlayerProps {
  src: string;
  contentId: string;
  userId?: string;
  episodeId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  poster?: string;
  onError?: () => void;
  onLoaded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  contentId, 
  userId,
  episodeId,
  autoPlay = false,
  onEnded,
  poster,
  onError,
  onLoaded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set up event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Track every 15 seconds
      if (Math.floor(video.currentTime) % 15 === 0 && userId) {
        trackStreamingActivity(contentId, userId, Math.floor(video.currentTime), episodeId);
      }
    };
    
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };
    
    const onVideoEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
      if (userId) {
        markContentAsComplete(contentId, userId, episodeId);
      }
    };

    const onErrorHandler = () => {
      setError("Error loading video. Please try again later.");
      setIsLoading(false);
      if (onError) onError();
      toast.error("Error loading video. Please try again later.");
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setError(null);
    };
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('error', onErrorHandler);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    
    // Start loading
    video.load();
    
    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onVideoEnded);
      video.removeEventListener('error', onErrorHandler);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, [contentId, userId, episodeId, onEnded, src, onError, onLoaded]);
  
  // Controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Auto-play started
          })
          .catch(error => {
            // Auto-play was prevented
            toast.error("Playback was blocked by your browser. Please interact with the player first.");
          });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };
  
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const toggleFullScreen = () => {
    if (!playerRef.current) return;
    
    if (!isFullScreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullScreen(!isFullScreen);
  };
  
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };
  
  // Format time (seconds -> MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div 
      ref={playerRef}
      className="relative group bg-black rounded-lg overflow-hidden w-full aspect-video"
    >
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinemax-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-4 text-center">
          <span className="text-red-500 mb-2">{error}</span>
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
        </div>
      )}
      
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
      />
      
      {/* Video Controls */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4">
        {/* Top Controls */}
        <div className="flex justify-end">
          {/* Any top controls can go here */}
        </div>
        
        {/* Center Controls */}
        <div className="flex justify-center items-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={skipBackward}
          >
            <SkipBack size={24} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={skipForward}
          >
            <SkipForward size={24} />
          </Button>
        </div>
        
        {/* Bottom Controls */}
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={seek}
              className="flex-grow h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cinemax-500 [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>
          
          {/* Additional controls */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-transparent hover:bg-white/10 text-white"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-transparent hover:bg-white/10 text-white"
              onClick={toggleFullScreen}
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

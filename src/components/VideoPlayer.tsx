
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";
import { trackStreamingActivity, markContentAsComplete } from "@/utils/videoUtils";

interface VideoPlayerProps {
  src: string;
  contentId: string;
  userId?: string;
  episodeId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  contentId, 
  userId,
  episodeId,
  autoPlay = false,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set up event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Track every 15 seconds
      if (Math.floor(video.currentTime) % 15 === 0) {
        trackStreamingActivity(contentId, userId, Math.floor(video.currentTime), episodeId);
      }
    };
    
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const onVideoEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
      markContentAsComplete(contentId, userId, episodeId);
    };
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onVideoEnded);
    
    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onVideoEnded);
    };
  }, [contentId, userId, episodeId, onEnded]);
  
  // Controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
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
      <video
        ref={videoRef}
        src={src}
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

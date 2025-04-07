
import { useState, useEffect, useRef } from 'react';

interface VideoControlsOptions {
  enablePip?: boolean;
  enableLandscape?: boolean;
  autoEnterLandscape?: boolean;
}

// Define a more specific type for screen orientation
interface ScreenOrientationExtended extends ScreenOrientation {
  lock: (orientation: string) => Promise<void>;
  unlock: () => void;
}

export const useVideoControls = (options: VideoControlsOptions = {}) => {
  const {
    enablePip = true,
    enableLandscape = true,
    autoEnterLandscape = false
  } = options;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Check if device supports fullscreen
  const fullscreenSupported = typeof document !== 'undefined' && 
    (document.documentElement.requestFullscreen || 
    (document.documentElement as any).webkitRequestFullscreen);
  
  // Check if device supports PiP
  const pipSupported = typeof document !== 'undefined' && 
    document.pictureInPictureEnabled &&
    enablePip;
  
  // Check if device can rotate to landscape
  const landscapeSupported = typeof window !== 'undefined' && 
    typeof window.screen !== 'undefined' && 
    typeof window.screen.orientation !== 'undefined' &&
    'lock' in window.screen.orientation &&
    enableLandscape;
  
  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };
  
  // Toggle Picture-in-Picture mode
  const togglePictureInPicture = async () => {
    if (!videoRef.current || !pipSupported) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (error) {
      console.error('Error toggling picture-in-picture:', error);
    }
  };
  
  // Toggle landscape mode
  const toggleLandscape = async () => {
    if (!landscapeSupported) return;
    
    try {
      if (window.screen.orientation.type.includes('landscape')) {
        await (window.screen.orientation as ScreenOrientationExtended).lock('portrait');
        setIsLandscape(false);
      } else {
        await (window.screen.orientation as ScreenOrientationExtended).lock('landscape-primary');
        setIsLandscape(true);
      }
    } catch (error) {
      console.error('Error toggling landscape mode:', error);
    }
  };
  
  // Effect to handle autoEnterLandscape
  useEffect(() => {
    if (autoEnterLandscape && landscapeSupported) {
      (window.screen.orientation as ScreenOrientationExtended).lock('landscape-primary')
        .then(() => setIsLandscape(true))
        .catch(err => console.error('Failed to enter landscape mode:', err));
    }
    
    return () => {
      // Reset orientation when component unmounts
      if (landscapeSupported && isLandscape) {
        (window.screen.orientation as ScreenOrientationExtended).unlock();
      }
      
      // Exit PiP when component unmounts
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(err => {
          console.error('Failed to exit picture-in-picture mode:', err);
        });
      }
    };
  }, [autoEnterLandscape, landscapeSupported, isLandscape]);
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Listen for PiP changes
  useEffect(() => {
    const handlePipChange = () => {
      setIsPipActive(!!document.pictureInPictureElement);
    };
    
    if (pipSupported) {
      document.addEventListener('enterpictureinpicture', handlePipChange);
      document.addEventListener('leavepictureinpicture', handlePipChange);
    }
    
    return () => {
      if (pipSupported) {
        document.removeEventListener('enterpictureinpicture', handlePipChange);
        document.removeEventListener('leavepictureinpicture', handlePipChange);
      }
    };
  }, [pipSupported]);
  
  return {
    videoRef,
    containerRef,
    isFullscreen,
    isLandscape,
    isPipActive,
    toggleFullscreen,
    togglePictureInPicture,
    toggleLandscape,
    fullscreenSupported,
    pipSupported,
    landscapeSupported
  };
};

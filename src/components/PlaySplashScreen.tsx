
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaySplashScreenProps {
  isShowing: boolean;
  onAnimationComplete?: () => void;
  contentTitle?: string;
}

const PlaySplashScreen = ({ 
  isShowing,
  onAnimationComplete,
  contentTitle 
}: PlaySplashScreenProps) => {
  const [showLogo, setShowLogo] = useState(true);
  const [showTitle, setShowTitle] = useState(false);
  
  useEffect(() => {
    if (isShowing) {
      // Show title after logo animation
      const titleTimer = setTimeout(() => {
        setShowTitle(true);
      }, 1200);
      
      // Callback after animation completes
      const completeTimer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 3000);
      
      return () => {
        clearTimeout(titleTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setShowLogo(false);
      setShowTitle(false);
    }
  }, [isShowing, onAnimationComplete]);
  
  if (!isShowing) return null;
  
  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Neon glow background effect */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500" />
          </div>
          
          {/* Logo Animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring" }}
            onAnimationComplete={() => {
              setTimeout(() => setShowLogo(false), 1800);
            }}
          >
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  className="flex flex-col items-center justify-center"
                  exit={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="h-24 w-24 rounded-full bg-cinemax-500 flex items-center justify-center shadow-[0_0_20px_5px_rgba(239,68,68,0.5)]">
                    <div className="text-5xl text-white transform translate-x-1">▶</div>
                  </div>
                  <motion.div 
                    className="mt-6 text-2xl font-bold tracking-wider text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    CINEMAX STREAM
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Title Animation */}
          <AnimatePresence>
            {showTitle && contentTitle && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <p className="text-lg text-gray-300 mb-3">Now Playing</p>
                  <h2 className="text-4xl md:text-6xl font-bold text-white 
                    bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent
                    drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  >
                    {contentTitle}
                  </h2>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaySplashScreen;

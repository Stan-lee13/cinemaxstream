
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  image?: string;
  highlight?: string; // CSS selector to highlight
}

const OnboardingTutorial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage('has-seen-tutorial', false);
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to CinemaxStream",
      content: (
        <div>
          <p className="text-gray-300">
            Your premium streaming platform for the latest movies, TV shows, anime, and more. 
            This quick tutorial will help you get started.
          </p>
        </div>
      ),
      image: "/img/welcome.png"
    },
    {
      title: "Finding Content",
      content: (
        <div>
          <p className="text-gray-300">
            Use the navigation menu to browse movies, TV series, anime, and more. 
            You can also search for specific titles using the search bar at the top.
          </p>
        </div>
      ),
      highlight: ".navbar .search-container"
    },
    {
      title: "Streaming Providers",
      content: (
        <div>
          <p className="text-gray-300">
            Choose from multiple streaming sources for each content.
            You can switch between providers if one isn't working for you.
          </p>
        </div>
      ),
      highlight: ".streaming-providers-container"
    },
    {
      title: "Video Controls",
      content: (
        <div>
          <p className="text-gray-300">
            Enjoy features like picture-in-picture, fullscreen, and landscape mode.
            The player also remembers where you left off watching.
          </p>
        </div>
      ),
    },
    {
      title: "All Set!",
      content: (
        <div>
          <p className="text-gray-300">
            You're all set to enjoy streaming! If you need help at any time, 
            check the Help Center in the footer or use our AI Assistant.
          </p>
        </div>
      ),
    }
  ];

  // Show tutorial for new users
  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setHasSeenTutorial(true);
    setIsVisible(false);
  };

  // Apply highlight effect
  useEffect(() => {
    const currentHighlight = tutorialSteps[currentStep]?.highlight;
    if (currentHighlight) {
      const element = document.querySelector(currentHighlight);
      if (element) {
        element.classList.add('tutorial-highlight');
      }
      
      return () => {
        if (element) {
          element.classList.remove('tutorial-highlight');
        }
      };
    }
  }, [currentStep, tutorialSteps]);

  if (!isVisible) return null;

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div 
            className="absolute inset-0"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-700 shadow-xl w-full max-w-md mx-4 relative z-50 overflow-hidden"
          >
            <Button 
              variant="ghost" 
              className="absolute top-2 right-2 rounded-full h-8 w-8 p-0" 
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-800">
              <motion.div 
                className="h-full bg-cinemax-500"
                initial={{ width: `${(currentStep / tutorialSteps.length) * 100}%` }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {currentTutorialStep.image && (
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={currentTutorialStep.image} 
                  alt={currentTutorialStep.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">{currentTutorialStep.title}</h3>
              <div className="text-sm">{currentTutorialStep.content}</div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex space-x-1">
                  {tutorialSteps.map((_, index) => (
                    <div 
                      key={index} 
                      className={`rounded-full h-1.5 w-8 ${
                        index === currentStep ? 'bg-cinemax-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  {currentStep > 0 && (
                    <Button variant="ghost" size="sm" onClick={handlePrev}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                  )}
                  <Button onClick={handleNext}>
                    {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTutorial;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { 
  Play, 
  Search, 
  Heart, 
  Download, 
  Settings, 
  Bell, 
  User, 
  Home,
  ChevronRight,
  ChevronLeft,
  X,
  Check
} from 'lucide-react';

interface WalkthroughStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tourId?: string;
  mobileDescription?: string;
}

const desktopSteps: WalkthroughStep[] = [
  {
    title: 'Welcome to CinemaxStream!',
    description: 'Let us show you around. This quick tour will help you discover all the features available.',
    icon: <Home className="h-12 w-12 text-cinemax-500" />,
  },
  {
    title: 'Browse Content',
    description: 'Use the navigation bar at the top to browse Movies, Series, Anime, and more. Click on any content card to view details.',
    icon: <Play className="h-12 w-12 text-cinemax-500" />,
    tourId: 'nav-bar'
  },
  {
    title: 'Search',
    description: 'Use the search bar in the navigation to find any movie or TV show. Just start typing and results will appear instantly.',
    icon: <Search className="h-12 w-12 text-cinemax-500" />,
    tourId: 'search-bar'
  },
  {
    title: 'Favorites & Watchlist',
    description: 'Click the heart icon on any content to add it to your favorites. Access your saved content from the Favorites page.',
    icon: <Heart className="h-12 w-12 text-cinemax-500" />,
    tourId: 'favorites-button'
  },
  {
    title: 'Downloads',
    description: 'Download movies and episodes for offline viewing. For series, you can download individual episodes.',
    icon: <Download className="h-12 w-12 text-cinemax-500" />,
    tourId: 'download-button'
  },
  {
    title: 'Video Playback',
    description: 'When watching, use the provider selector above the video to switch between different streaming sources if one is not working.',
    icon: <Play className="h-12 w-12 text-cinemax-500" />,
    tourId: 'provider-selector'
  },
  {
    title: 'Notifications',
    description: 'Click the bell icon to see new releases and recommendations. Enable notifications to never miss new content.',
    icon: <Bell className="h-12 w-12 text-cinemax-500" />,
    tourId: 'notifications-button'
  },
  {
    title: 'Your Profile',
    description: 'Access your profile to manage settings, billing, security, and app preferences. Click your avatar in the top right.',
    icon: <User className="h-12 w-12 text-cinemax-500" />,
    tourId: 'profile-button'
  },
];

const mobileSteps: WalkthroughStep[] = [
  {
    title: 'Welcome to CinemaxStream!',
    description: 'Let us show you around. Swipe through this quick tour to learn the basics.',
    icon: <Home className="h-12 w-12 text-cinemax-500" />,
  },
  {
    title: 'Navigation',
    description: 'Tap the menu icon (☰) at the top to access all categories. Scroll horizontally through content rows to discover more.',
    icon: <Play className="h-12 w-12 text-cinemax-500" />,
    tourId: 'nav-bar'
  },
  {
    title: 'Search',
    description: 'Tap the search icon at the top to find any movie or show. Type your query and results appear instantly.',
    icon: <Search className="h-12 w-12 text-cinemax-500" />,
    tourId: 'search-bar'
  },
  {
    title: 'Favorites',
    description: 'Tap the heart on any content to save it. Access your favorites from the menu or bottom navigation.',
    icon: <Heart className="h-12 w-12 text-cinemax-500" />,
    tourId: 'favorites-button'
  },
  {
    title: 'Downloads',
    description: 'Tap the download button on any movie or episode. Downloaded content is available offline.',
    icon: <Download className="h-12 w-12 text-cinemax-500" />,
    tourId: 'download-button'
  },
  {
    title: 'Switch Providers',
    description: 'If a video does not play, use the source selector above the player to try a different streaming provider.',
    icon: <Play className="h-12 w-12 text-cinemax-500" />,
    tourId: 'provider-selector'
  },
  {
    title: 'Notifications',
    description: 'Tap the bell icon for new releases. Enable push notifications in settings to get alerts.',
    icon: <Bell className="h-12 w-12 text-cinemax-500" />,
    tourId: 'notifications-button'
  },
  {
    title: 'Your Account',
    description: 'Tap your profile icon to access settings, billing, downloads, and more.',
    icon: <User className="h-12 w-12 text-cinemax-500" />,
    tourId: 'profile-button'
  },
];

interface WalkthroughProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

const Walkthrough = ({ forceShow = false, onComplete }: WalkthroughProps) => {
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useLocalStorage<boolean>('walkthrough-completed', false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const steps = isMobile ? mobileSteps : desktopSteps;

  // Only show walkthrough to authenticated users on non-landing pages
  useEffect(() => {
    // Don't show on landing page (/) even if authenticated
    if (location.pathname === '/') {
      return;
    }
    
    if ((forceShow || !hasSeenWalkthrough) && isAuthenticated && user) {
      // Small delay to let the app load first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow, hasSeenWalkthrough, isAuthenticated, user, location.pathname]);

  // Handle spotlight effect for tour elements
  useEffect(() => {
    if (!isOpen || currentStep >= steps.length) return;
    
    const tourId = steps[currentStep].tourId;
    if (!tourId) {
      setShowSpotlight(false);
      return;
    }
    
    // Find the element with the tour ID
    const element = document.querySelector(`[data-tour-id="${tourId}"]`);
    if (!element) {
      setShowSpotlight(false);
      return;
    }
    
    // Position spotlight over the element
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (spotlightRef.current) {
      spotlightRef.current.style.width = `${rect.width}px`;
      spotlightRef.current.style.height = `${rect.height}px`;
      spotlightRef.current.style.left = `${rect.left}px`;
      spotlightRef.current.style.top = `${rect.top + scrollTop}px`;
      setShowSpotlight(true);
    }
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHasSeenWalkthrough(true);
    setIsOpen(false);
    setCurrentStep(0);
    setShowSpotlight(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setHasSeenWalkthrough(true);
    setIsOpen(false);
    setCurrentStep(0);
    setShowSpotlight(false);
    onComplete?.();
  };

  // Don't render if not authenticated or walkthrough already seen
  if (!isAuthenticated || (!forceShow && hasSeenWalkthrough)) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Spotlight overlay */}
      {showSpotlight && (
        <div 
          ref={spotlightRef}
          className="fixed z-50 border-4 border-cinemax-500 rounded-lg shadow-lg shadow-cinemax-500/50 pointer-events-none transition-all duration-300"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
          }}
        />
      )}
      
      {/* Walkthrough modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/70"
          onClick={handleSkip}
        />
        
        <div className="relative bg-background rounded-lg max-w-md w-full border border-border shadow-xl z-50">
          <div className="relative">
            {/* Progress indicator */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-cinemax-500' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>

            {/* Skip button */}
            <button
              className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors z-10"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="pt-12 pb-6 px-6 text-center">
              <div className="mb-6 flex justify-center">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-xl font-bold mb-3">
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>

              <button
                onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium bg-cinemax-500 hover:bg-cinemax-600 transition-colors"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Walkthrough;
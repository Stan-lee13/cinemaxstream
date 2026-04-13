/**
 * Interactive Guided Onboarding using intro.js
 * Device-aware steps that only target elements actually visible on screen.
 */

import { useCallback, useState } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';

const ONBOARDING_KEY = 'interactive-onboarding-completed';

interface OnboardingStep {
  title: string;
  intro: string;
  element?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const MOBILE_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to CineMax!',
    intro: 'Let\'s take a quick tour so you know where everything is.',
  },
  {
    element: '[data-tour-id="mobile-search"]',
    title: 'Search',
    intro: 'Tap here to search for any movie or TV show.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="notifications-button"]',
    title: 'Notifications',
    intro: 'New releases and updates appear here. Enable push notifications to stay informed.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="profile-button"]',
    title: 'Your Profile',
    intro: 'Access settings, downloads, and watch history here.',
    position: 'bottom',
  },
  {
    title: 'You\'re all set!',
    intro: 'Tap any movie or show to start watching. Use the bottom bar to navigate between sections. Enjoy!',
  },
];

const DESKTOP_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to CineMax!',
    intro: 'Let\'s give you a quick tour of the platform.',
  },
  {
    element: '[data-tour-id="nav-bar"]',
    title: 'Navigation',
    intro: 'Browse Movies, Series, Anime and more from the navigation bar.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="search-bar"]',
    title: 'Search',
    intro: 'Find any movie or TV show instantly — just start typing.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="notifications-button"]',
    title: 'Notifications',
    intro: 'Stay updated with new releases and recommendations. Enable push notifications for alerts even when the app is closed.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="favorites-button"]',
    title: 'Favorites',
    intro: 'Click the heart on any title to save it for later.',
    position: 'bottom',
  },
  {
    element: '[data-tour-id="profile-button"]',
    title: 'Your Profile',
    intro: 'Access your account settings, downloads, and preferences here.',
    position: 'left',
  },
  {
    title: 'You\'re all set!',
    intro: 'Start exploring! Click on any title to watch. You can switch between streaming sources if one doesn\'t work.',
  },
];

export function useInteractiveOnboarding() {
  const [completed, setCompleted] = useLocalStorage(ONBOARDING_KEY, false);
  const [isRunning, setIsRunning] = useState(false);
  const isMobile = useIsMobile();

  const startOnboarding = useCallback(() => {
    if (isRunning) return;

    setTimeout(() => {
      const rawSteps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;

      // Only keep steps whose target element actually exists in the DOM
      const validSteps = rawSteps
        .filter((step) => {
          if (!step.element) return true;
          return !!document.querySelector(step.element);
        })
        .map((step) => ({
          title: step.title,
          intro: step.intro,
          ...(step.element ? { element: step.element } : {}),
          ...(step.position ? { position: step.position } : {}),
        }));

      if (validSteps.length === 0) return;

      const intro = introJs();

      intro.setOptions({
        steps: validSteps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: true,
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 60,
        overlayOpacity: 0.82,
        doneLabel: 'Get Started',
        nextLabel: 'Next',
        prevLabel: 'Back',
        skipLabel: '✕',
        showStepNumbers: false,
        tooltipClass: 'cinemax-onboarding',
        highlightClass: 'cinemax-highlight',
      });

      intro.oncomplete(() => {
        setCompleted(true);
        setIsRunning(false);
      });

      intro.onexit(() => {
        setCompleted(true);
        setIsRunning(false);
      });

      setIsRunning(true);
      intro.start();
    }, 800);
  }, [isMobile, isRunning, setCompleted]);

  return {
    completed,
    isRunning,
    startOnboarding,
    resetOnboarding: () => setCompleted(false),
  };
}

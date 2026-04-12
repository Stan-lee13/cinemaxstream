/**
 * Interactive Guided Onboarding using intro.js
 * Highlights real UI elements, auto-scrolls, and provides step-by-step guidance.
 * Shows only on first visit or when triggered from settings.
 */

import { useCallback, useEffect, useState } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';

const ONBOARDING_KEY = 'interactive-onboarding-completed';

export function useInteractiveOnboarding() {
  const [completed, setCompleted] = useLocalStorage(ONBOARDING_KEY, false);
  const [isRunning, setIsRunning] = useState(false);
  const isMobile = useIsMobile();

  const steps = [
    {
      title: '👋 Welcome to CineMaxStream!',
      intro: 'Let us give you a quick interactive tour. We\'ll highlight each feature so you know exactly where everything is.',
    },
    {
      element: '[data-tour-id="nav-bar"]',
      title: '🎬 Navigation',
      intro: isMobile
        ? 'Tap the menu icon to browse Movies, Series, Anime and more.'
        : 'Use the navigation bar to browse Movies, Series, Anime and more categories.',
      position: 'bottom',
    },
    {
      element: '[data-tour-id="search-bar"], [data-tour-id="mobile-search"]',
      title: '🔍 Search',
      intro: 'Find any movie or TV show instantly. Just start typing!',
      position: 'bottom' as const,
    },
    {
      element: '[data-tour-id="notifications-button"]',
      title: '🔔 Notifications',
      intro: 'Stay updated with new releases, downloads and recommendations. Enable push notifications to get alerts even when the app is closed.',
      position: 'bottom',
    },
    {
      element: '[data-tour-id="favorites-button"]',
      title: '❤️ Favorites',
      intro: 'Tap the heart on any movie or show to save it to your favorites for quick access later.',
      position: 'bottom',
    },
    {
      element: '[data-tour-id="profile-button"]',
      title: '👤 Your Profile',
      intro: 'Access your account settings, downloads, watch history, and app preferences here.',
      position: 'left',
    },
    {
      title: '🎉 You\'re all set!',
      intro: 'Start exploring! Tap on any movie or show to watch it. You can switch between different streaming sources if one doesn\'t work. Enjoy! 🍿',
    },
  ];

  const startOnboarding = useCallback(() => {
    // Small delay to ensure DOM elements are rendered
    setTimeout(() => {
      const intro = introJs();

      // Filter steps to only include ones with existing elements
      const validSteps = steps.filter((step) => {
        if (!step.element) return true; // intro/outro steps always show
        // Handle comma-separated selectors
        const selectors = step.element.split(',').map((s) => s.trim());
        return selectors.some((sel) => document.querySelector(sel));
      }).map((step) => {
        // Resolve comma-separated selectors to the first match
        if (step.element) {
          const selectors = step.element.split(',').map((s) => s.trim());
          const found = selectors.find((sel) => document.querySelector(sel));
          return { ...step, element: found || step.element };
        }
        return step;
      });

      intro.setOptions({
        steps: validSteps,
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: true,
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 80,
        overlayOpacity: 0.7,
        doneLabel: 'Get Started 🚀',
        nextLabel: 'Next →',
        prevLabel: '← Back',
        skipLabel: 'Skip',
        showStepNumbers: false,
        tooltipClass: 'cinemax-intro-tooltip',
        highlightClass: 'cinemax-intro-highlight',
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
    }, 500);
  }, [setCompleted, steps, isMobile]);

  return {
    completed,
    isRunning,
    startOnboarding,
    resetOnboarding: () => setCompleted(false),
  };
}

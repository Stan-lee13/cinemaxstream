/**
 * Onboarding hook — drives the in-house <Walkthrough /> modal tour.
 * intro.js was removed because it overlapped the Walkthrough modal,
 * targeted DOM nodes that don't exist on mobile, and shipped a white
 * theme that clashed with the dark UI.
 */

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const WALKTHROUGH_KEY = 'walkthrough-completed';
const FORCE_KEY = 'walkthrough-force-show';

export function useInteractiveOnboarding() {
  const [completed, setCompleted] = useLocalStorage<boolean>(WALKTHROUGH_KEY, false);

  const startOnboarding = useCallback(() => {
    setCompleted(false);
    // Tell <Walkthrough /> to re-mount and show
    try {
      localStorage.setItem(FORCE_KEY, String(Date.now()));
      window.dispatchEvent(new Event('walkthrough:start'));
    } catch {
      /* ignore */
    }
  }, [setCompleted]);

  const resetOnboarding = useCallback(() => {
    setCompleted(false);
  }, [setCompleted]);

  return {
    completed,
    isRunning: false,
    startOnboarding,
    resetOnboarding,
  };
}

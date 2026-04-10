import { useState, useCallback, useEffect } from 'react';

const SEEN_KEY = 'hasSeenAdGuide';
const DISMISS_KEY = 'adGuideDismissedPermanently';
const LAST_SHOWN_KEY = 'adGuideLastShownAt';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useAdGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const isPermanentlyDismissed = useCallback(() => {
    try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  }, []);

  const hasSeen = useCallback(() => {
    try { return localStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; }
  }, []);

  const isInCooldown = useCallback(() => {
    try {
      const last = localStorage.getItem(LAST_SHOWN_KEY);
      if (!last) return false;
      return Date.now() - parseInt(last, 10) < COOLDOWN_MS;
    } catch { return false; }
  }, []);

  // Auto-show for first-time users (once, after 8 seconds)
  useEffect(() => {
    if (isPermanentlyDismissed() || hasSeen() || isInCooldown()) return;
    const timer = setTimeout(() => setIsOpen(true), 8000);
    return () => clearTimeout(timer);
  }, [isPermanentlyDismissed, hasSeen, isInCooldown]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, 'true');
      localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    } catch { /* ignore */ }
  }, []);

  const dismissPermanently = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
      localStorage.setItem(SEEN_KEY, 'true');
    } catch { /* ignore */ }
  }, []);

  /** Call this when multiple sources fail — shows the guide if not dismissed */
  const triggerFromStreamFailure = useCallback(() => {
    if (isPermanentlyDismissed() || isInCooldown()) return;
    setIsOpen(true);
  }, [isPermanentlyDismissed, isInCooldown]);

  return { isOpen, open, close, dismissPermanently, triggerFromStreamFailure };
}

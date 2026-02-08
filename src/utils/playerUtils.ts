/**
 * Player UX utilities
 * - Force fullscreen landscape on mobile
 * - PiP detection and control
 */

/**
 * Request fullscreen with landscape orientation lock on mobile
 */
export const requestFullscreenLandscape = async (element: HTMLElement) => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    }

    // Lock orientation to landscape if supported
    if (screen.orientation && 'lock' in screen.orientation) {
      try {
        await (screen.orientation as any).lock('landscape');
      } catch {
        // Orientation lock not supported or denied
      }
    }
  } catch (error) {
    console.warn('Fullscreen request failed:', error);
  }
};

/**
 * Exit fullscreen and release orientation lock
 */
export const exitFullscreenAndUnlock = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    if (screen.orientation && 'unlock' in screen.orientation) {
      try {
        (screen.orientation as any).unlock();
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }
};

/**
 * Check if PiP is supported
 */
export const isPipSupported = (): boolean => {
  return 'pictureInPictureEnabled' in document && (document as any).pictureInPictureEnabled;
};

/**
 * Detect if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
};

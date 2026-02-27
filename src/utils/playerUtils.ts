/**
 * Player UX utilities
 * - Force fullscreen landscape on mobile
 * - PiP detection and control
 */

type WebkitFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type OrientationLockType = 'landscape' | 'portrait' | 'any' | 'natural' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary';

type ScreenOrientationWithControls = ScreenOrientation & {
  lock?: (orientation: OrientationLockType) => Promise<void>;
  unlock?: () => void;
};

type PictureInPictureDocument = Document & {
  pictureInPictureEnabled?: boolean;
};

/**
 * Request fullscreen with landscape orientation lock on mobile
 */
export const requestFullscreenLandscape = async (element: HTMLElement) => {
  try {
    const fullscreenElement = element as WebkitFullscreenElement;

    if (fullscreenElement.requestFullscreen) {
      await fullscreenElement.requestFullscreen();
    } else if (fullscreenElement.webkitRequestFullscreen) {
      await fullscreenElement.webkitRequestFullscreen();
    }

    // Lock orientation to landscape if supported
    const orientation = screen.orientation as ScreenOrientationWithControls;
    if (orientation?.lock) {
      try {
        await orientation.lock('landscape');
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

    const orientation = screen.orientation as ScreenOrientationWithControls;
    if (orientation?.unlock) {
      try {
        orientation.unlock();
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
  return 'pictureInPictureEnabled' in document && !!(document as PictureInPictureDocument).pictureInPictureEnabled;
};

/**
 * Detect if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
};

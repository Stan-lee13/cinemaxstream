/**
 * Native Browser Notifications utility
 * Uses the Web Notifications API + Service Worker showNotification for broader support.
 */

const ICON_PATH = '/app-icon.png';
const COOLDOWN_KEY = 'native_notif_last_sent';
const MIN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes between native notifications

export function getNativePermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function requestNativePermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Send a native browser notification.
 * Uses SW.showNotification when available (works even when tab is backgrounded on mobile),
 * falls back to `new Notification()` for desktop.
 */
export async function sendNativeNotification(
  title: string,
  body: string,
  options?: { icon?: string; tag?: string; route?: string }
): Promise<boolean> {
  if (getNativePermission() !== 'granted') return false;

  // Throttle: max 1 native notification per 30 min
  const lastSent = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
  if (Date.now() - lastSent < MIN_INTERVAL_MS) return false;

  const notifOptions: NotificationOptions = {
    body,
    icon: options?.icon || ICON_PATH,
    tag: options?.tag || `cinemax-${Date.now()}`,
    badge: ICON_PATH,
    data: { route: options?.route },
  };

  try {
    // Prefer Service Worker showNotification (works when tab is background/closed)
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, notifOptions);
    } else {
      new Notification(title, notifOptions);
    }
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    return true;
  } catch {
    // Fallback to basic Notification constructor
    try {
      new Notification(title, notifOptions);
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      return true;
    } catch {
      return false;
    }
  }
}

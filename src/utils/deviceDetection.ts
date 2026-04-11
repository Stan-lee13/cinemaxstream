/**
 * Device Environment Detection
 * Returns platform, browser, and network info for adaptive UX.
 */

export interface DeviceEnvironment {
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'opera' | 'unknown';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  networkStrength: 'fast' | 'slow' | 'unknown';
  supportsAutoplay: boolean;
  isPWA: boolean;
}

let cached: DeviceEnvironment | null = null;

export const detectDeviceEnvironment = (): DeviceEnvironment => {
  if (cached) return cached;

  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || window.innerWidth < 768;
  const isDesktop = !isMobile;

  // Browser detection
  let browser: DeviceEnvironment['browser'] = 'unknown';
  if (/SamsungBrowser/i.test(ua)) browser = 'samsung';
  else if (/OPR|Opera/i.test(ua)) browser = 'opera';
  else if (/Edg/i.test(ua)) browser = 'edge';
  else if (/Firefox/i.test(ua)) browser = 'firefox';
  else if (/CriOS|Chrome/i.test(ua) && !isIOS) browser = 'chrome';
  else if (/Safari/i.test(ua) && isIOS) browser = 'safari';
  else if (/Chrome/i.test(ua)) browser = 'chrome';
  else if (/Safari/i.test(ua)) browser = 'safari';

  // OS
  let os: DeviceEnvironment['os'] = 'unknown';
  if (isIOS) os = 'ios';
  else if (isAndroid) os = 'android';
  else if (/Windows/i.test(ua)) os = 'windows';
  else if (/Mac OS/i.test(ua)) os = 'macos';
  else if (/Linux/i.test(ua)) os = 'linux';

  // Network
  let networkStrength: DeviceEnvironment['networkStrength'] = 'unknown';
  const conn = (navigator as any).connection;
  if (conn) {
    const effectiveType = conn.effectiveType as string;
    networkStrength = effectiveType === '4g' || effectiveType === '5g' ? 'fast' : 'slow';
  }

  // iOS Safari blocks autoplay with sound
  const supportsAutoplay = !(isIOS && browser === 'safari');

  // PWA detection
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;

  cached = { isIOS, isAndroid, isDesktop, isMobile, browser, os, networkStrength, supportsAutoplay, isPWA };
  return cached;
};

/**
 * Get device-specific ad-block instructions
 */
export const getAdBlockInstructions = (): {
  platform: string;
  steps: { text: string }[];
  fallback?: string;
} => {
  const env = detectDeviceEnvironment();

  if (env.isAndroid) {
    return {
      platform: 'Android',
      steps: [
        { text: 'Go to your phone Settings' },
        { text: 'Tap "Connections" or "Network & Internet"' },
        { text: 'Tap "More Connection Settings" or "Private DNS"' },
        { text: 'Open "Private DNS"' },
        { text: 'Select "Private DNS provider hostname"' },
        { text: 'Enter: dns.adguard.com' },
        { text: 'Tap Save' },
      ],
      fallback: 'You can also install the AdGuard app from the Play Store and enable it.',
    };
  }

  if (env.isIOS) {
    return {
      platform: 'iPhone / iPad',
      steps: [
        { text: 'Download the AdGuard app from the App Store' },
        { text: 'Open AdGuard and follow the setup wizard' },
        { text: 'Go to Settings → Safari → Content Blockers' },
        { text: 'Enable all AdGuard toggles' },
        { text: 'Return to CineMax and enjoy ad-reduced streaming' },
      ],
      fallback: 'For best results, use AdGuard with Safari Content Blockers enabled.',
    };
  }

  // Desktop
  return {
    platform: 'Desktop',
    steps: [
      { text: 'Install the uBlock Origin browser extension' },
      { text: 'Visit your browser\'s extension store (Chrome Web Store, Firefox Add-ons, etc.)' },
      { text: 'Search for "uBlock Origin" and click Install' },
      { text: 'The extension will automatically block most ads' },
      { text: 'Return to CineMax and enjoy ad-free streaming' },
    ],
    fallback: 'You can also set your system DNS to dns.adguard.com for network-wide ad blocking.',
  };
};

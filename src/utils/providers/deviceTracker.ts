/**
 * Device Tracking & Limit System
 * Max 5 devices per account.
 * Generates device fingerprint, stores device info.
 * Auto-removes oldest device if limit exceeded.
 */

import { supabase } from '@/integrations/supabase/client';

const MAX_DEVICES = 5;
const FINGERPRINT_KEY = 'device_fingerprint';

export interface DeviceInfo {
  id: string;
  device_fingerprint: string;
  device_os: string | null;
  device_browser: string | null;
  device_resolution: string | null;
  last_active_at: string;
  created_at: string;
}

/**
 * Generate a simple device fingerprint from browser properties
 */
export const generateFingerprint = (): string => {
  // Check for stored fingerprint first
  const stored = localStorage.getItem(FINGERPRINT_KEY);
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
  ];

  // Simple hash
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  const fingerprint = 'dev_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
  localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  return fingerprint;
};

/**
 * Detect device OS from user agent
 */
const detectOS = (): string => {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  return 'Unknown';
};

/**
 * Detect browser from user agent
 */
const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Opera|OPR/i.test(ua)) return 'Opera';
  return 'Unknown';
};

/**
 * Register current device for user. If limit exceeded, remove oldest.
 * Returns true if device is allowed, false if blocked.
 */
export const registerDevice = async (userId: string): Promise<boolean> => {
  const fingerprint = generateFingerprint();
  const os = detectOS();
  const browser = detectBrowser();
  const resolution = `${screen.width}x${screen.height}`;

  try {
    // Upsert current device
    await supabase.from('device_sessions').upsert(
      {
        user_id: userId,
        device_fingerprint: fingerprint,
        device_os: os,
        device_browser: browser,
        device_resolution: resolution,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,device_fingerprint' }
    );

    // Check device count
    const { data: devices } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: true });

    if (devices && devices.length > MAX_DEVICES) {
      // Remove oldest devices
      const toRemove = devices.slice(0, devices.length - MAX_DEVICES);
      for (const device of toRemove) {
        await supabase.from('device_sessions').delete().eq('id', device.id);
      }
    }

    return true;
  } catch {
    // Non-critical error — allow access
    return true;
  }
};

/**
 * Get all devices for a user (admin view)
 */
export const getUserDevices = async (userId: string): Promise<DeviceInfo[]> => {
  const { data } = await supabase
    .from('device_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });

  return (data as DeviceInfo[]) || [];
};

/**
 * Remove a specific device
 */
export const removeDevice = async (deviceId: string): Promise<boolean> => {
  const { error } = await supabase.from('device_sessions').delete().eq('id', deviceId);
  return !error;
};

/**
 * Update last active time for current device
 */
export const updateDeviceActivity = async (userId: string): Promise<void> => {
  const fingerprint = generateFingerprint();
  try {
    await supabase
      .from('device_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint);
  } catch { /* non-critical */ }
};

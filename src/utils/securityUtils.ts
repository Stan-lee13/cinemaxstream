/**
 * Security utilities for production-ready application
 */

// Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.themoviedb.org https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' https: blob:",
    "frame-src 'self' https://vidsrc.xyz https://vidsrc.su https://vidsrc.vip https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
};

// Rate limiting for API calls
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (key: string, maxRequests: number = 100, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
};

// Input sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Secure storage
export const secureStorage = {
  set: (key: string, value: string): void => {
    try {
      const encrypted = btoa(value); // Basic encoding, should use proper encryption in production
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },
  
  get: (key: string): string | null => {
    try {
      const value = localStorage.getItem(key);
      return value ? atob(value) : null;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// XSS Protection
export const preventXSS = (element: Element): void => {
  // Remove dangerous attributes
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
  dangerousAttrs.forEach(attr => {
    element.removeAttribute(attr);
  });
  
  // Remove script tags
  const scripts = element.querySelectorAll('script');
  scripts.forEach(script => script.remove());
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Validate URLs to prevent open redirects
export const isValidUrl = (url: string, allowedDomains: string[] = []): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check allowed domains if specified
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
    }
    
    return true;
  } catch {
    return false;
  }
};

// Security headers for fetch requests
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
};

export default {
  CSP_HEADERS,
  rateLimit,
  sanitizeHtml,
  secureStorage,
  preventXSS,
  generateCSRFToken,
  isValidUrl,
  getSecurityHeaders
};
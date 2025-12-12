/**
 * Production security utilities
 */

import { SecurityConfig } from '@/types/production';

export class ProductionSecurity {
  private config: SecurityConfig;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.initSecurityHeaders();
  }

  private initSecurityHeaders() {
    // Set Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      media-src 'self' https: blob:;
      connect-src 'self' https://api.themoviedb.org https://supabase.co https://*.supabase.co;
      frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://vidsrc.xyz https://vidsrc.su https://vidsrc.vip;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
    document.head.appendChild(meta);
  }

  sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      });
  }

  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.config.allowedDomains.some(domain => 
        urlObj.hostname.endsWith(domain)
      );
    } catch {
      return false;
    }
  }

  checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const windowMs = this.config.rateLimit.windowMs;
    const maxRequests = this.config.rateLimit.maxRequests;

    const requestData = this.requestCounts.get(clientId) || { count: 0, resetTime: now + windowMs };

    if (now > requestData.resetTime) {
      // Reset window
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
    } else {
      requestData.count++;
    }

    this.requestCounts.set(clientId, requestData);

    return requestData.count <= maxRequests;
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string): boolean {
    return token === this.config.csrfToken && token.length === 64;
  }

  encryptSensitiveData(data: string): string {
    // Simple base64 encoding for client-side data
    // In production, use proper encryption
    return btoa(data);
  }

  decryptSensitiveData(encryptedData: string): string {
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  allowedDomains: [
    'themoviedb.org',
    'youtube.com',
    'youtube-nocookie.com',
    'vidsrc.xyz',
    'vidsrc.su',
    'vidsrc.vip',
    'supabase.co',
    'lovable.app'
  ],
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000
  }
};

export const productionSecurity = new ProductionSecurity(defaultSecurityConfig);
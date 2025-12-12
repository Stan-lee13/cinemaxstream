/**
 * Production validation utilities
 */

import { ContentMetadata } from '@/types/production';

export class ProductionValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateContentMetadata(content: Partial<ContentMetadata>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.id || content.id.trim() === '') {
      errors.push('Content ID is required');
    }

    if (!content.title || content.title.trim() === '') {
      errors.push('Content title is required');
    }

    if (!content.type || !['movie', 'series', 'anime', 'documentary', 'sport'].includes(content.type)) {
      errors.push('Valid content type is required');
    }

    if (content.rating && (isNaN(Number(content.rating)) || Number(content.rating) < 0 || Number(content.rating) > 10)) {
      errors.push('Rating must be a number between 0 and 10');
    }

    if (content.year && (isNaN(Number(content.year)) || Number(content.year) < 1900 || Number(content.year) > new Date().getFullYear() + 2)) {
      errors.push('Year must be a valid year');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeSearchQuery(query: string): string {
    // Remove potentially dangerous characters
    return query
      .replace(/[<>'"&]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .substring(0, 100); // Limit length
  }

  static validateVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedHosts = [
        'vidsrc.xyz',
        'vidsrc.su',
        'vidsrc.vip',
        'youtube.com',
        'youtube-nocookie.com'
      ];
      
      return allowedHosts.some(host => urlObj.hostname.includes(host));
    } catch {
      return false;
    }
  }

  static validateImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const hasValidExtension = allowedExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      
      const allowedDomains = [
        'image.tmdb.org',
        'images.unsplash.com'
        // Add any additional real CDN domains here as needed
      ];
      
      const hasAllowedDomain = allowedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );

      return hasValidExtension || hasAllowedDomain;
    } catch {
      return false;
    }
  }

  static validateUserInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      .substring(0, maxLength)
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

  static isValidPromoCode(code: string): boolean {
    // Valid promo codes
    const validCodes = ['Stanley123.', 'PREMIUM2024', 'TESTCODE'];
    return validCodes.includes(code);
  }

  static validateStreamingProvider(provider: string): boolean {
    const validProviders = ['vidsrc_xyz', 'vidsrc_su', 'vidsrc_vip'];
    return validProviders.includes(provider);
  }
}

export default ProductionValidator;
/**
 * Validation utilities for production-ready form handling
 */

// Email validation with comprehensive regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
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
};

// URL validation for video sources
export const validateVideoUrl = (url: string): boolean => {
  try {
    const validUrl = new URL(url);
    const validProtocols = ['http:', 'https:'];
    return validProtocols.includes(validUrl.protocol);
  } catch {
    return false;
  }
};

// Content ID validation
export const validateContentId = (id: string): boolean => {
  // Check if it's a valid UUID or numeric ID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const numericRegex = /^\d+$/;
  
  return uuidRegex.test(id) || numericRegex.test(id);
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate search query
export const validateSearchQuery = (query: string): {
  isValid: boolean;
  sanitized: string;
} => {
  const trimmed = query.trim();
  const sanitized = sanitizeInput(trimmed);
  
  return {
    isValid: trimmed.length >= 2 && trimmed.length <= 100,
    sanitized
  };
};
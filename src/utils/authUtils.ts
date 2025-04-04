
/**
 * Authentication utility functions
 */

// Storage key for premium access
const PREMIUM_ACCESS_KEY = 'premium_access';
const VALID_PREMIUM_CODES = ['PREMIUM123', 'NETFLIX2025', 'CINEMAX2025'];

/**
 * Check if user has premium access
 */
export const hasPremiumAccess = (): boolean => {
  const premiumAccess = localStorage.getItem(PREMIUM_ACCESS_KEY);
  const guestAccess = localStorage.getItem('guest_access');
  return premiumAccess === 'true' || guestAccess === 'true';
};

/**
 * Validate and store premium code
 */
export const enterPremiumCode = (code: string): boolean => {
  if (VALID_PREMIUM_CODES.includes(code.toUpperCase())) {
    localStorage.setItem(PREMIUM_ACCESS_KEY, 'true');
    return true;
  }
  return false;
};

/**
 * Generate a secure password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  // Ensure at least one character of each type
  password += charset[Math.floor(Math.random() * 26)]; // lowercase
  password += charset[Math.floor(Math.random() * 26) + 26]; // uppercase
  password += charset[Math.floor(Math.random() * 10) + 52]; // number
  password += charset[Math.floor(Math.random() * (charset.length - 62)) + 62]; // special
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

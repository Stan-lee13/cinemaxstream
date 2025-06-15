
/**
 * Premium membership utility functions
 */

// Valid premium invite codes
const VALID_PREMIUM_CODES = ['08066960860'];

/**
 * Check if user has premium access based on invite code
 */
export const checkPremiumAccess = (inviteCode?: string): boolean => {
  if (!inviteCode) return false;
  return VALID_PREMIUM_CODES.includes(inviteCode);
};

/**
 * Validate premium invite code
 */
export const validatePremiumCode = (code: string): boolean => {
  return VALID_PREMIUM_CODES.includes(code.trim());
};

/**
 * Store premium access in localStorage
 */
export const storePremiumAccess = (code: string): boolean => {
  if (validatePremiumCode(code)) {
    localStorage.setItem('premium_invite_code', code);
    localStorage.setItem('premium_access', 'true');
    return true;
  }
  return false;
};

/**
 * Check if user has stored premium access
 */
export const hasStoredPremiumAccess = (): boolean => {
  const storedCode = localStorage.getItem('premium_invite_code');
  const premiumAccess = localStorage.getItem('premium_access');
  return premiumAccess === 'true' && validatePremiumCode(storedCode || '');
};

/**
 * Remove premium access
 */
export const removePremiumAccess = (): void => {
  localStorage.removeItem('premium_invite_code');
  localStorage.removeItem('premium_access');
};

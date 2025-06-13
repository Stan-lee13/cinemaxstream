import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * @param dirty The potentially unsafe HTML string.
 * @returns The sanitized HTML string.
 */
export const sanitizeHTML = (dirty: string | undefined | null): string => {
  if (typeof dirty !== 'string') {
    return ''; // Return an empty string if input is not a string (e.g., undefined or null)
  }
  return DOMPurify.sanitize(dirty);
};

export default sanitizeHTML;

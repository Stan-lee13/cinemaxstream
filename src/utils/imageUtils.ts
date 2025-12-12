import { Content } from "@/types/content";

/**
 * Safely gets the image URL from content, handling both image and image_url properties
 * @param content The content object that may have either image or image_url property
 * @returns The image URL string or empty string if neither property exists
 */
export const getImageUrl = (content: Partial<Content>): string => {
  // Handle case where content might have image property (from TMDB)
  if (content.image && typeof content.image === 'string') {
    return content.image;
  }
  
  // Handle case where content might have image_url property (from database)
  // Handle both string and null cases
  if (content.image_url !== undefined && content.image_url !== null && typeof content.image_url === 'string') {
    return content.image_url;
  }
  
  // Fallback to empty string
  return '';
};

/**
 * Safely gets the image URL from content with proper null handling
 * @param content The content object that may have either image or image_url property
 * @returns The image URL string or empty string if neither property exists
 */
export const getImageUrlSafe = (content: { image?: string; image_url?: string | null } | null | undefined): string => {
  if (!content) return '';
  
  // Handle case where content might have image property (from TMDB)
  if (content.image && typeof content.image === 'string') {
    return content.image;
  }
  
  // Handle case where content might have image_url property (from database)
  // Handle both string and null cases
  if (content.image_url !== undefined && content.image_url !== null && typeof content.image_url === 'string') {
    return content.image_url;
  }
  
  // Fallback to empty string
  return '';
};

/**
 * Safely gets the image URL from content with flexible property access
 * @param content The content object that may have either image or image_url property
 * @returns The image URL string or empty string if neither property exists
 */
export const getImageUrlFlexible = (content: any): string => {
  if (!content) return '';
  
  // Handle case where content might have image property (from TMDB)
  if (content.image && typeof content.image === 'string') {
    return content.image;
  }
  
  // Handle case where content might have image_url property (from database)
  // Handle both string and null cases
  if (content.image_url !== undefined && content.image_url !== null && typeof content.image_url === 'string') {
    return content.image_url;
  }
  
  // Fallback to empty string
  return '';
};
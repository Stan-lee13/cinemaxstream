
/**
 * AI utility functions with real implementation
 */

import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/types/content';

/**
 * Get AI-powered personalized recommendations
 */
export const getPersonalizedRecommendations = async (userId: string): Promise<ContentItem[]> => {
  try {
    // Call Supabase Edge Function for AI recommendations
    const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
      body: { user_id: userId }
    });

    if (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }

    return data?.recommendations || [];
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};

/**
 * Generate movie recommendations based on user preferences
 */
export const generateRecommendations = async (
  userPreferences: string,
  existingWatched: string[] = []
): Promise<ContentItem[]> => {
  try {
    // Call AI recommendation system
    const recommendations = await getPersonalizedRecommendations(userPreferences);

    // Filter out already watched content
    return recommendations.filter(item => !existingWatched.includes(item.id.toString()));
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

/**
 * Analyze user sentiment from watch behavior
 */
type WatchHistoryEntry = {
  watchedDuration?: number | null;
  totalDuration?: number | null;
  category?: string | null;
};

export const analyzeUserSentiment = async (watchHistory: WatchHistoryEntry[]): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  preferences: string[];
}> => {
  try {
    if (!watchHistory || watchHistory.length === 0) {
      return {
        sentiment: 'neutral',
        confidence: 0,
        preferences: []
      };
    }

    // Analyze completion rates and patterns
    const completionRates = watchHistory.map(item =>
      item.watchedDuration && item.totalDuration
        ? (item.watchedDuration / item.totalDuration)
        : 0
    );

    const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    
    // Extract genre preferences
    const genreCounts: Record<string, number> = {};
    watchHistory.forEach(item => {
      if (item.category) {
        const category = item.category as string;
        genreCounts[category] = (genreCounts[category] || 0) + 1;
      }
    });

    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    // Determine sentiment based on completion rate
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.5;

    if (avgCompletion > 0.7) {
      sentiment = 'positive';
      confidence = Math.min(0.9, avgCompletion);
    } else if (avgCompletion < 0.3) {
      sentiment = 'negative';
      confidence = Math.min(0.8, 1 - avgCompletion);
    }

    return {
      sentiment,
      confidence,
      preferences: topGenres
    };
  } catch (error) {
    console.error('Error analyzing user sentiment:', error);
    return {
      sentiment: 'neutral',
      confidence: 0,
      preferences: []
    };
  }
};

/**
 * Analyze content sentiment from reviews
 */
export const analyzeContentSentiment = async (contentId: string): Promise<{
  positive: number;
  negative: number;
  neutral: number;
  overall: 'positive' | 'negative' | 'neutral';
}> => {
  try {
    // In a real implementation, this would analyze actual reviews
    // For now, we'll use TMDB rating as a basis
    const response = await fetch(`https://api.themoviedb.org/3/movie/${contentId}?api_key=4626200399b08f9d04b72348e3625f15`);
    
    if (response.ok) {
      const data = await response.json();
      const rating = data.vote_average || 5;
      
      // Convert rating to sentiment scores
      const positive = Math.min(rating / 10, 0.9);
      const negative = Math.max((10 - rating) / 20, 0.1);
      const neutral = 1 - positive - negative;
      
      let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (positive > negative && positive > neutral) {
        overall = 'positive';
      } else if (negative > positive && negative > neutral) {
        overall = 'negative';
      }
      
      return { positive, negative, neutral, overall };
    }
    
    // Fallback
    return {
      positive: 0.6,
      negative: 0.2,
      neutral: 0.2,
      overall: 'positive'
    };
  } catch (error) {
    console.error('Error analyzing content sentiment:', error);
    return {
      positive: 0.5,
      negative: 0.3,
      neutral: 0.2,
      overall: 'positive'
    };
  }
};

/**
 * Generate content summary
 */
export const generateContentSummary = async (contentDescription: string): Promise<string> => {
  try {
    if (!contentDescription) return "No description available.";
    
    // Simple summarization - take first 150 characters or first 2 sentences
    const sentences = contentDescription.split('. ');
    if (sentences.length > 2) {
      return sentences.slice(0, 2).join('. ') + '.';
    }
    
    if (contentDescription.length > 150) {
      return contentDescription.substring(0, 147) + '...';
    }
    
    return contentDescription;
  } catch (error) {
    console.error('Error generating summary:', error);
    return "Summary generation failed.";
  }
};

/**
 * Extract entities from content (genres, actors, etc.)
 */
export const extractContentEntities = (content: ContentItem): {
  genres: string[];
  keywords: string[];
  themes: string[];
} => {
  try {
    const genres: string[] = [];
    const keywords: string[] = [];
    const themes: string[] = [];

    // Extract from category
    if (content.category) {
      genres.push(content.category);
    }

    // Extract from description using simple keyword matching
    const description = content.description?.toLowerCase() || '';
    
    // Genre keywords
    const genreKeywords = {
      'action': ['action', 'fight', 'battle', 'combat', 'adventure'],
      'comedy': ['comedy', 'funny', 'humor', 'laugh', 'comic'],
      'drama': ['drama', 'emotional', 'family', 'relationship'],
      'horror': ['horror', 'scary', 'fear', 'terror', 'ghost'],
      'romance': ['romance', 'love', 'romantic', 'heart'],
      'sci-fi': ['space', 'future', 'technology', 'alien', 'robot'],
      'thriller': ['thriller', 'suspense', 'mystery', 'crime']
    };

    // Theme keywords
    const themeKeywords = {
      'family': ['family', 'father', 'mother', 'parent', 'child'],
      'friendship': ['friend', 'friendship', 'buddy', 'companion'],
      'survival': ['survival', 'survive', 'escape', 'rescue'],
      'justice': ['justice', 'law', 'police', 'detective', 'crime'],
      'war': ['war', 'battle', 'military', 'soldier', 'conflict']
    };

    // Check for genre keywords
    Object.entries(genreKeywords).forEach(([genre, words]) => {
      if (words.some(word => description.includes(word))) {
        if (!genres.includes(genre)) {
          genres.push(genre);
        }
      }
    });

    // Check for theme keywords
    Object.entries(themeKeywords).forEach(([theme, words]) => {
      if (words.some(word => description.includes(word))) {
        themes.push(theme);
      }
    });

    // Extract keywords from title and description
    const text = `${content.title} ${description}`.toLowerCase();
    keywords.push(...text.split(/\s+/).filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
    ).slice(0, 10));

    return {
      genres: [...new Set(genres)],
      keywords: [...new Set(keywords)],
      themes: [...new Set(themes)]
    };
  } catch (error) {
    console.error('Error extracting content entities:', error);
    return {
      genres: [],
      keywords: [],
      themes: []
    };
  }
};

/**
 * Legacy named entity extraction for backward compatibility
 */
export const extractEntities = async (contentDescription: string): Promise<{
  people: string[];
  locations: string[];
  organizations: string[];
}> => {
  try {
    // Simple regex-based extraction
    const people: string[] = [];
    const locations: string[] = [];
    const organizations: string[] = [];
    
    // Extract potential names (capitalized words)
    const words = contentDescription.split(/\s+/);
    const capitalizedWords = words.filter(word => /^[A-Z][a-z]+$/.test(word));
    
    // Simple heuristics for classification
    capitalizedWords.forEach(word => {
      if (word.length > 2 && word.length < 15) {
        // Common location indicators
        if (['New', 'Los', 'San', 'North', 'South', 'East', 'West'].includes(word)) {
          locations.push(word);
        }
        // Common organization endings
        else if (word.endsWith('Corp') || word.endsWith('Inc') || word.endsWith('LLC')) {
          organizations.push(word);
        }
        // Assume remaining are people
        else if (people.length < 5) {
          people.push(word);
        }
      }
    });
    
    return { people, locations, organizations };
  } catch (error) {
    console.error('Error extracting entities:', error);
    return {
      people: [],
      locations: [],
      organizations: []
    };
  }
};

// Export default object with all functions for backward compatibility
export default {
  generateRecommendations,
  analyzeContentSentiment,
  generateContentSummary,
  extractEntities,
  getPersonalizedRecommendations,
  analyzeUserSentiment,
  extractContentEntities
};

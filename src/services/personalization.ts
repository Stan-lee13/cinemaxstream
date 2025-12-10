import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';

interface ContentPreference {
  genre: string;
  weight: number;
}

interface ViewingPattern {
  timeOfDay: number;
  dayOfWeek: number;
  duration: number;
  frequency: number;
}

type UserPreferences = {
  genres: ContentPreference[];
  actors: string[];
  directors: string[];
  languages: string[];
  contentTypes: ('movie' | 'series')[];
  viewingPatterns: ViewingPattern[];
  maxDuration?: number;
  minRating?: number;
};

interface UserProfile {
  id: string;
  userId: string;
  preferences: {
    genres: ContentPreference[];
    actors: string[];
    directors: string[];
    languages: string[];
    contentTypes: ('movie' | 'series')[];
    viewingPatterns: ViewingPattern[];
    maxDuration?: number;
    minRating?: number;
  };
  lastUpdated: string;
}

// DB row shapes (snake_case)
interface DBUserProfileRow {
  id: string;
  user_id: string;
  avatar_url?: string | null;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  preferences?: Json | null; // stored as Json in DB; we'll parse to our shape
  created_at?: string;
  updated_at?: string;
}

interface DBContentRow {
  id: string;
  title?: string;
  description?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  type?: 'movie' | 'series';
  genres?: string[];
  rating?: number;
  runtime?: number;
  // Optional fields that may exist in other content sources
  actors?: string[];
  director?: string;
  language?: string;
}

type Recommendation = DBContentRow & { score: number };

class PersonalizationService {
  private static instance: PersonalizationService;
  private user: User | null = null;
  private userProfile: UserProfile | null = null;
  private readonly PREFERENCE_DECAY = 0.95; // Decay factor for old preferences
  private readonly MAX_PREFERENCE_WEIGHT = 10;
  private readonly MIN_PREFERENCE_WEIGHT = 0;

  private constructor() {}

  static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  async initialize(user: User): Promise<void> {
    this.user = user;
    await this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.user) return;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id,user_id,preferences,created_at,updated_at')
      .eq('user_id', this.user.id)
      .single();

    if (error) {
      console.error('Failed to load user profile:', error);
      return;
    }

    const row = profile as unknown as DBUserProfileRow | null;
    if (!row) return;

    const prefsRaw = (row.preferences as Json) || ({} as Json);
    const prefsPartial = (prefsRaw as unknown) as Partial<UserPreferences>;

    // Normalize genres to ContentPreference[] whether stored as strings or objects
    const rawGenres = prefsPartial.genres || [];
    const genres: ContentPreference[] = Array.isArray(rawGenres)
      ? (rawGenres as unknown[]).map((g) => {
          if (typeof g === 'string') return { genre: g, weight: 1 } as ContentPreference;
          if (g && typeof g === 'object' && 'genre' in g) return (g as ContentPreference);
          return { genre: String(g), weight: 1 } as ContentPreference;
        })
      : [];

    this.userProfile = {
      id: row.id,
      userId: row.user_id,
      preferences: {
        genres,
        actors: prefsPartial.actors || [],
        directors: prefsPartial.directors || [],
        languages: prefsPartial.languages || [],
        contentTypes: prefsPartial.contentTypes || ['movie', 'series'],
        viewingPatterns: prefsPartial.viewingPatterns || [],
        maxDuration: prefsPartial.maxDuration,
        minRating: prefsPartial.minRating,
      },
      lastUpdated: row.updated_at || row.created_at || new Date().toISOString(),
    };
  }

  private async updateUserProfile(): Promise<void> {
    if (!this.user || !this.userProfile) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: this.userProfile.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.user.id);

    if (error) {
      console.error('Failed to update user profile:', error);
    }
  }

  async recordContentInteraction(
    contentId: string,
    action: 'view' | 'like' | 'dislike' | 'complete' | 'abandon',
    metadata: {
      duration?: number;
      progress?: number;
      genres?: string[];
      actors?: string[];
      director?: string;
      language?: string;
      contentType: 'movie' | 'series';
      rating?: number;
    }
  ): Promise<void> {
    if (!this.userProfile) return;

    // Update genre preferences
    metadata.genres?.forEach(genre => {
      this.updatePreference('genres', genre, action);
    });

    // Update actor preferences
    metadata.actors?.forEach(actor => {
      const index = this.userProfile!.preferences.actors.indexOf(actor);
      if (action === 'like' && index === -1) {
        this.userProfile!.preferences.actors.push(actor);
      } else if (action === 'dislike' && index !== -1) {
        this.userProfile!.preferences.actors.splice(index, 1);
      }
    });

    // Update director preference
    if (metadata.director) {
      const index = this.userProfile!.preferences.directors.indexOf(metadata.director);
      if (action === 'like' && index === -1) {
        this.userProfile!.preferences.directors.push(metadata.director);
      } else if (action === 'dislike' && index !== -1) {
        this.userProfile!.preferences.directors.splice(index, 1);
      }
    }

    // Update viewing patterns
    if (metadata.duration) {
      const now = new Date();
      const timeOfDay = now.getHours();
      const dayOfWeek = now.getDay();

      const pattern: ViewingPattern = {
        timeOfDay,
        dayOfWeek,
        duration: metadata.duration,
        frequency: 1,
      };

      this.updateViewingPattern(pattern);
    }

    // Update content type preferences
    if (!this.userProfile.preferences.contentTypes.includes(metadata.contentType)) {
      this.userProfile.preferences.contentTypes.push(metadata.contentType);
    }

    // Update language preferences
    if (metadata.language && !this.userProfile.preferences.languages.includes(metadata.language)) {
      this.userProfile.preferences.languages.push(metadata.language);
    }

    // Update rating threshold
    if (metadata.rating && action === 'complete') {
      this.userProfile.preferences.minRating = Math.min(
        metadata.rating,
        this.userProfile.preferences.minRating || 10
      );
    }

    // Update duration preference
    if (metadata.duration && action === 'complete') {
      this.userProfile.preferences.maxDuration = Math.max(
        metadata.duration,
        this.userProfile.preferences.maxDuration || 0
      );
    }

    await this.updateUserProfile();
  }

  private updatePreference(category: 'genres', item: string, action: string): void {
    const preferences = this.userProfile!.preferences[category];
    let preference = preferences.find(p => p.genre === item);

    if (!preference) {
      preference = { genre: item, weight: this.MIN_PREFERENCE_WEIGHT };
      preferences.push(preference);
    }

    // Apply weight changes based on action
    switch (action) {
      case 'view':
        preference.weight += 0.5;
        break;
      case 'like':
        preference.weight += 2;
        break;
      case 'complete':
        preference.weight += 1;
        break;
      case 'abandon':
        preference.weight -= 1;
        break;
      case 'dislike':
        preference.weight -= 2;
        break;
    }

    // Ensure weight stays within bounds
    preference.weight = Math.max(
      this.MIN_PREFERENCE_WEIGHT,
      Math.min(this.MAX_PREFERENCE_WEIGHT, preference.weight)
    );
  }

  private updateViewingPattern(newPattern: ViewingPattern): void {
    const patterns = this.userProfile!.preferences.viewingPatterns;
    const existingPattern = patterns.find(
      p => p.timeOfDay === newPattern.timeOfDay && p.dayOfWeek === newPattern.dayOfWeek
    );

    if (existingPattern) {
      existingPattern.duration =
        (existingPattern.duration * existingPattern.frequency + newPattern.duration) /
        (existingPattern.frequency + 1);
      existingPattern.frequency += 1;
    } else {
      patterns.push(newPattern);
    }
  }

  async getPersonalizedRecommendations(
    limit: number = 10,
    offset: number = 0
  ): Promise<Recommendation[]> {
    if (!this.userProfile) return [];

    // Get user's top genres
    const topGenres = this.userProfile.preferences.genres
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map(g => g.genre);

    // Get current time context
    const now = new Date();
    const currentTimeOfDay = now.getHours();
    const currentDayOfWeek = now.getDay();

    // Find optimal content duration based on viewing patterns
    const relevantPatterns = this.userProfile.preferences.viewingPatterns.filter(
      p =>
        Math.abs(p.timeOfDay - currentTimeOfDay) <= 2 &&
        (p.dayOfWeek === currentDayOfWeek || Math.abs(p.dayOfWeek - currentDayOfWeek) === 1)
    );

    const optimalDuration =
      relevantPatterns.length > 0
        ? relevantPatterns.reduce((acc, p) => acc + p.duration * p.frequency, 0) /
          relevantPatterns.reduce((acc, p) => acc + p.frequency, 0)
        : undefined;

    // Query for personalized content
    // Build query: use contains for array matching and range for pagination
    const rangeStart = offset;
    const rangeEnd = offset + limit - 1;

    // Select only required fields to reduce compile-time generic complexity
    const { data: recommendations, error } = await supabase
      .from('content')
      .select('id,genres,runtime,actors,director,rating,type')
      .contains('genres', topGenres)
      .gte('rating', this.userProfile.preferences.minRating || 0)
      .in('type', this.userProfile.preferences.contentTypes || ['movie', 'series'])
      .order('rating', { ascending: false })
      .range(rangeStart, rangeEnd);

    if (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }

    // Score and sort recommendations
    const rows = (recommendations || []) as unknown as DBContentRow[];

    const scoredRecommendations = rows.map((content) => {
      let score = 0;

      // Genre match score
      (content.genres || []).forEach((genre) => {
        const preference = this.userProfile!.preferences.genres.find((p) => p.genre === genre);
        if (preference) score += preference.weight;
      });

      // Actor/Director match score
      (content.actors || []).forEach((actor) => {
        if (this.userProfile!.preferences.actors.includes(actor)) score += 2;
      });

      if (content.director && this.userProfile!.preferences.directors.includes(content.director)) score += 3;

      // Duration match score (runtime in minutes)
      if (optimalDuration && typeof content.runtime === 'number') {
        const durationDiff = Math.abs(content.runtime - optimalDuration);
        score += Math.max(0, 5 - durationDiff / 30);
      }

      return { ...content, score } as Recommendation;
    });

    return scoredRecommendations.sort((a, b) => b.score - a.score);
  }

  async applyPreferenceDecay(): Promise<void> {
    if (!this.userProfile) return;

    // Apply decay to genre preferences
    this.userProfile.preferences.genres.forEach(preference => {
      preference.weight *= this.PREFERENCE_DECAY;
      if (preference.weight < this.MIN_PREFERENCE_WEIGHT) {
        preference.weight = this.MIN_PREFERENCE_WEIGHT;
      }
    });

    // Remove very old or inactive patterns
    this.userProfile.preferences.viewingPatterns = this.userProfile.preferences.viewingPatterns.filter(
      pattern => pattern.frequency > 1
    );

    await this.updateUserProfile();
  }
}

export const personalization = PersonalizationService.getInstance();
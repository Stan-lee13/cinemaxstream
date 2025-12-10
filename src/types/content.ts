export interface ContentItem {
  id: string;
  title: string;
  description?: string | undefined;
  image: string;
  poster?: string | undefined;
  backdrop?: string | undefined;
  year: string;
  duration: string;
  rating: string;
  category: string;
  type: string;
  trailer_key?: string | undefined;
  content_type?: string;
}

export interface SearchResult {
  id: string;
  title?: string | null | undefined;
  name?: string | null | undefined;
  poster_path?: string | null | undefined;
  media_type?: string | null | undefined;
  release_date?: string | null | undefined;
  first_air_date?: string | null | undefined;
  vote_average?: number | null | undefined;
}

export interface Provider {
  id: string;
  name: string;
}

export interface Content {
  id: string;
  title: string;
  image: string;
  poster?: string | undefined;
  backdrop?: string | undefined;
  year: string;
  rating: string;
  category: string;
  type: string;
  description?: string | undefined;
  duration: string;
  trailer_key?: string | undefined;
  is_premium?: boolean | undefined;
  content_type?: string;
}

export interface FeaturedContent {
  id: string;
  title: string;
  description?: string | undefined;
  image: string;
  category: string;
  year: string;
  duration: string;
  rating: string;
  trailer_key?: string | undefined;
  content_type?: string;
}

export interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season_number: number;
  description?: string | null;
  image?: string | null;
  duration?: string | null;
  air_date?: string | null;
}

export interface Season {
  id: string;
  season_number: number;
  title: string;
  episode_count: number;
  episodes: Episode[];
  poster?: string | null;
  air_date?: string | null;
}
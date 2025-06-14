
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  poster?: string;
  backdrop?: string;
  year: string;
  duration: string;
  rating: string;
  category: string;
  type?: string;
  trailer_key?: string;
}

export interface Content {
  id: string;
  title: string;
  image: string;
  poster?: string;
  backdrop?: string;
  year?: string;
  rating?: string;
  category?: string;
  type?: string;
  description?: string;
  duration?: string;
  trailer_key?: string;
}

export interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  year: string;
  duration: string;
  rating: string;
  trailer_key?: string;
}

export interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season_number: number;
  description?: string;
  image?: string;
  duration?: string;
  air_date?: string;
}

export interface Season {
  id: string;
  season_number: number;
  title: string;
  episode_count: number;
  episodes: Episode[];
  poster?: string;
  air_date?: string;
}

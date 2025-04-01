
/**
 * The Movie Database (TMDB) API Service
 * Handles fetching movie, TV, and related data from TMDB
 */

// TMDB API Configuration
const TMDB_API_KEY = "YOUR_TMDB_API_KEY"; // Replace with your actual API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image sizes available from TMDB
export const TMDB_IMAGE_SIZES = {
  poster: {
    small: "w185",
    medium: "w342",
    large: "w500",
    original: "original"
  },
  backdrop: {
    small: "w300",
    medium: "w780",
    large: "w1280",
    original: "original"
  }
};

// Types for TMDB API responses
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  runtime?: number;
}

export interface TMDBTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  number_of_seasons?: number;
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
}

// Helper function to build URLs for TMDB API requests
const buildUrl = (endpoint: string, queryParams: Record<string, string> = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  
  // Add additional query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

// Helper function to build image URLs
export const getImageUrl = (path: string | null, size: string = TMDB_IMAGE_SIZES.poster.medium): string => {
  if (!path) {
    return "https://placehold.co/500x750?text=No+Image";
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Convert TMDB data format to our application's content format
export const mapTMDBToContent = (item: TMDBMovie | TMDBTvShow, type: "movie" | "series"): any => {
  if (type === "movie") {
    const movie = item as TMDBMovie;
    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      image: getImageUrl(movie.poster_path),
      backdrop: getImageUrl(movie.backdrop_path, TMDB_IMAGE_SIZES.backdrop.large),
      category: "movie", // This would ideally be mapped from genre_ids
      year: movie.release_date ? movie.release_date.split("-")[0] : "",
      duration: movie.runtime ? `${movie.runtime}m` : "N/A",
      rating: movie.vote_average.toFixed(1),
      content_type: "movie"
    };
  } else {
    const show = item as TMDBTvShow;
    return {
      id: show.id,
      title: show.name,
      description: show.overview,
      image: getImageUrl(show.poster_path),
      backdrop: getImageUrl(show.backdrop_path, TMDB_IMAGE_SIZES.backdrop.large),
      category: "series", // This would ideally be mapped from genre_ids
      year: show.first_air_date ? show.first_air_date.split("-")[0] : "",
      duration: show.number_of_seasons ? `${show.number_of_seasons} Seasons` : "N/A",
      rating: show.vote_average.toFixed(1),
      content_type: "series"
    };
  }
};

// API Functions
export const tmdbApi = {
  // Get trending movies
  getTrendingMovies: async (timeWindow: "day" | "week" = "week") => {
    try {
      const response = await fetch(buildUrl(`/trending/movie/${timeWindow}`));
      const data = await response.json() as TMDBSearchResponse<TMDBMovie>;
      return data.results.map(movie => mapTMDBToContent(movie, "movie"));
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      return [];
    }
  },
  
  // Get trending TV shows
  getTrendingTvShows: async (timeWindow: "day" | "week" = "week") => {
    try {
      const response = await fetch(buildUrl(`/trending/tv/${timeWindow}`));
      const data = await response.json() as TMDBSearchResponse<TMDBTvShow>;
      return data.results.map(show => mapTMDBToContent(show, "series"));
    } catch (error) {
      console.error("Error fetching trending TV shows:", error);
      return [];
    }
  },
  
  // Get popular movies
  getPopularMovies: async () => {
    try {
      const response = await fetch(buildUrl("/movie/popular"));
      const data = await response.json() as TMDBSearchResponse<TMDBMovie>;
      return data.results.map(movie => mapTMDBToContent(movie, "movie"));
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return [];
    }
  },
  
  // Get popular TV shows
  getPopularTvShows: async () => {
    try {
      const response = await fetch(buildUrl("/tv/popular"));
      const data = await response.json() as TMDBSearchResponse<TMDBTvShow>;
      return data.results.map(show => mapTMDBToContent(show, "series"));
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      return [];
    }
  },
  
  // Get movie details
  getMovieDetails: async (id: number) => {
    try {
      const response = await fetch(buildUrl(`/movie/${id}`));
      const movie = await response.json() as TMDBMovie;
      return mapTMDBToContent(movie, "movie");
    } catch (error) {
      console.error(`Error fetching movie details for ID ${id}:`, error);
      return null;
    }
  },
  
  // Get TV show details
  getTvShowDetails: async (id: number) => {
    try {
      const response = await fetch(buildUrl(`/tv/${id}`));
      const show = await response.json() as TMDBTvShow;
      return mapTMDBToContent(show, "series");
    } catch (error) {
      console.error(`Error fetching TV show details for ID ${id}:`, error);
      return null;
    }
  },
  
  // Search for movies
  searchMovies: async (query: string) => {
    try {
      const response = await fetch(buildUrl("/search/movie", { query }));
      const data = await response.json() as TMDBSearchResponse<TMDBMovie>;
      return data.results.map(movie => mapTMDBToContent(movie, "movie"));
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  },
  
  // Search for TV shows
  searchTvShows: async (query: string) => {
    try {
      const response = await fetch(buildUrl("/search/tv", { query }));
      const data = await response.json() as TMDBSearchResponse<TMDBTvShow>;
      return data.results.map(show => mapTMDBToContent(show, "series"));
    } catch (error) {
      console.error("Error searching TV shows:", error);
      return [];
    }
  }
};

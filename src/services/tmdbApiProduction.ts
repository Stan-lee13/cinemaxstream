import { errorReporter } from "@/utils/errorReporting";
/**
 * Production-ready TMDB API Service
 * Clean version without console logging
 */

import { toast } from "sonner";
import { getImageUrl, normalizeContentType } from "@/utils/urlUtils";
import { ContentItem, Season, Episode } from "@/types/content";
import { getTrailerUrlImpl } from "@/utils/providers/trailerProviders";

// Re-export for compatibility with other modules
export type { ContentItem } from "@/types/content";

// Base URLs for TMDB API
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

// API Key for TMDB - Using environment variable with fallback
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "4626200399b08f9d04b72348e3625f15";

const ensureArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

// Minimal local typings for TMDB responses to avoid using `any` across the file
type TMDbItem = Partial<{
  id: number | string;
  media_type: string;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date: string;
  runtime: number;
  number_of_seasons: number;
  vote_average: number;
  still_path: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  episode_count: number;
}>;

type TMDbSeason = Partial<{
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string;
  air_date: string;
}>;

type TMDbEpisode = Partial<{
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  runtime: number;
  air_date: string;
}>;

// Function to format content item
const formatContentItem = (item: unknown, type: string = 'movie'): ContentItem => {
  const it = (item as TMDbItem) || {};
  const isMovie = type === 'movie';
  const contentType = normalizeContentType(type);
  
  return {
    id: String(it.id ?? ''),
    title: isMovie ? (it.title ?? it.name ?? '') : (it.name ?? it.title ?? ''),
    description: it.overview ?? '',
    image: it.poster_path ? `${TMDB_POSTER_BASE_URL}${it.poster_path}` : 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=500&h=750&fit=crop&crop=face',
    poster: it.poster_path ? `${TMDB_POSTER_BASE_URL}${it.poster_path}` : 'https://images.unsplash.com/photo-1489599749528-16e7b3b7a9d6?w=500&h=750&fit=crop&crop=face',
    backdrop: it.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${it.backdrop_path}` : undefined,
    year: ((isMovie ? it.release_date : it.first_air_date) || '').toString().substring(0, 4) || 'N/A',
    duration: isMovie
      ? (typeof it.runtime === 'number' ? `${it.runtime} min` : 'N/A')
      : (typeof it.number_of_seasons === 'number' ? `Seasons: ${it.number_of_seasons}` : 'N/A'),
    rating: (typeof it.vote_average === 'number' ? (it.vote_average / 2).toFixed(1) : '0.0'),
    category: contentType,
    type: contentType,
    content_type: contentType,
    trailer_key: (it.id ?? '').toString() // Will be replaced with actual trailer key when needed
  };
};

// Function to search content with proper pagination
export const searchContent = async (query: string, page: number = 1): Promise<{ results: ContentItem[] }> => {
  try {
    if (!API_KEY) {
      toast.error('TMDB API key not configured');
      return { results: [] };
    }

    const url = `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { results: [] };
    }
    
    const data = await response.json();
    const results = ensureArray(data.results) as TMDbItem[];

    const filtered = results.filter((r) => (r.media_type === 'movie' || r.media_type === 'tv'));
    return {
      results: filtered.map((item) => formatContentItem(item, item.media_type === 'tv' ? 'series' : (item.media_type || 'movie')))
    };
  } catch (error) {
    toast.error('Failed to search content');
    return { results: [] };
  }
};

// Function to get trending movies with pagination
const getTrendingMovies = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
  const data = await response.json();
  const results = ensureArray(data.results) as TMDbItem[];
  return results.map((item) => formatContentItem(item, 'movie'));
  } catch (error) {
    return [];
  }
};

// Function to get trending TV shows with pagination
const getTrendingTvShows = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
  const data = await response.json();
  const results = ensureArray(data.results) as TMDbItem[];
  return results.map((item) => formatContentItem(item, 'series'));
  } catch (error) {
    return [];
  }
};

// Function to get popular movies with pagination
const getPopularMovies = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
  const data = await response.json();
  const results = ensureArray(data.results) as TMDbItem[];
  return results.map((item) => formatContentItem(item, 'movie'));
  } catch (error) {
    return [];
  }
};

// Function to get popular TV shows with pagination
const getPopularTvShows = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
  const data = await response.json();
  const results = ensureArray(data.results) as TMDbItem[];
  return results.map((item) => formatContentItem(item, 'series'));
  } catch (error) {
    return [];
  }
};

// Function to get anime (using animation genre and filtering)
const getAnime = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    // Using animation genre ID (16) to filter for anime-like content
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&page=${page}&with_original_language=ja`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const results = ensureArray(data.results) as TMDbItem[];
    return results.map((item) => {
      const formattedItem = formatContentItem(item, 'series');
      formattedItem.category = 'anime';
      formattedItem.type = 'anime';
      formattedItem.content_type = 'anime';
      return formattedItem;
    });
  } catch (error) {
    return [];
  }
};

// Function to get content details with proper trailer integration and type detection
const getContentDetails = async (id: string, type?: string): Promise<ContentItem | null> => {
  try {
    let detectedType: string = type || 'movie';
    let response;
    let data;
    
    // If type is not specified, try to detect it by attempting both movie and TV endpoints
    if (!type) {
      // Try movie first
      const movieUrl = `${TMDB_BASE_URL}/movie/${encodeURIComponent(id)}?api_key=${API_KEY}&append_to_response=videos,credits`;
      const movieResponse = await fetch(movieUrl);
      
      if (movieResponse.ok) {
        data = await movieResponse.json();
        detectedType = 'movie';
      } else {
        // Try TV
        const tvUrl = `${TMDB_BASE_URL}/tv/${encodeURIComponent(id)}?api_key=${API_KEY}&append_to_response=videos,credits`;
        const tvResponse = await fetch(tvUrl);
        
        if (tvResponse.ok) {
          data = await tvResponse.json();
          // Check if it's anime based on original language
          detectedType = data.original_language === 'ja' ? 'anime' : 'series';
        } else {
          return null;
        }
      }
    } else {
      // Type is specified
      const normalizedType = normalizeContentType(type);
      const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
      const url = `${TMDB_BASE_URL}/${endpoint}/${encodeURIComponent(id)}?api_key=${API_KEY}&append_to_response=videos,credits`;
      
      response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      data = await response.json();
      detectedType = normalizedType;
    }
    
    const formattedItem = formatContentItem(data, detectedType);
    
    // Get actual trailer key using the trailer provider
    try {
      const endpoint = detectedType === 'series' || detectedType === 'anime' ? 'tv' : 'movie';
      const trailerKey = await getTrailerUrlImpl(id, endpoint);
      formattedItem.trailer_key = trailerKey;
    } catch (trailerError) {
      formattedItem.trailer_key = ''; // No trailer available
    }
    
    return formattedItem;
  } catch (error) {
    return null;
  }
};

const getSimilarContent = async (id: string, type: string = 'movie'): Promise<ContentItem[]> => {
  try {
    const normalizedType = normalizeContentType(type);
    
    // For TV shows, we need to adjust the endpoint
    const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
    const url = `${TMDB_BASE_URL}/${endpoint}/${encodeURIComponent(id)}/similar?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
  const data = await response.json();
  const results = ensureArray(data.results) as TMDbItem[];
  return results.map((item) => formatContentItem(item, normalizedType));
  } catch (error) {
    return [];
  }
};

const getDocumentaries = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99&sort_by=popularity.desc&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const results = ensureArray(data.results) as TMDbItem[];
    return results.map((item) => {
      const content = formatContentItem(item, 'movie');
      content.category = 'documentary';
      content.type = 'documentary';
      content.content_type = 'documentary';
      return content;
    });
  } catch (error) {
    return [];
  }
};

const getSports = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    // Search for sports-related content using keywords
    const movieUrl = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=sport&sort_by=popularity.desc&page=${page}`;
    const tvUrl = `${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=sport&sort_by=popularity.desc&page=${page}`;

    const [moviesRes, tvRes] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
    const movieData = moviesRes.ok ? await moviesRes.json() : { results: [] };
    const tvData = tvRes.ok ? await tvRes.json() : { results: [] };

    // Combine and mark their types
    const movieResults = ensureArray(movieData.results) as TMDbItem[];
    const tvResults = ensureArray(tvData.results) as TMDbItem[];

    const sportsMovies = movieResults.map((item) => {
      const content = formatContentItem(item, 'movie');
      content.category = 'sport';
      content.type = 'sport';
      content.content_type = 'sport';
      return content;
    });
    const sportsTv = tvResults.map((item) => {
      const content = formatContentItem(item, 'series');
      content.category = 'sport';
      content.type = 'sport';
      content.content_type = 'sport';
      return content;
    });
    
    // Combine and limit to a reasonable number (20)
    return [...sportsMovies, ...sportsTv].slice(0, 20);
  } catch (error) {
    return [];
  }
};

const getContentByCategory = async (category: string, page: number = 1): Promise<ContentItem[]> => {
  try {
    switch (category) {
      case 'movies':
      case 'featured':
        return await getPopularMovies(page);
      case 'series':
        return await getPopularTvShows(page);
      case 'anime':
        return await getAnime(page);
      case 'trending': {
        const trendingMovies = await getTrendingMovies(page);
        const trendingTvShows = await getTrendingTvShows(page);
        return [...trendingMovies.slice(0, 10), ...trendingTvShows.slice(0, 10)];
      }
      case 'documentary':
      case 'documentaries':
        return await getDocumentaries(page);
      case 'sports':
        return await getSports(page);
      default: {
        // Fallback to trending
        const fallbackUrl = `${TMDB_BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`;
        const response = await fetch(fallbackUrl);
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        const results = ensureArray(data.results) as TMDbItem[];
        return results.map((item) => {
          const itemType = item.media_type || 'movie';
          const contentType = normalizeContentType(itemType === 'tv' ? 'series' : itemType);
          return formatContentItem(item, contentType);
        });
      }
    }
  } catch (error) {
    return [];
  }
};

// Function to get featured content for hero section
const getFeaturedContent = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/all/day?api_key=${API_KEY}&page=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    const results = ensureArray(data.results) as TMDbItem[];
    return results.slice(0, 10).map((item) => {
      const itemType = item.media_type === 'tv' ? 'series' : 'movie';
      return formatContentItem(item, itemType);
    });
  } catch (error) {
    return [];
  }
};

// Function to get content based on AI recommendations 
const getContentByTitles = async (titles: string[]): Promise<ContentItem[]> => {
  try {
    const searchPromises = titles.map(async (title) => {
      const url = `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const itemType = item.media_type === 'tv' ? 'series' : 'movie';
        return formatContentItem(item, itemType);
      }
      return null;
    });
    
    const results = await Promise.all(searchPromises);
    return results.filter(item => item !== null) as ContentItem[];
  } catch (error) {
    return [];
  }
};

const getTvShowSeasons = async (id: string): Promise<Season[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${encodeURIComponent(id)}?api_key=${API_KEY}&append_to_response=season/1,season/2,season/3`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data || !data.seasons || !Array.isArray(data.seasons)) {
      return [];
    }

    const seasonsArr = ensureArray(data.seasons) as TMDbSeason[];
    // Filter out specials (season 0)
    const filteredSeasons = seasonsArr.filter((s) => (s.season_number && s.season_number > 0));

    // Format seasons
    return filteredSeasons.map((s) => ({
      id: `season-${s.season_number}`,
      season_number: s.season_number || 0,
      title: s.name || `Season ${s.season_number}`,
      episode_count: s.episode_count || 0,
      episodes: [], // Will be populated separately if needed
      poster: s.poster_path ? `${TMDB_POSTER_BASE_URL}${s.poster_path}` : null,
      air_date: s.air_date || null
    } as Season));
  } catch (error) {
    return [];
  }
};

const getTvShowEpisodes = async (id: string, seasonNumber: number): Promise<Episode[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${encodeURIComponent(id)}/season/${seasonNumber}?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data || !data.episodes || !Array.isArray(data.episodes)) {
      return [];
    }

    const episodesArr = ensureArray(data.episodes) as TMDbEpisode[];
    // Format episodes
    return episodesArr.map((episode) => ({
      id: `ep-${seasonNumber}-${episode.episode_number}`,
      title: episode.name || `Episode ${episode.episode_number}`,
      episode_number: episode.episode_number || 0,
      season_number: seasonNumber,
      description: episode.overview || '',
      image: episode.still_path ? `${TMDB_POSTER_BASE_URL}${episode.still_path}` : undefined,
      duration: typeof episode.runtime === 'number' ? `${episode.runtime} min` : undefined,
      air_date: episode.air_date || undefined
    } as Episode));
  } catch (error) {
    return [];
  }
};

// Get new releases (recent movies)
export const getNewReleases = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const results = await getPopularMovies(page);
    return results.sort((a, b) => new Date(b.year).getFullYear() - new Date(a.year).getFullYear()).slice(0, 20);
  } catch (error) {
    errorReporter.captureException(error as Error, 'getNewReleases');
    return [];
  }
};

// Get top rated content
export const getTopRated = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const [movies, shows] = await Promise.all([
      getPopularMovies(page),
      getPopularTvShows(page)
    ]);
    
    return [...movies, ...shows]
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 20);
  } catch (error) {
    errorReporter.captureException(error as Error, 'getTopRated');
    return [];
  }
};

// Export API functions
export const tmdbApi = {
  searchContent,
  getTrendingMovies,
  getTrendingTvShows,
  getPopularMovies,
  getPopularTvShows,
  getAnime,
  getContentDetails,
  getSimilarContent,
  getContentByCategory,
  getFeaturedContent,
  getContentByTitles,
  getTvShowSeasons,
  getTvShowEpisodes,
  getNewReleases,
  getTopRated
};
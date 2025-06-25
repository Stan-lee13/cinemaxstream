/**
 * API Service for fetching content from TMDB
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

// API Key for TMDB
const API_KEY = "4626200399b08f9d04b72348e3625f15";

// Function to format content item
const formatContentItem = (item: any, type: string = 'movie'): ContentItem => {
  const isMovie = type === 'movie';
  const contentType = normalizeContentType(type);
  
  return {
    id: item.id.toString(),
    title: isMovie ? item.title : item.name,
    description: item.overview,
    image: item.poster_path ? `${TMDB_POSTER_BASE_URL}${item.poster_path}` : '/placeholder.svg',
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}` : undefined,
    year: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4) || 'N/A',
    duration: isMovie ? '120 min' : 'Seasons: ' + (item.number_of_seasons || 'N/A'),
    rating: (item.vote_average / 2).toFixed(1),
    category: contentType,
    type: contentType,
    content_type: contentType,
    trailer_key: item.id.toString() // Will be replaced with actual trailer key when needed
  };
};

// Function to search content with proper pagination
const searchContent = async (query: string, page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Search failed with status: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => formatContentItem(item, item.media_type === 'tv' ? 'series' : item.media_type));
  } catch (error) {
    console.error("Error searching content:", error);
    return [];
  }
};

// Function to get trending movies with pagination
const getTrendingMovies = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch trending movies: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'movie'));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

// Function to get trending TV shows with pagination
const getTrendingTvShows = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch trending TV shows: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'series'));
  } catch (error) {
    console.error("Error fetching trending TV shows:", error);
    return [];
  }
};

// Function to get popular movies with pagination
const getPopularMovies = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch popular movies: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'movie'));
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

// Function to get popular TV shows with pagination
const getPopularTvShows = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch popular TV shows: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'series'));
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
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
      console.error(`Failed to fetch anime: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => {
      const formattedItem = formatContentItem(item, 'series');
      formattedItem.category = 'anime';
      formattedItem.type = 'anime';
      formattedItem.content_type = 'anime';
      return formattedItem;
    });
  } catch (error) {
    console.error("Error fetching anime:", error);
    return [];
  }
};

// Function to get content details with proper trailer integration
const getContentDetails = async (id: string, type: string = 'movie'): Promise<ContentItem | null> => {
  try {
    const normalizedType = normalizeContentType(type);
    
    // For TV shows, we need to adjust the endpoint
    const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${API_KEY}&append_to_response=videos,credits`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If we can't find it as the specified type, try the alternative
      if (normalizedType === 'movie') {
        return getContentDetails(id, 'series');
      } else if (normalizedType === 'series') {
        return getContentDetails(id, 'movie');
      }
      return null;
    }
    
    const data = await response.json();
    const formattedItem = formatContentItem(data, normalizedType);
    
    // Get actual trailer key using the trailer provider
    try {
      const trailerKey = await getTrailerUrlImpl(id, endpoint);
      formattedItem.trailer_key = trailerKey;
    } catch (trailerError) {
      console.error("Error fetching trailer for content:", trailerError);
      formattedItem.trailer_key = 'dQw4w9WgXcQ'; // Fallback
    }
    
    return formattedItem;
  } catch (error) {
    console.error("Error fetching content details:", error);
    return null;
  }
};

const getSimilarContent = async (id: string, type: string = 'movie'): Promise<ContentItem[]> => {
  try {
    const normalizedType = normalizeContentType(type);
    
    // For TV shows, we need to adjust the endpoint
    const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}/similar?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch similar content: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, normalizedType));
  } catch (error) {
    console.error("Error fetching similar content:", error);
    return [];
  }
};

const getDocumentaries = async (page: number = 1): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99&sort_by=popularity.desc&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch documentaries: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results.map((item: any) => {
      const content = formatContentItem(item, 'movie');
      content.category = 'documentary';
      content.type = 'documentary';
      content.content_type = 'documentary';
      return content;
    });
  } catch (error) {
    console.error("Error fetching documentaries:", error);
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
    const sportsMovies = (movieData.results || []).map((item: any) => {
      const content = formatContentItem(item, 'movie');
      content.category = 'sport';
      content.type = 'sport';
      content.content_type = 'sport';
      return content;
    });
    const sportsTv = (tvData.results || []).map((item: any) => {
      const content = formatContentItem(item, 'series');
      content.category = 'sport';
      content.type = 'sport';
      content.content_type = 'sport';
      return content;
    });
    
    // Combine and limit to a reasonable number (20)
    return [...sportsMovies, ...sportsTv].slice(0, 20);
  } catch (error) {
    console.error("Error fetching sports content:", error);
    return [];
  }
};

const getContentByCategory = async (category: string, page: number = 1): Promise<ContentItem[]> => {
  try {
    let url = '';
    let type = 'movie';
    switch (category) {
      case 'movies':
      case 'featured':
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
        type = 'movie';
        break;
      case 'series':
        url = `${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`;
        type = 'series';
        break;
      case 'anime':
        return getAnime(page);
      case 'trending':
        const trendingMovies = await getTrendingMovies(page);
        const trendingTvShows = await getTrendingTvShows(page);
        return [...trendingMovies.slice(0, 10), ...trendingTvShows.slice(0, 10)];
      case 'documentary':
      case 'documentaries':
        return getDocumentaries(page);
      case 'sports':
        return getSports(page);
      default:
        url = `${TMDB_BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch content by category: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.results.map((item: any) => {
      const itemType = item.media_type || type;
      const contentType = normalizeContentType(itemType === 'tv' ? 'series' : itemType);
      return formatContentItem(item, contentType);
    });
  } catch (error) {
    console.error(`Error fetching ${category} content:`, error);
    return [];
  }
};

// Function to get featured content for hero section
const getFeaturedContent = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/all/day?api_key=${API_KEY}&page=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch featured content: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.slice(0, 10).map((item: any) => {
      const itemType = item.media_type === 'tv' ? 'series' : 'movie';
      return formatContentItem(item, itemType);
    });
  } catch (error) {
    console.error("Error fetching featured content:", error);
    return [];
  }
};

const getTvShowSeasons = async (id: string): Promise<Season[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=season/1,season/2,season/3`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show seasons: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.seasons || !Array.isArray(data.seasons)) {
      return [];
    }
    
    // Filter out specials (season 0)
    const filteredSeasons = data.seasons.filter((season: any) => season.season_number > 0);
    
    // Format seasons
    return filteredSeasons.map((season: any) => ({
      id: `season-${season.season_number}`,
      season_number: season.season_number,
      title: season.name || `Season ${season.season_number}`,
      episode_count: season.episode_count || 0,
      episodes: [], // Will be populated separately if needed
      poster: season.poster_path ? `${TMDB_POSTER_BASE_URL}${season.poster_path}` : null,
      air_date: season.air_date || null
    }));
  } catch (error) {
    console.error("Error fetching TV show seasons:", error);
    return [];
  }
};

const getTvShowEpisodes = async (id: string, seasonNumber: number): Promise<Episode[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch TV show episodes: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.episodes || !Array.isArray(data.episodes)) {
      return [];
    }
    
    // Format episodes
    return data.episodes.map((episode: any) => ({
      id: `ep-${seasonNumber}-${episode.episode_number}`,
      title: episode.name || `Episode ${episode.episode_number}`,
      episode_number: episode.episode_number,
      season_number: seasonNumber,
      description: episode.overview || '',
      image: episode.still_path ? `${TMDB_POSTER_BASE_URL}${episode.still_path}` : undefined,
      duration: `${Math.floor(Math.random() * 20) + 30} min`, // Mock duration
      air_date: episode.air_date || undefined
    }));
  } catch (error) {
    console.error("Error fetching TV show episodes:", error);
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
  getTvShowSeasons,
  getTvShowEpisodes
};

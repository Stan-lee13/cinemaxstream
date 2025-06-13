
/**
 * API Service for fetching content from TMDB
 */

import { toast } from "sonner";
import { getImageUrl, normalizeContentType } from "@/utils/urlUtils";

// Environment Variables
const VITE_TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const VITE_TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const VITE_TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/original";
const VITE_TMDB_POSTER_BASE_URL = import.meta.env.VITE_TMDB_POSTER_BASE_URL || "https://image.tmdb.org/t/p/w500";

if (!VITE_TMDB_API_KEY) {
  throw new Error("VITE_TMDB_API_KEY is not defined. Please check your .env file.");
}

// Constants for use within the module
const TMDB_API_KEY = VITE_TMDB_API_KEY;
const TMDB_BASE_URL = VITE_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = VITE_TMDB_IMAGE_BASE_URL;
const TMDB_POSTER_BASE_URL = VITE_TMDB_POSTER_BASE_URL;


// Types for data
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  backdrop?: string;
  year: string;
  duration: string;
  rating: string;
  category: string;
  type?: string;
  trailer_key?: string;
  content_type?: string;
}

// Function to format content item
const formatContentItem = (item: any, type: string = 'movie'): ContentItem => {
  const isMovie = type === 'movie';
  const contentType = normalizeContentType(type);
  
  return {
    id: item.id.toString(),
    title: isMovie ? item.title : item.name,
    description: item.overview,
    image: item.poster_path ? `${TMDB_POSTER_BASE_URL}${item.poster_path}` : getImageUrl('/placeholder.svg'), // Use getImageUrl for consistency
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}` : undefined,
    year: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4) || 'N/A',
    duration: isMovie ? '120 min' : 'Seasons: ' + (item.number_of_seasons || 'N/A'), // This duration is a placeholder, actual duration might need more specific fetching if available
    rating: (item.vote_average / 2).toFixed(1),
    category: contentType,
    type: contentType,
    content_type: contentType,
    trailer_key: item.id.toString() // Will be replaced if we find an actual trailer
  };
};

// Function to search content
const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => formatContentItem(item, item.media_type === 'tv' ? 'series' : item.media_type));
  } catch (error) {
    console.error("Error searching content:", error);
    toast.error("Failed to search content");
    return [];
  }
};

// Function to get trending movies
const getTrendingMovies = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending movies: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'movie'));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    toast.error("Failed to load trending movies");
    return [];
  }
};

// Function to get trending TV shows
const getTrendingTvShows = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending TV shows: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'series'));
  } catch (error) {
    console.error("Error fetching trending TV shows:", error);
    toast.error("Failed to load trending TV shows");
    return [];
  }
};

// Function to get popular movies
const getPopularMovies = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'movie'));
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    toast.error("Failed to load popular movies");
    return [];
  }
};

// Function to get popular TV shows
const getPopularTvShows = async (): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular TV shows: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, 'series'));
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    toast.error("Failed to load popular TV shows");
    return [];
  }
};

// Function to get anime (using animation genre and filtering)
const getAnime = async (): Promise<ContentItem[]> => {
  try {
    // Using animation genre ID (16) to filter for anime-like content
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch anime: ${response.status}`);
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
    toast.error("Failed to load anime");
    return [];
  }
};

// Function to get content details
const getContentDetails = async (id: string, type: string = 'movie'): Promise<ContentItem | null> => {
  try {
    const normalizedType = normalizeContentType(type);
    
    // For TV shows, we need to adjust the endpoint
    const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If we can't find it as the specified type, try the alternative
      if (normalizedType === 'movie') {
        return getContentDetails(id, 'series');
      } else if (normalizedType === 'series') {
        return getContentDetails(id, 'movie');
      }
      throw new Error(`Failed to fetch content details: ${response.status}`);
    }
    
    const data = await response.json();
    const formattedItem = formatContentItem(data, normalizedType);
    
    // Set trailer key if available in the response
    if (data.videos && data.videos.results && data.videos.results.length > 0) {
      // Find a trailer, teaser, or any video
      const trailer = data.videos.results.find((v: any) => 
        v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      
      if (trailer) {
        formattedItem.trailer_key = trailer.key;
      }
    }
    
    return formattedItem;
  } catch (error) {
    console.error("Error fetching content details:", error);
    return null;
  }
};

// Function to get similar content
const getSimilarContent = async (id: string, type: string = 'movie'): Promise<ContentItem[]> => {
  try {
    const normalizedType = normalizeContentType(type);
    
    // For TV shows, we need to adjust the endpoint
    const endpoint = normalizedType === 'series' || normalizedType === 'anime' ? 'tv' : normalizedType;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}/similar?api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch similar content: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, normalizedType));
  } catch (error) {
    console.error("Error fetching similar content:", error);
    toast.error("Failed to load similar content");
    return [];
  }
};

// Function to get content by category
const getContentByCategory = async (category: string): Promise<ContentItem[]> => {
  try {
    let url = '';
    let type = 'movie';
    
    switch (category) {
      case 'movies':
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`;
        type = 'movie';
        break;
      case 'series':
        url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`;
        type = 'series';
        break;
      case 'anime':
        return getAnime(); // getAnime already uses TMDB_API_KEY
      case 'trending':
        const trendingMovies = await getTrendingMovies(); // Uses TMDB_API_KEY
        const trendingTvShows = await getTrendingTvShows(); // Uses TMDB_API_KEY
        return [...trendingMovies, ...trendingTvShows];
      default:
        // Fallback for unspecified categories, could be trending or a specific genre
        url = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content by category: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => {
      // Determine type from media_type if available
      const itemType = item.media_type || type;
      const contentType = normalizeContentType(itemType === 'tv' ? 'series' : itemType);
      const content = formatContentItem(item, contentType);
      return content;
    });
  } catch (error) {
    console.error(`Error fetching ${category} content:`, error);
    toast.error(`Failed to load ${category} content`);
    return [];
  }
};

// Function to get TV show seasons and episodes
const getTvShowSeasons = async (id: string): Promise<Season[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=season/1,season/2,season/3`; // Example appending specific seasons
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

// Function to get TV show season episodes
const getTvShowEpisodes = async (id: string, seasonNumber: number): Promise<Episode[]> => {
  try {
    const url = `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
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
  getTvShowSeasons,
  getTvShowEpisodes
};

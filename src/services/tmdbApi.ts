
/**
 * API Service for fetching content from TMDB
 */

import { toast } from "sonner";

// Base URLs for TMDB API
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

// API Key for TMDB
const API_KEY = "4626200399b08f9d04b72348e3625f15";

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
}

// Function to format content item
const formatContentItem = (item: any, type: string = 'movie'): ContentItem => {
  const isMovie = type === 'movie';
  return {
    id: item.id.toString(),
    title: isMovie ? item.title : item.name,
    description: item.overview,
    image: item.poster_path ? `${TMDB_POSTER_BASE_URL}${item.poster_path}` : '/placeholder.svg',
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}` : undefined,
    year: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4) || 'N/A',
    duration: isMovie ? '120 min' : 'Seasons: ' + (item.number_of_seasons || 'N/A'),
    rating: (item.vote_average / 2).toFixed(1),
    category: type,
    trailer_key: item.id.toString() // Using ID as a placeholder for trailer key
  };
};

// Function to search content
const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
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
    const url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
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
    const url = `${TMDB_BASE_URL}/trending/tv/day?api_key=${API_KEY}`;
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
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}`;
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
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}`;
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
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch anime: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => {
      const formattedItem = formatContentItem(item, 'series');
      formattedItem.category = 'anime';
      formattedItem.type = 'anime';
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
    // For TV shows, we need to adjust the endpoint
    const endpoint = type === 'series' || type === 'anime' ? 'tv' : type;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If we can't find it as the specified type, try the alternative
      if (type === 'movie') {
        return getContentDetails(id, 'series');
      } else if (type === 'series') {
        return getContentDetails(id, 'movie');
      }
      throw new Error(`Failed to fetch content details: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Also try to fetch videos to get trailers
    try {
      const videosUrl = `${TMDB_BASE_URL}/${endpoint}/${id}/videos?api_key=${API_KEY}`;
      const videosResponse = await fetch(videosUrl);
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        // Find a trailer, teaser, or any video
        const trailer = videosData.results.find((v: any) => 
          v.type === 'Trailer' || v.type === 'Teaser'
        );
        if (trailer) {
          const formattedItem = formatContentItem(data, type);
          formattedItem.trailer_key = trailer.key;
          return formattedItem;
        }
      }
    } catch (e) {
      console.error("Error fetching video details:", e);
    }
    
    return formatContentItem(data, type);
  } catch (error) {
    console.error("Error fetching content details:", error);
    return null;
  }
};

// Function to get similar content
const getSimilarContent = async (id: string, type: string = 'movie'): Promise<ContentItem[]> => {
  try {
    // For TV shows, we need to adjust the endpoint
    const endpoint = type === 'series' || type === 'anime' ? 'tv' : type;
    const url = `${TMDB_BASE_URL}/${endpoint}/${id}/similar?api_key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch similar content: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => formatContentItem(item, type));
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
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}`;
        type = 'movie';
        break;
      case 'series':
        url = `${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}`;
        type = 'series';
        break;
      case 'anime':
        return getAnime();
      case 'trending':
        const trendingMovies = await getTrendingMovies();
        const trendingTvShows = await getTrendingTvShows();
        return [...trendingMovies, ...trendingTvShows];
      default:
        url = `${TMDB_BASE_URL}/trending/all/day?api_key=${API_KEY}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content by category: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => {
      // Determine type from media_type if available
      const itemType = item.media_type || type;
      return formatContentItem(item, itemType === 'tv' ? 'series' : itemType);
    });
  } catch (error) {
    console.error(`Error fetching ${category} content:`, error);
    toast.error(`Failed to load ${category} content`);
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
};

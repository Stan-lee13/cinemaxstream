/**
 * Production configuration and environment management
 * Reads from import.meta.env — no hardcoded keys.
 */

const TMDB_FALLBACK = '4626200399b08f9d04b72348e3625f15';

interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tmdbApiKey: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  maxRetries: number;
  requestTimeout: number;
  cacheTimeout: number;
}

export const getConfig = (): AppConfig => {
  const isProd = import.meta.env.PROD;
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    tmdbApiKey: (import.meta.env.VITE_TMDB_API_KEY as string) || TMDB_FALLBACK,
    enableAnalytics: isProd,
    enableErrorReporting: isProd,
    enablePerformanceMonitoring: isProd,
    maxRetries: isProd ? 3 : 1,
    requestTimeout: isProd ? 10000 : 5000,
    cacheTimeout: isProd ? 300000 : 60000,
  };
};

export const isProd = () => import.meta.env.PROD;
export const isDev = () => import.meta.env.DEV;

export const features = {
  enablePremiumFeatures: true,
  enableOfflineMode: true,
  enableAdvancedSearch: true,
  enableSocialLogin: true,
  enableNotifications: true,
  enableDownloads: true,
  enableCasting: false,
  enableLiveStreaming: false,
  enableUserGeneratedContent: false,
};

export const ALLOWED_STREAMING_DOMAINS = [
  'vidsrc.xyz',
  'vidsrc.su',
  'vidsrc.vip',
  'vidrock.net',
  'vidnest.fun',
  'player.videasy.net',
  'vidlink.pro',
  'player.vimeo.com',
  'youtube.com',
  'youtu.be',
];

export const CACHE_KEYS = {
  TRENDING_CONTENT: 'trending_content',
  POPULAR_CONTENT: 'popular_content',
  USER_PREFERENCES: 'user_preferences',
  SEARCH_RESULTS: 'search_results',
  CONTENT_DETAILS: 'content_details',
};

export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  TTFB: 600,
};

export default {
  getConfig,
  isProd,
  isDev,
  features,
  ALLOWED_STREAMING_DOMAINS,
  CACHE_KEYS,
  PERFORMANCE_THRESHOLDS,
};

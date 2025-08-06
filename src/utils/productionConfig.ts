/**
 * Production configuration and environment management
 */

interface ProductionConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  tmdbApiKey: string;
  stripePublishableKey: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  maxRetries: number;
  requestTimeout: number;
  cacheTimeout: number;
}

// Production configuration
const PRODUCTION_CONFIG: ProductionConfig = {
  apiBaseUrl: 'https://api.yourapp.com',
  supabaseUrl: 'https://otelzbaiqeqlktawuuyv.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZWx6YmFpcWVxbGt0YXd1dXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODMzNzAsImV4cCI6MjA1ODk1OTM3MH0.LYP50GjlDI6-4OqDIQ5n-bMntOv4_UZAqCfYUdXd_7o',
  tmdbApiKey: '4626200399b08f9d04b72348e3625f15',
  stripePublishableKey: 'pk_live_your_stripe_key',
  enableAnalytics: true,
  enableErrorReporting: true,
  enablePerformanceMonitoring: true,
  maxRetries: 3,
  requestTimeout: 10000,
  cacheTimeout: 300000 // 5 minutes
};

// Development configuration
const DEVELOPMENT_CONFIG: ProductionConfig = {
  ...PRODUCTION_CONFIG,
  apiBaseUrl: 'http://localhost:3000',
  stripePublishableKey: 'pk_test_your_stripe_key',
  enableAnalytics: false,
  enableErrorReporting: false,
  enablePerformanceMonitoring: false,
  maxRetries: 1,
  requestTimeout: 5000,
  cacheTimeout: 60000 // 1 minute
};

// Get current configuration based on environment
export const getConfig = (): ProductionConfig => {
  return process.env.NODE_ENV === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
};

// Environment detection
export const isProd = () => process.env.NODE_ENV === 'production';
export const isDev = () => process.env.NODE_ENV === 'development';

// Feature flags
export const features = {
  enablePremiumFeatures: true,
  enableOfflineMode: true,
  enableAdvancedSearch: true,
  enableSocialLogin: true,
  enableNotifications: true,
  enableDownloads: true,
  enableCasting: false, // Disabled until fully implemented
  enableLiveStreaming: false, // Future feature
  enableUserGeneratedContent: false // Future feature
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh'
  },
  content: {
    search: '/content/search',
    details: '/content/:id',
    trending: '/content/trending',
    popular: '/content/popular',
    recommendations: '/content/recommendations'
  },
  user: {
    profile: '/user/profile',
    favorites: '/user/favorites',
    watchHistory: '/user/watch-history',
    downloads: '/user/downloads'
  },
  streaming: {
    sources: '/streaming/sources',
    quality: '/streaming/quality',
    subtitles: '/streaming/subtitles'
  }
};

// Allowed streaming domains for security
export const ALLOWED_STREAMING_DOMAINS = [
  'vidsrc.xyz',
  'vidsrc.su', 
  'vidsrc.vip',
  'player.vimeo.com',
  'youtube.com',
  'youtu.be'
];

// Cache configurations
export const CACHE_KEYS = {
  TRENDING_CONTENT: 'trending_content',
  POPULAR_CONTENT: 'popular_content',
  USER_PREFERENCES: 'user_preferences',
  SEARCH_RESULTS: 'search_results',
  CONTENT_DETAILS: 'content_details'
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTFB: 600  // Time to First Byte (ms)
};

export default {
  getConfig,
  isProd,
  isDev,
  features,
  API_ENDPOINTS,
  ALLOWED_STREAMING_DOMAINS,
  CACHE_KEYS,
  PERFORMANCE_THRESHOLDS
};
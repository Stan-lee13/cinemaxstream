/**
 * Production-ready type definitions
 */

// Replace all 'any' types with proper interfaces
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
  message?: string;
}

export interface VideoPlayerConfig {
  src: string;
  type: 'iframe' | 'direct';
  provider: string;
  quality?: 'auto' | '720p' | '1080p' | '4k';
  autoplay?: boolean;
  muted?: boolean;
}

export interface ContentMetadata {
  id: string;
  title: string;
  description?: string;
  image: string;
  poster: string;
  backdrop?: string;
  year: string;
  duration: string;
  rating: string;
  category: string;
  type: string;
  content_type: string;
  trailer_key?: string;
  is_premium?: boolean;
}

export interface StreamingProvider {
  id: string;
  name: string;
  url: string;
  quality: string[];
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'free' | 'pro' | 'premium';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ErrorContext {
  component: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  unit: 'ms' | 'score' | 'bytes';
}

export interface SecurityConfig {
  allowedDomains: string[];
  csrfToken?: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

// Production environment configuration
export interface ProductionConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  security: SecurityConfig;
}

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

// Error reporting types
export interface ErrorReport {
  message: string;
  stack?: string;
  component: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: ErrorContext;
}
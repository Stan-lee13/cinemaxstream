/**
 * Production-ready API client with retry logic, caching, and error handling
 */

import { getConfig } from './productionConfig';
import { errorReporter } from './errorReporting';
import { rateLimit, getSecurityHeaders } from './securityUtils';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class ApiClient {
  private config: ApiClientConfig;
  private cache = new Map<string, CacheItem>();

  constructor() {
    const appConfig = getConfig();
    this.config = {
      baseURL: appConfig.apiBaseUrl,
      timeout: appConfig.requestTimeout,
      maxRetries: appConfig.maxRetries,
      retryDelay: 1000
    };
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
  }

  private isValidCacheItem(item: CacheItem): boolean {
    return Date.now() < item.expiry;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = this.config.maxRetries
  ): Promise<Response> {
    try {
      // Apply rate limiting
      if (!rateLimit(url)) {
        throw new Error('Rate limit exceeded');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...getSecurityHeaders(),
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retries > 0 && !(error as Error).name.includes('AbortError')) {
        await this.delay(this.config.retryDelay);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: any, cacheTime?: number): Promise<T> {
    const fullUrl = `${this.config.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(fullUrl, params);

    // Check cache first
    if (cacheTime && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (this.isValidCacheItem(cached)) {
        return cached.data;
      }
    }

    try {
      const url = params 
        ? `${fullUrl}?${new URLSearchParams(params).toString()}`
        : fullUrl;

      const response = await this.fetchWithRetry(url, {
        method: 'GET'
      });

      const data = await response.json();

      // Cache the response if cacheTime is specified
      if (cacheTime) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + cacheTime
        });
      }

      return data;
    } catch (error) {
      errorReporter.captureException(error as Error, 'ApiClient.get');
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      });

      return await response.json();
    } catch (error) {
      errorReporter.captureException(error as Error, 'ApiClient.post');
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
      });

      return await response.json();
    } catch (error) {
      errorReporter.captureException(error as Error, 'ApiClient.put');
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'DELETE'
      });

      return await response.json();
    } catch (error) {
      errorReporter.captureException(error as Error, 'ApiClient.delete');
      throw error;
    }
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient;
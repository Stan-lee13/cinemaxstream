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
  data: unknown;
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

  private getCacheKey(url: string, params?: Record<string, string | number | boolean> | URLSearchParams): string {
    if (!params) return url;
    if (params instanceof URLSearchParams) {
      return `${url}?${params.toString()}`;
    }

    const entries = Object.entries(params).map(([k, v]) => [k, String(v)]) as [string, string][];
    return `${url}?${new URLSearchParams(entries).toString()}`;
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

      // Merge headers safely - fix type issues
      const securityHeaders = getSecurityHeaders() || {};
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Safely merge security headers if they exist and are valid
      if (typeof securityHeaders === 'object' && securityHeaders !== null) {
        try {
          const entries = Object.entries(securityHeaders);
          entries.forEach(([key, value]) => {
            if (typeof key === 'string' && typeof value === 'string') {
              defaultHeaders[key] = value;
            }
          });
        } catch (e) {
          // Ignore invalid security headers
        }
      }

      const mergeHeaders = (incoming?: HeadersInit): Record<string, string> => {
        const out: Record<string, string> = { ...defaultHeaders };
        if (!incoming) return out;
        if (incoming instanceof Headers) {
          incoming.forEach((value, key) => { out[key] = value; });
        } else if (Array.isArray(incoming)) {
          incoming.forEach(([k, v]) => { out[k] = v; });
        } else if (typeof incoming === 'object') {
          Object.entries(incoming as Record<string, string>).forEach(([k, v]) => {
            out[k] = String(v);
          });
        }
        return out;
      };

      const headers = mergeHeaders(options.headers);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err: unknown) {
      const errName = (err as { name?: string }).name;
      const isAbort = errName === 'AbortError' || errName === 'DOMException';
      if (retries > 0 && !isAbort) {
        await this.delay(this.config.retryDelay);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw err;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean> | URLSearchParams, cacheTime?: number): Promise<T> {
    const fullUrl = `${this.config.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(fullUrl, params);

    // Check cache first
    if (cacheTime && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (this.isValidCacheItem(cached)) {
        return cached.data as T;
      }
    }

    try {
      const url = params instanceof URLSearchParams
        ? `${fullUrl}?${params.toString()}`
        : params
          ? `${fullUrl}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}`
          : fullUrl;

      const response = await this.fetchWithRetry(url, {
        method: 'GET'
      });

  const data = (await response.json()) as T;

      // Cache the response if cacheTime is specified
      if (cacheTime) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + cacheTime
        });
      }

      return data;
    } catch (err: unknown) {
      errorReporter.captureException(err as Error, 'ApiClient.get');
      throw err;
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers: { 'Content-Type': 'application/json' }
      });

      return (await response.json()) as T;
    } catch (err: unknown) {
      errorReporter.captureException(err as Error, 'ApiClient.post');
      throw err;
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers: { 'Content-Type': 'application/json' }
      });

      return (await response.json()) as T;
    } catch (err: unknown) {
      errorReporter.captureException(err as Error, 'ApiClient.put');
      throw err;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseURL}${endpoint}`, {
        method: 'DELETE'
      });

      return (await response.json()) as T;
    } catch (err: unknown) {
      errorReporter.captureException(err as Error, 'ApiClient.delete');
      throw err;
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
/**
 * Rate Limiting Utility
 * Token bucket algorithm for API rate limiting
 */

export interface RateLimitConfig {
    maxTokens: number;
    refillRate: number; // tokens per second
    refillInterval?: number; // milliseconds
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number; // seconds
}

class TokenBucket {
    private tokens: number;
    private lastRefill: number;
    private config: Required<RateLimitConfig>;

    constructor(config: RateLimitConfig) {
        this.config = {
            maxTokens: config.maxTokens,
            refillRate: config.refillRate,
            refillInterval: config.refillInterval || 1000
        };
        this.tokens = config.maxTokens;
        this.lastRefill = Date.now();
    }

    /**
     * Try to consume a token
     */
    consume(tokens: number = 1): RateLimitResult {
        this.refill();

        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return {
                allowed: true,
                remaining: Math.floor(this.tokens),
                resetAt: this.getResetTime()
            };
        }

        const retryAfter = Math.ceil((tokens - this.tokens) / this.config.refillRate);
        return {
            allowed: false,
            remaining: Math.floor(this.tokens),
            resetAt: this.getResetTime(),
            retryAfter
        };
    }

    /**
     * Refill tokens based on time elapsed
     */
    private refill(): void {
        const now = Date.now();
        const timePassed = now - this.lastRefill;
        const tokensToAdd = (timePassed / this.config.refillInterval) * this.config.refillRate;

        this.tokens = Math.min(this.config.maxTokens, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    /**
     * Get time when bucket will be full
     */
    private getResetTime(): Date {
        const tokensNeeded = this.config.maxTokens - this.tokens;
        const timeNeeded = (tokensNeeded / this.config.refillRate) * this.config.refillInterval;
        return new Date(Date.now() + timeNeeded);
    }

    /**
     * Get current token count
     */
    getTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }

    /**
     * Reset bucket to full
     */
    reset(): void {
        this.tokens = this.config.maxTokens;
        this.lastRefill = Date.now();
    }
}

class RateLimiter {
    private buckets: Map<string, TokenBucket> = new Map();
    private defaultConfig: RateLimitConfig = {
        maxTokens: 100,
        refillRate: 10 // 10 requests per second
    };

    /**
     * Check if request is allowed
     */
    checkLimit(
        key: string,
        config?: RateLimitConfig,
        tokens: number = 1
    ): RateLimitResult {
        const bucket = this.getBucket(key, config);
        return bucket.consume(tokens);
    }

    /**
     * Get or create bucket for key
     */
    private getBucket(key: string, config?: RateLimitConfig): TokenBucket {
        if (!this.buckets.has(key)) {
            this.buckets.set(key, new TokenBucket(config || this.defaultConfig));
        }
        return this.buckets.get(key)!;
    }

    /**
     * Reset rate limit for key
     */
    reset(key: string): void {
        const bucket = this.buckets.get(key);
        if (bucket) {
            bucket.reset();
        }
    }

    /**
     * Clear all rate limits
     */
    clearAll(): void {
        this.buckets.clear();
    }

    /**
     * Get remaining tokens for key
     */
    getRemaining(key: string): number {
        const bucket = this.buckets.get(key);
        return bucket ? bucket.getTokens() : this.defaultConfig.maxTokens;
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different services
 */
export const RATE_LIMITS = {
    // TMDB API: 40 requests per 10 seconds
    TMDB_API: {
        maxTokens: 40,
        refillRate: 4, // 4 per second = 40 per 10 seconds
        refillInterval: 1000
    },

    // Supabase: 100 requests per minute per user
    SUPABASE_USER: {
        maxTokens: 100,
        refillRate: 100 / 60, // ~1.67 per second
        refillInterval: 1000
    },

    // Search: 20 requests per minute
    SEARCH: {
        maxTokens: 20,
        refillRate: 20 / 60, // ~0.33 per second
        refillInterval: 1000
    },

    // Video streaming: 10 streams per minute
    STREAMING: {
        maxTokens: 10,
        refillRate: 10 / 60, // ~0.17 per second
        refillInterval: 1000
    },

    // Downloads: 5 per minute
    DOWNLOADS: {
        maxTokens: 5,
        refillRate: 5 / 60, // ~0.08 per second
        refillInterval: 1000
    },

    // Authentication: 5 attempts per minute
    AUTH: {
        maxTokens: 5,
        refillRate: 5 / 60,
        refillInterval: 1000
    }
};

/**
 * Decorator for rate-limited functions
 */
export function rateLimit(
    keyPrefix: string,
    config: RateLimitConfig
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const key = `${keyPrefix}:${propertyKey}`;
            const result = rateLimiter.checkLimit(key, config);

            if (!result.allowed) {
                throw new Error(
                    `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
                );
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

/**
 * Rate limit middleware for async functions
 */
export async function withRateLimit<T>(
    key: string,
    config: RateLimitConfig,
    fn: () => Promise<T>
): Promise<T> {
    const result = rateLimiter.checkLimit(key, config);

    if (!result.allowed) {
        throw new Error(
            `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
        );
    }

    return fn();
}

/**
 * Get rate limit status for display
 */
export function getRateLimitStatus(key: string): {
    remaining: number;
    isLimited: boolean;
} {
    const remaining = rateLimiter.getRemaining(key);
    return {
        remaining,
        isLimited: remaining === 0
    };
}

/**
 * Cache Service
 * Provides caching functionality for performance optimization
 * Supports in-memory cache and Cloudflare KV (when available)
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private kvNamespace?: KVNamespace;
  private defaultTTL: number = 300; // 5 minutes

  constructor(kvNamespace?: KVNamespace) {
    this.kvNamespace = kvNamespace;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (Date.now() < memoryEntry.expiresAt) {
        console.log(`✅ Cache hit (memory): ${key}`);
        return memoryEntry.data as T;
      } else {
        // Expired, remove from cache
        this.memoryCache.delete(key);
      }
    }

    // Try KV if available
    if (this.kvNamespace) {
      try {
        const kvValue = await this.kvNamespace.get(key, { type: 'json' });
        if (kvValue) {
          console.log(`✅ Cache hit (KV): ${key}`);
          // Store in memory for faster access
          const entry: CacheEntry<T> = {
            data: kvValue,
            expiresAt: Date.now() + this.defaultTTL * 1000,
            tags: [],
          };
          this.memoryCache.set(key, entry);
          return kvValue as T;
        }
      } catch (error) {
        console.error('❌ KV cache read error:', error);
      }
    }

    console.log(`❌ Cache miss: ${key}`);
    return null;
  }

  /**
   * Set cached value
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.defaultTTL;
    const tags = options.tags || [];

    // Store in memory
    const entry: CacheEntry<T> = {
      data: value,
      expiresAt: Date.now() + ttl * 1000,
      tags,
    };
    this.memoryCache.set(key, entry);
    console.log(`💾 Cached (memory): ${key} (TTL: ${ttl}s)`);

    // Store in KV if available
    if (this.kvNamespace) {
      try {
        await this.kvNamespace.put(key, JSON.stringify(value), {
          expirationTtl: ttl,
        });
        console.log(`💾 Cached (KV): ${key} (TTL: ${ttl}s)`);
      } catch (error) {
        console.error('❌ KV cache write error:', error);
      }
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.kvNamespace) {
      try {
        await this.kvNamespace.delete(key);
        console.log(`🗑️ Deleted from cache: ${key}`);
      } catch (error) {
        console.error('❌ KV cache delete error:', error);
      }
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToDelete: string[] = [];

    // Find keys with matching tags in memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    // Delete from memory
    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
    }

    console.log(`🗑️ Invalidated ${keysToDelete.length} entries by tags: ${tags.join(', ')}`);

    // Note: KV doesn't support tag-based invalidation
    // You would need to maintain a separate index for this
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    console.log('🗑️ Cleared all memory cache');
    
    // Note: KV cannot be cleared programmatically
    // You would need to delete keys individually
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.memoryCache.values()) {
      if (now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.memoryCache.size,
      validEntries,
      expiredEntries,
      kvEnabled: !!this.kvNamespace,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
    }

    console.log(`🧹 Cleaned ${keysToDelete.length} expired entries`);
    return keysToDelete.length;
  }
}

/**
 * Cache decorator for functions
 */
export function Cacheable(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = (this as any).cache as CacheService | undefined;
      
      if (!cache) {
        // No cache service available, call original method
        return originalMethod.apply(this, args);
      }

      // Generate cache key from method name and arguments
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cachedValue = await cache.get(cacheKey);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Call original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cache.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}

/**
 * Response cache middleware for Hono
 */
export function cacheMiddleware(cache: CacheService, options: CacheOptions = {}) {
  return async (c: any, next: any) => {
    const method = c.req.method;
    
    // Only cache GET requests
    if (method !== 'GET') {
      return next();
    }

    const cacheKey = `response:${c.req.url}`;
    
    // Try to get from cache
    const cachedResponse = await cache.get<any>(cacheKey);
    if (cachedResponse) {
      return c.json(cachedResponse);
    }

    // Continue to handler
    await next();

    // Cache response if it's a success
    const response = await c.res.clone();
    if (response.ok) {
      const data = await response.json();
      await cache.set(cacheKey, data, options);
    }
  };
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(kvNamespace?: KVNamespace): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService(kvNamespace);
  }
  return cacheServiceInstance;
}

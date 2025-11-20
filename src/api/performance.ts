/**
 * Performance Monitoring API Routes
 * Provides endpoints for cache and query optimization statistics
 */

import { Hono } from 'hono';
import { getCacheService } from '../services/cache.service';

type Bindings = {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// CACHE STATISTICS
// ============================================================================

/**
 * GET /api/performance/cache/stats
 * Get cache statistics
 */
app.get('/cache/stats', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    const stats = cache.getStats();

    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Cache stats error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get cache stats',
    }, 500);
  }
});

/**
 * POST /api/performance/cache/clear
 * Clear all cache
 */
app.post('/cache/clear', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    await cache.clear();

    return c.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error: any) {
    console.error('❌ Clear cache error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to clear cache',
    }, 500);
  }
});

/**
 * POST /api/performance/cache/clean
 * Clean expired cache entries
 */
app.post('/cache/clean', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    const cleaned = cache.cleanExpired();

    return c.json({
      success: true,
      message: `Cleaned ${cleaned} expired entries`,
      cleaned,
    });
  } catch (error: any) {
    console.error('❌ Clean cache error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to clean cache',
    }, 500);
  }
});

/**
 * DELETE /api/performance/cache/:key
 * Delete specific cache entry
 */
app.delete('/cache/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const cache = getCacheService(c.env.CACHE_KV);
    await cache.delete(key);

    return c.json({
      success: true,
      message: `Cache entry deleted: ${key}`,
    });
  } catch (error: any) {
    console.error('❌ Delete cache error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to delete cache entry',
    }, 500);
  }
});

/**
 * POST /api/performance/cache/invalidate
 * Invalidate cache by tags
 * 
 * Body: { tags: string[] }
 */
app.post('/cache/invalidate', async (c) => {
  try {
    const { tags } = await c.req.json();
    
    if (!tags || !Array.isArray(tags)) {
      return c.json({
        success: false,
        error: 'tags array is required',
      }, 400);
    }

    const cache = getCacheService(c.env.CACHE_KV);
    await cache.invalidateByTags(tags);

    return c.json({
      success: true,
      message: `Invalidated cache for tags: ${tags.join(', ')}`,
    });
  } catch (error: any) {
    console.error('❌ Invalidate cache error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to invalidate cache',
    }, 500);
  }
});

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

/**
 * GET /api/performance/metrics
 * Get overall performance metrics
 */
app.get('/metrics', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    const cacheStats = cache.getStats();

    // Calculate cache hit rate
    const hitRate = cacheStats.validEntries > 0
      ? ((cacheStats.validEntries / cacheStats.totalEntries) * 100).toFixed(2)
      : '0.00';

    return c.json({
      success: true,
      metrics: {
        cache: {
          ...cacheStats,
          hitRate: `${hitRate}%`,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Metrics error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get metrics',
    }, 500);
  }
});

/**
 * GET /api/performance/health
 * Performance health check
 */
app.get('/health', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    const cacheStats = cache.getStats();

    const health = {
      status: 'healthy',
      cache: {
        enabled: true,
        kvEnabled: cacheStats.kvEnabled,
        entries: cacheStats.validEntries,
      },
      optimizations: {
        caching: true,
        queryOptimization: true,
        browserCaching: true,
      },
      timestamp: new Date().toISOString(),
    };

    return c.json({
      success: true,
      health,
    });
  } catch (error: any) {
    console.error('❌ Health check error:', error);
    return c.json({
      success: false,
      error: error.message || 'Health check failed',
    }, 500);
  }
});

// ============================================================================
// OPTIMIZATION RECOMMENDATIONS
// ============================================================================

/**
 * GET /api/performance/recommendations
 * Get performance optimization recommendations
 */
app.get('/recommendations', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);
    const cacheStats = cache.getStats();

    const recommendations: any[] = [];

    // Check cache size
    if (cacheStats.totalEntries > 500) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Cache has many entries - consider implementing cache eviction policy',
        action: 'Review cache TTL settings and implement LRU eviction',
      });
    }

    // Check expired entries
    if (cacheStats.expiredEntries > 50) {
      recommendations.push({
        type: 'cache',
        priority: 'low',
        message: `${cacheStats.expiredEntries} expired cache entries detected`,
        action: 'Run cache cleanup: POST /api/performance/cache/clean',
      });
    }

    // Check KV availability
    if (!cacheStats.kvEnabled) {
      recommendations.push({
        type: 'infrastructure',
        priority: 'high',
        message: 'Cloudflare KV not configured - using memory cache only',
        action: 'Configure CACHE_KV namespace in wrangler.jsonc for persistent caching',
      });
    }

    // General recommendations
    recommendations.push({
      type: 'general',
      priority: 'low',
      message: 'Consider implementing CDN for static assets',
      action: 'Use Cloudflare CDN with appropriate cache headers',
    });

    recommendations.push({
      type: 'general',
      priority: 'low',
      message: 'Implement lazy loading for heavy components',
      action: 'Use dynamic imports for Three.js and Chart.js',
    });

    return c.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    console.error('❌ Recommendations error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get recommendations',
    }, 500);
  }
});

// ============================================================================
// TEST ENDPOINT
// ============================================================================

/**
 * GET /api/performance/test
 * Test performance optimization features
 */
app.get('/test', async (c) => {
  try {
    const cache = getCacheService(c.env.CACHE_KV);

    // Test cache set/get
    const testKey = 'test:performance';
    const testValue = { message: 'Performance test', timestamp: Date.now() };
    
    await cache.set(testKey, testValue, { ttl: 60 });
    const retrieved = await cache.get(testKey);

    // Get stats
    const stats = cache.getStats();

    return c.json({
      success: true,
      test: {
        cacheSet: testValue,
        cacheGet: retrieved,
        cacheWorking: JSON.stringify(testValue) === JSON.stringify(retrieved),
        stats,
      },
      message: '✅ Performance optimization test completed',
    });
  } catch (error: any) {
    console.error('❌ Performance test error:', error);
    return c.json({
      success: false,
      error: error.message || 'Performance test failed',
    }, 500);
  }
});

export default app;

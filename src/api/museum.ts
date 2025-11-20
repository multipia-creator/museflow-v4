/**
 * Museum API Routes
 * Endpoints for museum artwork search and data
 */

import { Hono } from 'hono';
import { initMuseumAPI } from '../services/museum-api.service';
import { DatabaseService } from '../services/database.service';

type Bindings = {
  DB: D1Database;
  MUSEUM_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Search artworks
 * GET /api/museum/search
 * 
 * Query params:
 * - q: search query
 * - category: artwork category
 * - period: time period
 * - artist: artist name
 * - limit: results per page (default: 20)
 * - offset: pagination offset (default: 0)
 */
app.get('/search', async (c) => {
  try {
    const apiKey = c.env.MUSEUM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Museum API key not configured',
      }, 503);
    }

    const museumAPI = initMuseumAPI(apiKey);

    const query = c.req.query('q') || '';
    const category = c.req.query('category') || '';
    const period = c.req.query('period') || '';
    const artist = c.req.query('artist') || '';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    console.log(`🔍 Museum search: "${query}"`);

    const result = await museumAPI.searchArtworks({
      query,
      category,
      period,
      artist,
      limit,
      offset,
    });

    // Cache results in D1
    const db = new DatabaseService(c.env.DB);
    for (const artwork of result.artworks) {
      try {
        await db.cacheMuseumData(
          `/search?q=${query}`,
          { q: query, category, period, artist },
          result
        );
        break; // Cache once per search
      } catch (e) {
        console.warn('Failed to cache result:', e);
      }
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Museum search error:', error);
    return c.json({
      success: false,
      error: error.message || 'Search failed',
    }, 500);
  }
});

/**
 * Get artwork by ID
 * GET /api/museum/artwork/:id
 */
app.get('/artwork/:id', async (c) => {
  try {
    const apiKey = c.env.MUSEUM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Museum API key not configured',
      }, 503);
    }

    const museumAPI = initMuseumAPI(apiKey);
    const id = c.req.param('id');

    const artwork = await museumAPI.getArtwork(id);

    if (!artwork) {
      return c.json({
        success: false,
        error: 'Artwork not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: artwork,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get available categories
 * GET /api/museum/categories
 */
app.get('/categories', async (c) => {
  try {
    const apiKey = c.env.MUSEUM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Museum API key not configured',
      }, 503);
    }

    const museumAPI = initMuseumAPI(apiKey);
    const categories = await museumAPI.getCategories();

    return c.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get available periods
 * GET /api/museum/periods
 */
app.get('/periods', async (c) => {
  try {
    const apiKey = c.env.MUSEUM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Museum API key not configured',
      }, 503);
    }

    const museumAPI = initMuseumAPI(apiKey);
    const periods = await museumAPI.getPeriods();

    return c.json({
      success: true,
      data: periods,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get cached museum data
 * GET /api/museum/cache
 */
app.get('/cache', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const endpoint = c.req.query('endpoint') || '';
    const limit = parseInt(c.req.query('limit') || '10');

    const result = await c.env.DB.prepare(`
      SELECT * FROM museum_data_cache
      WHERE api_endpoint LIKE ?
      ORDER BY cached_at DESC
      LIMIT ?
    `).bind(`%${endpoint}%`, limit).all();

    return c.json({
      success: true,
      data: result.results || [],
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Test museum API connection
 * GET /api/museum/test
 */
app.get('/test', async (c) => {
  try {
    const apiKey = c.env.MUSEUM_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Museum API key not configured',
        message: 'Please add MUSEUM_API_KEY to your environment variables',
      }, 503);
    }

    const museumAPI = initMuseumAPI(apiKey);
    
    // Try a simple search
    const result = await museumAPI.searchArtworks({ limit: 1 });
    
    return c.json({
      success: true,
      message: 'Museum API connection successful',
      sampleResult: result.artworks[0] || null,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;

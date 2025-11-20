/**
 * 3D Models API Routes
 * Endpoints for KCISA 3D cultural heritage models
 */

import { Hono } from 'hono';
import { initKCISA3D } from '../services/kcisa-3d.service';
import { DatabaseService } from '../services/database.service';

type Bindings = {
  DB: D1Database;
  KCISA_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Search 3D models
 * GET /api/3d-models/search
 * 
 * Query params:
 * - q: search query
 * - category: model category
 * - period: time period
 * - museum: museum name
 * - format: model format (glb, gltf, obj, fbx)
 * - minPolyCount: minimum polygon count
 * - maxPolyCount: maximum polygon count
 * - limit: results per page
 * - offset: pagination offset
 */
app.get('/search', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
      }, 503);
    }

    const kcisa3D = initKCISA3D(apiKey);

    const query = c.req.query('q') || '';
    const category = c.req.query('category') || '';
    const period = c.req.query('period') || '';
    const museum = c.req.query('museum') || '';
    const format = (c.req.query('format') || 'glb') as 'glb' | 'gltf' | 'obj' | 'fbx';
    const minPolyCount = parseInt(c.req.query('minPolyCount') || '0');
    const maxPolyCount = parseInt(c.req.query('maxPolyCount') || '1000000');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    console.log(`🎨 3D model search: "${query}"`);

    const result = await kcisa3D.search3DModels({
      query,
      category,
      period,
      museum,
      format,
      minPolyCount,
      maxPolyCount,
      limit,
      offset,
    });

    // Cache results in D1
    const db = new DatabaseService(c.env.DB);
    for (const model of result.models) {
      try {
        await db.cacheMuseumData(
          `/3d-models/search?q=${query}`,
          { q: query, category, format },
          result
        );
        break; // Cache once per search
      } catch (e) {
        console.warn('Failed to cache 3D result:', e);
      }
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ 3D model search error:', error);
    return c.json({
      success: false,
      error: error.message || 'Search failed',
    }, 500);
  }
});

/**
 * Get 3D model by ID
 * GET /api/3d-models/:id
 */
app.get('/:id', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
      }, 503);
    }

    const kcisa3D = initKCISA3D(apiKey);
    const id = c.req.param('id');

    const model = await kcisa3D.get3DModel(id);

    if (!model) {
      return c.json({
        success: false,
        error: '3D model not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: model,
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
 * GET /api/3d-models/categories
 */
app.get('/meta/categories', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
      }, 503);
    }

    const kcisa3D = initKCISA3D(apiKey);
    const categories = await kcisa3D.getCategories();

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
 * Get supported formats
 * GET /api/3d-models/formats
 */
app.get('/meta/formats', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
      }, 503);
    }

    const kcisa3D = initKCISA3D(apiKey);
    const formats = kcisa3D.getSupportedFormats();

    return c.json({
      success: true,
      data: formats,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Validate model URL
 * POST /api/3d-models/validate
 * 
 * Body: { url: string }
 */
app.post('/validate', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
      }, 503);
    }

    const { url } = await c.req.json();

    if (!url) {
      return c.json({
        success: false,
        error: 'URL is required',
      }, 400);
    }

    const kcisa3D = initKCISA3D(apiKey);
    const isValid = await kcisa3D.validateModelUrl(url);
    const fileSize = isValid ? await kcisa3D.getModelFileSize(url) : null;

    return c.json({
      success: true,
      data: {
        url,
        isValid,
        fileSize,
        fileSizeMB: fileSize ? (fileSize / 1024 / 1024).toFixed(2) : null,
      },
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Test KCISA 3D API connection
 * GET /api/3d-models/test
 */
app.get('/test', async (c) => {
  try {
    const apiKey = c.env.KCISA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'KCISA API key not configured',
        message: 'Please add KCISA_API_KEY to your environment variables',
      }, 503);
    }

    const kcisa3D = initKCISA3D(apiKey);
    
    // Try a simple search
    const result = await kcisa3D.search3DModels({ limit: 1 });
    
    return c.json({
      success: true,
      message: 'KCISA 3D API connection successful',
      sampleModel: result.models[0] || null,
      supportedFormats: kcisa3D.getSupportedFormats(),
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;

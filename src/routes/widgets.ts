import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const widgets = new Hono<{ Bindings: Bindings }>();

// Enable CORS
widgets.use('/*', cors());

/**
 * GET /api/widgets
 * Get all widgets with optional filtering
 * Query params:
 *   - category: filter by category (e.g., "AI 기능", "전시")
 *   - search: search by name or description
 *   - type: filter by widget type
 */
widgets.get('/', async (c) => {
  try {
    const { DB } = c.env;
    const category = c.req.query('category');
    const search = c.req.query('search');
    const type = c.req.query('type');

    let query = 'SELECT * FROM widgets WHERE 1=1';
    const params: string[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY category, name';

    const stmt = params.length > 0 
      ? DB.prepare(query).bind(...params)
      : DB.prepare(query);

    const result = await stmt.all();

    return c.json({
      success: true,
      data: result.results || [],
      count: result.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Widget fetch error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0
    }, 500);
  }
});

/**
 * GET /api/widgets/categories
 * Get all widget categories with counts
 */
widgets.get('/categories', async (c) => {
  try {
    const { DB } = c.env;

    const result = await DB.prepare(`
      SELECT 
        category,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT icon) as icons
      FROM widgets 
      GROUP BY category 
      ORDER BY count DESC, category
    `).all();

    return c.json({
      success: true,
      data: result.results || [],
      count: result.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0
    }, 500);
  }
});

/**
 * GET /api/widgets/:id
 * Get single widget by ID
 */
widgets.get('/:id', async (c) => {
  try {
    const { DB } = c.env;
    const id = c.req.param('id');

    const result = await DB.prepare('SELECT * FROM widgets WHERE id = ?')
      .bind(id)
      .first();

    if (!result) {
      return c.json({
        success: false,
        error: 'Widget not found',
        data: null
      }, 404);
    }

    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Widget fetch error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, 500);
  }
});

export default widgets;

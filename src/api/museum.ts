/**
 * Museum API Routes
 * Endpoints for museum artwork search and data
 */

import { Hono } from 'hono';
import { initMuseumAPI } from '../services/museum-api.service';
import { initSomaMuseum } from '../services/soma-museum.service';
import { DatabaseService } from '../services/database.service';
import { initEmbedding } from '../services/embedding.service';

type Bindings = {
  DB: D1Database;
  MUSEUM_API_KEY?: string;
  SOMA_API_KEY?: string;
  GEMINI_API_KEY: string;
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
 * Semantic search using embeddings
 * POST /api/museum/semantic-search
 * 
 * Body: { query: string, limit?: number }
 */
app.post('/semantic-search', async (c) => {
  try {
    const { query, limit = 10 } = await c.req.json();

    if (!query) {
      return c.json({
        success: false,
        error: 'Query is required',
      }, 400);
    }

    console.log(`🔍 Semantic search: "${query}"`);

    // Initialize embedding service
    const embeddingService = initEmbedding(c.env.GEMINI_API_KEY);

    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Get all artworks with embeddings from Knowledge Graph
    const db = new DatabaseService(c.env.DB);
    const result = await c.env.DB.prepare(`
      SELECT * FROM knowledge_entities
      WHERE entity_type = 'artwork'
      AND embedding_vector IS NOT NULL
      LIMIT 100
    `).all();

    const entities = result.results || [];

    // Calculate similarities
    const candidates = entities.map((entity: any) => ({
      id: entity.id,
      embedding: JSON.parse(entity.embedding_vector),
      data: entity,
    }));

    const similarities = embeddingService.findMostSimilar(
      queryEmbedding.embedding,
      candidates,
      limit
    );

    // Format results
    const artworks = similarities.map(sim => {
      const entity = candidates.find(c => c.id === sim.id);
      if (!entity) return null;

      const props = JSON.parse(entity.data.properties);
      return {
        id: entity.data.id,
        title: entity.data.name,
        description: entity.data.description,
        similarity: sim.similarity,
        ...props,
      };
    }).filter(Boolean);

    return c.json({
      success: true,
      data: {
        artworks,
        query,
        total: artworks.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Semantic search error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Generate embeddings for artworks
 * POST /api/museum/generate-embeddings
 * 
 * Body: { artworkIds?: string[] } (if empty, generates for all)
 */
app.post('/generate-embeddings', async (c) => {
  try {
    const { artworkIds } = await c.req.json();

    console.log('🔮 Generating embeddings...');

    const db = new DatabaseService(c.env.DB);
    const embeddingService = initEmbedding(c.env.GEMINI_API_KEY);

    // Get artworks to process
    let query = `
      SELECT * FROM knowledge_entities
      WHERE entity_type = 'artwork'
    `;

    if (artworkIds && artworkIds.length > 0) {
      const placeholders = artworkIds.map(() => '?').join(',');
      query += ` AND id IN (${placeholders})`;
    }

    query += ' LIMIT 50'; // Process in batches

    const result = await c.env.DB.prepare(query)
      .bind(...(artworkIds || []))
      .all();

    const entities = result.results || [];
    let processed = 0;
    let errors = 0;

    // Generate embeddings
    for (const entity of entities) {
      try {
        const props = JSON.parse(entity.properties);
        
        // Generate text representation
        const text = embeddingService.generateArtworkText({
          title: entity.name,
          artist: props.artist || 'Unknown',
          period: props.period || 'Unknown',
          category: props.category || 'General',
          material: props.material,
          description: entity.description,
        });

        // Generate embedding
        const embedding = await embeddingService.generateEmbedding(text);

        // Update entity
        await c.env.DB.prepare(`
          UPDATE knowledge_entities
          SET embedding_vector = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(JSON.stringify(embedding.embedding), entity.id).run();

        processed++;
      } catch (error) {
        console.error(`Failed to generate embedding for ${entity.id}:`, error);
        errors++;
      }
    }

    return c.json({
      success: true,
      message: `Generated embeddings for ${processed} artworks`,
      processed,
      errors,
      total: entities.length,
    });
  } catch (error: any) {
    console.error('❌ Embedding generation error:', error);
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

/**
 * Search artworks from Soma Museum
 * GET /api/museum/soma/search
 */
app.get('/soma/search', async (c) => {
  try {
    const apiKey = c.env.SOMA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Soma Museum API key not configured',
      }, 503);
    }

    const somaAPI = initSomaMuseum(apiKey);

    const query = c.req.query('q') || '';
    const category = c.req.query('category') || '';
    const artist = c.req.query('artist') || '';
    const year = c.req.query('year') || '';
    const genre = c.req.query('genre') || '';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    console.log(`🔍 Soma Museum search: "${query}"`);

    const result = await somaAPI.searchArtworks({
      query,
      category,
      artist,
      year,
      genre,
      limit,
      offset,
    });

    // Cache results in D1
    const db = new DatabaseService(c.env.DB);
    for (const artwork of result.artworks) {
      try {
        await db.cacheMuseumData(
          `/soma/search?q=${query}`,
          { q: query, category, artist, year, genre },
          result
        );
        break; // Cache once per search
      } catch (e) {
        console.warn('Failed to cache Soma result:', e);
      }
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Soma Museum search error:', error);
    return c.json({
      success: false,
      error: error.message || 'Soma search failed',
    }, 500);
  }
});

/**
 * Get Soma artwork by ID
 * GET /api/museum/soma/artwork/:id
 */
app.get('/soma/artwork/:id', async (c) => {
  try {
    const apiKey = c.env.SOMA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Soma Museum API key not configured',
      }, 503);
    }

    const somaAPI = initSomaMuseum(apiKey);
    const id = c.req.param('id');

    const artwork = await somaAPI.getArtwork(id);

    if (!artwork) {
      return c.json({
        success: false,
        error: 'Soma artwork not found',
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
 * Get Soma Museum categories
 * GET /api/museum/soma/categories
 */
app.get('/soma/categories', async (c) => {
  try {
    const apiKey = c.env.SOMA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Soma Museum API key not configured',
      }, 503);
    }

    const somaAPI = initSomaMuseum(apiKey);
    const categories = await somaAPI.getCategories();

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
 * Get Soma Museum genres
 * GET /api/museum/soma/genres
 */
app.get('/soma/genres', async (c) => {
  try {
    const apiKey = c.env.SOMA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Soma Museum API key not configured',
      }, 503);
    }

    const somaAPI = initSomaMuseum(apiKey);
    const genres = await somaAPI.getGenres();

    return c.json({
      success: true,
      data: genres,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Unified search across both museums
 * GET /api/museum/unified-search
 */
app.get('/unified-search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    console.log(`🔍 Unified search: "${query}"`);

    const results = [];
    const errors = [];

    // Search National Museum
    if (c.env.MUSEUM_API_KEY) {
      try {
        const museumAPI = initMuseumAPI(c.env.MUSEUM_API_KEY);
        const museumResult = await museumAPI.searchArtworks({ query, limit: Math.floor(limit / 2), offset });
        results.push(...museumResult.artworks);
      } catch (error: any) {
        errors.push({ source: 'National Museum', error: error.message });
      }
    }

    // Search Soma Museum
    if (c.env.SOMA_API_KEY) {
      try {
        const somaAPI = initSomaMuseum(c.env.SOMA_API_KEY);
        const somaResult = await somaAPI.searchArtworks({ query, limit: Math.floor(limit / 2), offset });
        results.push(...somaResult.artworks);
      } catch (error: any) {
        errors.push({ source: 'Soma Museum', error: error.message });
      }
    }

    return c.json({
      success: true,
      data: {
        artworks: results,
        total: results.length,
        offset,
        limit,
        sources: {
          nationalMuseum: !!c.env.MUSEUM_API_KEY,
          somaMuseum: !!c.env.SOMA_API_KEY,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('❌ Unified search error:', error);
    return c.json({
      success: false,
      error: error.message || 'Unified search failed',
    }, 500);
  }
});

/**
 * Test Soma Museum API connection
 * GET /api/museum/soma/test
 */
app.get('/soma/test', async (c) => {
  try {
    const apiKey = c.env.SOMA_API_KEY;
    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'Soma Museum API key not configured',
        message: 'Please add SOMA_API_KEY to your environment variables',
      }, 503);
    }

    const somaAPI = initSomaMuseum(apiKey);
    
    // Try a simple search
    const result = await somaAPI.searchArtworks({ limit: 1 });
    
    return c.json({
      success: true,
      message: 'Soma Museum API connection successful',
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

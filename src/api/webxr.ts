/**
 * WebXR API Routes
 * Endpoints for AR/VR museum experiences
 */

import { Hono } from 'hono';
import { DatabaseService } from '../services/database.service';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get AR experience for exhibition
 * GET /api/webxr/ar/exhibition/:id
 */
app.get('/ar/exhibition/:id', async (c) => {
  try {
    const exhibitionId = c.req.param('id');
    const db = new DatabaseService(c.env.DB);

    // Get exhibition workflow
    const workflow = await db.getWorkflow(exhibitionId);
    if (!workflow) {
      return c.json({
        success: false,
        error: 'Exhibition not found',
      }, 404);
    }

    // Get nodes (artworks) for exhibition
    const nodes = await c.env.DB.prepare(
      'SELECT * FROM nodes WHERE workflow_id = ? AND category = ?'
    ).bind(exhibitionId, 'archive').all();

    // Create AR markers for artworks
    const arMarkers = (nodes.results || []).map((node: any, index: number) => ({
      id: `marker-${node.id}`,
      artworkId: node.id,
      position: {
        x: index * 2,
        y: 0,
        z: -3,
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1.0,
      infoPanel: {
        title: node.title || 'Untitled',
        artist: 'Unknown',
        description: node.description || '',
        year: 'Unknown',
      },
    }));

    return c.json({
      success: true,
      data: {
        exhibitionId,
        exhibitionName: workflow.name,
        mode: 'ar',
        markers: arMarkers,
        totalArtworks: arMarkers.length,
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
 * Get VR tour for exhibition
 * GET /api/webxr/vr/exhibition/:id
 */
app.get('/vr/exhibition/:id', async (c) => {
  try {
    const exhibitionId = c.req.param('id');
    const db = new DatabaseService(c.env.DB);

    // Get exhibition workflow
    const workflow = await db.getWorkflow(exhibitionId);
    if (!workflow) {
      return c.json({
        success: false,
        error: 'Exhibition not found',
      }, 404);
    }

    // Get nodes (artworks) for exhibition
    const nodes = await c.env.DB.prepare(
      'SELECT * FROM nodes WHERE workflow_id = ?'
    ).bind(exhibitionId).all();

    // Create VR scene layout
    const vrScene = {
      environment: {
        type: 'gallery',
        skybox: 'museum-interior',
        lighting: 'natural',
        floor: 'marble',
        walls: 'white',
      },
      artworks: (nodes.results || []).map((node: any, index: number) => ({
        id: node.id,
        title: node.title || 'Untitled',
        description: node.description || '',
        position: {
          x: (index % 5) * 4 - 8,
          y: 1.6,
          z: Math.floor(index / 5) * -5 - 3,
        },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.0,
        wall: 'front',
      })),
      waypoints: [
        { position: { x: 0, y: 0, z: 0 }, label: 'Entrance' },
        { position: { x: 0, y: 0, z: -10 }, label: 'Main Gallery' },
        { position: { x: 8, y: 0, z: -10 }, label: 'Side Gallery' },
      ],
      interactions: [
        { type: 'teleport', enabled: true },
        { type: 'grab', enabled: false },
        { type: 'info-panel', enabled: true },
      ],
    };

    return c.json({
      success: true,
      data: {
        exhibitionId,
        exhibitionName: workflow.name,
        mode: 'vr',
        scene: vrScene,
        totalArtworks: vrScene.artworks.length,
        totalWaypoints: vrScene.waypoints.length,
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
 * Get 3D model for AR placement
 * GET /api/webxr/ar/model/:artworkId
 */
app.get('/ar/model/:artworkId', async (c) => {
  try {
    const artworkId = c.req.param('artworkId');
    const db = new DatabaseService(c.env.DB);

    // Get artwork from knowledge entities
    const artwork = await c.env.DB.prepare(
      'SELECT * FROM knowledge_entities WHERE id = ? AND entity_type = ?'
    ).bind(artworkId, 'artwork').first();

    if (!artwork) {
      return c.json({
        success: false,
        error: 'Artwork not found',
      }, 404);
    }

    const properties = artwork.properties ? JSON.parse(artwork.properties as string) : {};

    return c.json({
      success: true,
      data: {
        artworkId: artwork.id,
        name: artwork.name,
        description: artwork.description,
        modelUrl: properties.modelUrl || null,
        thumbnailUrl: properties.imageUrl || properties.thumbnailUrl || null,
        dimensions: properties.dimensions || { width: 1, height: 1.5, depth: 0.1 },
        arSettings: {
          scale: 1.0,
          allowRotation: true,
          allowScaling: true,
          initialRotation: { x: 0, y: 0, z: 0 },
        },
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
 * Log AR/VR session analytics
 * POST /api/webxr/analytics
 */
app.post('/analytics', async (c) => {
  try {
    const data = await c.req.json();
    const db = new DatabaseService(c.env.DB);

    // Store session analytics
    await c.env.DB.prepare(`
      INSERT INTO workflow_events (
        id, workflow_id, event_type, event_data, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      `event-${Date.now()}`,
      data.exhibitionId || 'unknown',
      'webxr_session',
      JSON.stringify({
        mode: data.mode, // 'ar' or 'vr'
        duration: data.duration, // in seconds
        artworksViewed: data.artworksViewed || [],
        interactions: data.interactions || [],
        deviceType: data.deviceType,
        timestamp: data.timestamp,
      })
    ).run();

    return c.json({
      success: true,
      message: 'Analytics logged successfully',
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * Get WebXR session stats
 * GET /api/webxr/stats/:exhibitionId
 */
app.get('/stats/:exhibitionId', async (c) => {
  try {
    const exhibitionId = c.req.param('exhibitionId');

    // Get WebXR session statistics
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as totalSessions,
        AVG(json_extract(event_data, '$.duration')) as avgDuration,
        SUM(CASE WHEN json_extract(event_data, '$.mode') = 'ar' THEN 1 ELSE 0 END) as arSessions,
        SUM(CASE WHEN json_extract(event_data, '$.mode') = 'vr' THEN 1 ELSE 0 END) as vrSessions
      FROM workflow_events
      WHERE workflow_id = ? AND event_type = 'webxr_session'
    `).bind(exhibitionId).first();

    return c.json({
      success: true,
      data: result || {
        totalSessions: 0,
        avgDuration: 0,
        arSessions: 0,
        vrSessions: 0,
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
 * Test WebXR API
 * GET /api/webxr/test
 */
app.get('/test', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'WebXR API is operational',
      supportedModes: ['ar', 'vr', 'inline'],
      features: [
        'hit-test',
        'dom-overlay',
        'hand-tracking',
        'anchors',
        'plane-detection',
        'depth-sensing',
      ],
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;

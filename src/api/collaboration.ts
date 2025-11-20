/**
 * Collaboration API Routes
 * Real-time collaboration endpoints
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  COLLABORATION_ROOM: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Get or create collaboration room for a workflow
 * GET /api/collaboration/room/:workflowId
 */
app.get('/room/:workflowId', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');
    
    // Get Durable Object ID for this workflow
    const id = c.env.COLLABORATION_ROOM.idFromName(workflowId);
    const room = c.env.COLLABORATION_ROOM.get(id);
    
    // Get room state
    const response = await room.fetch('https://room/state');
    const state = await response.json();
    
    return c.json({
      success: true,
      data: {
        workflowId,
        roomId: id.toString(),
        ...state,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Get WebSocket connection URL for a workflow
 * GET /api/collaboration/connect/:workflowId
 */
app.get('/connect/:workflowId', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');
    const userId = c.req.query('userId') || 'anonymous';
    const userName = c.req.query('userName') || 'Anonymous User';
    
    // Get Durable Object ID
    const id = c.env.COLLABORATION_ROOM.idFromName(workflowId);
    const room = c.env.COLLABORATION_ROOM.get(id);
    
    // Upgrade to WebSocket
    const upgradeHeader = c.req.header('Upgrade');
    if (upgradeHeader === 'websocket') {
      // Forward WebSocket upgrade to Durable Object
      const url = new URL(c.req.url);
      url.searchParams.set('userId', userId);
      url.searchParams.set('userName', userName);
      url.searchParams.set('workflowId', workflowId);
      
      return room.fetch(url.toString(), {
        headers: c.req.raw.headers,
      });
    }
    
    // Return connection info for HTTP requests
    return c.json({
      success: true,
      data: {
        workflowId,
        roomId: id.toString(),
        wsUrl: `/api/collaboration/connect/${workflowId}`,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Get active users in a room
 * GET /api/collaboration/users/:workflowId
 */
app.get('/users/:workflowId', async (c) => {
  try {
    const workflowId = c.req.param('workflowId');
    
    const id = c.env.COLLABORATION_ROOM.idFromName(workflowId);
    const room = c.env.COLLABORATION_ROOM.get(id);
    
    const response = await room.fetch('https://room/users');
    const data = await response.json();
    
    return c.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * List recent collaboration sessions
 * GET /api/collaboration/sessions
 */
app.get('/sessions', async (c) => {
  try {
    const db = c.env.DB;
    const workflowId = c.req.query('workflowId');
    
    let query = `
      SELECT * FROM collaboration_sessions
      WHERE is_active = 1
    `;
    
    const params: any[] = [];
    
    if (workflowId) {
      query += ' AND workflow_id = ?';
      params.push(workflowId);
    }
    
    query += ' ORDER BY last_activity DESC LIMIT 100';
    
    const result = await db.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: result.results || [],
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;

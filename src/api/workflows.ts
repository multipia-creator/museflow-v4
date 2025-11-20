/**
 * Workflow API Routes
 */

import { Hono } from 'hono';
import { DatabaseService } from '../services/database.service';
import type { Workflow, Node, Connection } from '../types/database.types';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// WORKFLOW ROUTES
// ============================================================================

/**
 * Create new workflow
 * POST /api/workflows
 */
app.post('/', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const body = await c.req.json();

    const workflow = await db.createWorkflow(body);

    return c.json({ success: true, data: workflow }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Get workflow by ID
 * GET /api/workflows/:id
 */
app.get('/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');

    const workflow = await db.getWorkflow(id);

    if (!workflow) {
      return c.json({ success: false, error: 'Workflow not found' }, 404);
    }

    // Get nodes and connections
    const nodes = await db.listNodes(id);
    const connections = await db.listConnections(id);

    return c.json({
      success: true,
      data: {
        workflow,
        nodes,
        connections,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Update workflow
 * PUT /api/workflows/:id
 */
app.put('/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');
    const body = await c.req.json();

    await db.updateWorkflow(id, body);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Delete workflow
 * DELETE /api/workflows/:id
 */
app.delete('/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');

    await db.deleteWorkflow(id);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * List workflows
 * GET /api/workflows
 */
app.get('/', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50');

    const workflows = await db.listWorkflows(userId, limit);

    return c.json({ success: true, data: workflows });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// NODE ROUTES
// ============================================================================

/**
 * Add node to workflow
 * POST /api/workflows/:id/nodes
 */
app.post('/:id/nodes', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const workflowId = c.req.param('id');
    const body = await c.req.json();

    const node = await db.createNode({
      ...body,
      workflow_id: workflowId,
    });

    return c.json({ success: true, data: node }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Update node
 * PUT /api/nodes/:id
 */
app.put('/nodes/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');
    const body = await c.req.json();

    await db.updateNode(id, body);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Delete node
 * DELETE /api/nodes/:id
 */
app.delete('/nodes/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');

    await db.deleteNode(id);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// CONNECTION ROUTES
// ============================================================================

/**
 * Add connection to workflow
 * POST /api/workflows/:id/connections
 */
app.post('/:id/connections', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const workflowId = c.req.param('id');
    const body = await c.req.json();

    const connection = await db.createConnection({
      ...body,
      workflow_id: workflowId,
    });

    return c.json({ success: true, data: connection }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Delete connection
 * DELETE /api/connections/:id
 */
app.delete('/connections/:id', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const id = c.req.param('id');

    await db.deleteConnection(id);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;

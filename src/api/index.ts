/**
 * API Routes Index
 * Aggregates all API routes
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import workflowRoutes from './workflows';
import aiRoutes from './ai';
import collaborationRoutes from './collaboration';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  NOTION_API_KEY?: string;
  COLLABORATION_ROOM: DurableObjectNamespace;
};

const api = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all API routes
api.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount route groups
api.route('/workflows', workflowRoutes);
api.route('/ai', aiRoutes);
api.route('/collaboration', collaborationRoutes);

// 404 handler
api.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found',
    path: c.req.path,
  }, 404);
});

// Error handler
api.onError((err, c) => {
  console.error('❌ API Error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal server error',
  }, 500);
});

export default api;

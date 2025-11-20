/**
 * API Routes Index
 * Aggregates all API routes
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import workflowRoutes from './workflows';
import aiRoutes from './ai';
import collaborationRoutes from './collaboration';
import museumRoutes from './museum';
import visitorRoutes from './visitor';
import nftRoutes from './nft';
import threeDModelsRoutes from './3d-models';
import digitalTwinRoutes from './digital-twin';
import webxrRoutes from './webxr';
import iotSensorsRoutes from './iot-sensors';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  NOTION_API_KEY?: string;
  MUSEUM_API_KEY?: string;
  SOMA_API_KEY?: string;
  KCISA_API_KEY?: string;
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
api.route('/museum', museumRoutes);
api.route('/visitor', visitorRoutes);
api.route('/nft', nftRoutes);
api.route('/3d-models', threeDModelsRoutes);
api.route('/digital-twin', digitalTwinRoutes);
api.route('/webxr', webxrRoutes);
api.route('/iot-sensors', iotSensorsRoutes);

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

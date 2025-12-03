/**
 * Figma API Routes
 * @version 1.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { FigmaService } from '../services/figma.service';

type Bindings = {
  FIGMA_ACCESS_TOKEN?: string;
};

const figma = new Hono<{ Bindings: Bindings }>();

// Enable CORS
figma.use('/*', cors());

/**
 * GET /api/figma/status
 * Check Figma API connection status
 */
figma.get('/status', async (c) => {
  const token = c.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    return c.json({
      success: false,
      message: 'Figma API token not configured',
      configured: false,
    });
  }

  try {
    const service = new FigmaService(token);
    const userInfo = await service.getMe();

    return c.json({
      success: true,
      message: 'Figma API connected',
      configured: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        handle: userInfo.handle,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Figma API connection failed',
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/figma/file/:fileKey
 * Get Figma file metadata
 */
figma.get('/file/:fileKey', async (c) => {
  const token = c.env.FIGMA_ACCESS_TOKEN;
  const fileKey = c.req.param('fileKey');

  if (!token) {
    return c.json({
      success: false,
      error: 'Figma API token not configured',
    }, 400);
  }

  try {
    const service = new FigmaService(token);
    const fileData = await service.getFile(fileKey);

    return c.json({
      success: true,
      data: fileData,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * POST /api/figma/export
 * Export Figma nodes as images
 */
figma.post('/export', async (c) => {
  const token = c.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    return c.json({
      success: false,
      error: 'Figma API token not configured',
    }, 400);
  }

  try {
    const body = await c.req.json();
    const { fileKey, nodeIds, format = 'png', scale = 2 } = body;

    if (!fileKey || !nodeIds || nodeIds.length === 0) {
      return c.json({
        success: false,
        error: 'fileKey and nodeIds are required',
      }, 400);
    }

    const service = new FigmaService(token);
    const result = await service.exportImages({
      fileKey,
      nodeIds,
      format,
      scale,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * POST /api/figma/sync-node
 * Sync Canvas node to Figma
 */
figma.post('/sync-node', async (c) => {
  const token = c.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    return c.json({
      success: false,
      error: 'Figma API token not configured',
      message: 'Running in mock mode',
    });
  }

  try {
    const body = await c.req.json();
    const { node, fileKey } = body;

    if (!node || !fileKey) {
      return c.json({
        success: false,
        error: 'node and fileKey are required',
      }, 400);
    }

    const service = new FigmaService(token);
    const result = await service.syncCanvasNodeToFigma(node, fileKey);

    return c.json({
      success: true,
      data: result,
      message: 'Canvas node synced to Figma',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/figma/projects/:teamId
 * Get team projects
 */
figma.get('/projects/:teamId', async (c) => {
  const token = c.env.FIGMA_ACCESS_TOKEN;
  const teamId = c.req.param('teamId');

  if (!token) {
    return c.json({
      success: false,
      error: 'Figma API token not configured',
    }, 400);
  }

  try {
    const service = new FigmaService(token);
    const projects = await service.getTeamProjects(teamId);

    return c.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export default figma;

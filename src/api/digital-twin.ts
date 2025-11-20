/**
 * Digital Twin API Routes
 * Endpoints for museum space simulation
 */

import { Hono } from 'hono';
import { DigitalTwinAgent } from '../agents/digital-twin.agent';
import type { DigitalTwinRequest } from '../agents/digital-twin.agent';
import type { AgentContext } from '../types/agent.types';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Create digital twin simulation
 * POST /api/digital-twin/simulate
 * 
 * Body: DigitalTwinRequest
 */
app.post('/simulate', async (c) => {
  try {
    const request: DigitalTwinRequest = await c.req.json();

    if (!request.spaceName || !request.dimensions || !request.artworks) {
      return c.json({
        success: false,
        error: 'Space name, dimensions, and artworks are required',
      }, 400);
    }

    console.log('🏛️ Digital twin simulation request:', request.spaceName);

    // Initialize Digital Twin Agent
    const agent = new DigitalTwinAgent();
    await agent.initialize();

    // Create context
    const context: AgentContext = {
      workflowId: `simulation-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    // Run simulation
    const simulation = await agent.simulateSpace(request, context);

    return c.json({
      success: true,
      data: simulation,
    });
  } catch (error: any) {
    console.error('❌ Digital twin simulation error:', error);
    return c.json({
      success: false,
      error: error.message || 'Simulation failed',
    }, 500);
  }
});

/**
 * Optimize artwork placement
 * POST /api/digital-twin/optimize
 * 
 * Body: {
 *   artworks: ArtworkPlacement[],
 *   spaceLayout: SpaceLayout
 * }
 */
app.post('/optimize', async (c) => {
  try {
    const { artworks, spaceLayout } = await c.req.json();

    if (!artworks || !spaceLayout) {
      return c.json({
        success: false,
        error: 'Artworks and space layout are required',
      }, 400);
    }

    console.log('🎯 Optimizing placement for', artworks.length, 'artworks...');

    const agent = new DigitalTwinAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `optimize-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const placements = await agent.optimizePlacement(artworks, spaceLayout, context);

    return c.json({
      success: true,
      data: placements,
    });
  } catch (error: any) {
    console.error('❌ Placement optimization error:', error);
    return c.json({
      success: false,
      error: error.message || 'Optimization failed',
    }, 500);
  }
});

/**
 * Simulate visitor flow
 * POST /api/digital-twin/visitor-flow
 * 
 * Body: {
 *   spaceLayout: SpaceLayout,
 *   placements: OptimizedPlacement[],
 *   visitorCount: number
 * }
 */
app.post('/visitor-flow', async (c) => {
  try {
    const { spaceLayout, placements, visitorCount } = await c.req.json();

    if (!spaceLayout || !placements || !visitorCount) {
      return c.json({
        success: false,
        error: 'Space layout, placements, and visitor count are required',
      }, 400);
    }

    console.log('👥 Simulating flow for', visitorCount, 'visitors...');

    const agent = new DigitalTwinAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `flow-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const paths = await agent.simulateVisitorFlow(spaceLayout, placements, visitorCount, context);

    return c.json({
      success: true,
      data: paths,
    });
  } catch (error: any) {
    console.error('❌ Visitor flow simulation error:', error);
    return c.json({
      success: false,
      error: error.message || 'Flow simulation failed',
    }, 500);
  }
});

/**
 * Test digital twin agent
 * GET /api/digital-twin/test
 */
app.get('/test', async (c) => {
  try {
    const agent = new DigitalTwinAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `test-${Date.now()}`,
      projectId: `test-project`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    // Test with sample data
    const testRequest: DigitalTwinRequest = {
      spaceName: 'Main Gallery',
      dimensions: {
        width: 20,
        height: 4,
        depth: 15,
      },
      artworks: [
        {
          id: 'art-1',
          name: 'Painting 1',
          dimensions: { width: 2, height: 1.5, depth: 0.1 },
          priority: 'high',
          viewingTime: 60,
        },
        {
          id: 'art-2',
          name: 'Sculpture 1',
          dimensions: { width: 1, height: 2, depth: 1 },
          priority: 'medium',
          viewingTime: 45,
        },
        {
          id: 'art-3',
          name: 'Painting 2',
          dimensions: { width: 3, height: 2, depth: 0.1 },
          priority: 'high',
          viewingTime: 90,
        },
      ],
      expectedVisitors: 100,
      peakHours: ['10:00-12:00', '14:00-16:00'],
    };

    const simulation = await agent.simulateSpace(testRequest, context);

    return c.json({
      success: true,
      message: 'Digital Twin Agent test successful',
      sampleSimulation: {
        artworksPlaced: simulation.artworkPlacements.length,
        overallScore: simulation.optimization.overallScore,
        recommendations: simulation.recommendations.length,
      },
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;

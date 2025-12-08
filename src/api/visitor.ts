/**
 * Visitor Prediction API Routes
 * Endpoints for visitor analytics and predictions
 */

import { Hono } from 'hono';
import { VisitorAgent } from '../agents/visitor.agent';
import type { VisitorPredictionRequest } from '../agents/visitor.agent';
import type { AgentContext } from '../types/agent.types';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Predict visitor traffic
 * POST /api/visitor/predict
 * 
 * Body: {
 *   exhibitionTheme: string,
 *   targetAudience?: string,
 *   duration?: string,
 *   venue?: string,
 *   marketingBudget?: number,
 *   seasonalFactor?: 'spring' | 'summer' | 'fall' | 'winter',
 *   specialEvents?: string[],
 *   historicalData?: HistoricalVisitorData[]
 * }
 */
app.post('/predict', async (c) => {
  try {
    const request: VisitorPredictionRequest = await c.req.json();

    if (!request.exhibitionTheme) {
      return c.json({
        success: false,
        error: 'Exhibition theme is required',
      }, 400);
    }

    console.log('📊 Visitor prediction request:', request.exhibitionTheme);

    // Initialize Gemini service
    const { initGemini } = await import('../services/gemini.service');
    initGemini({ apiKey: c.env.GEMINI_API_KEY });

    // Initialize Visitor Agent
    const agent = new VisitorAgent();
    await agent.initialize();

    // Create context
    const context: AgentContext = {
      workflowId: `visitor-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    // Generate prediction
    const prediction = await agent.predictVisitors(request, context);

    return c.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    console.error('❌ Visitor prediction error:', error);
    return c.json({
      success: false,
      error: error.message || 'Prediction failed',
    }, 500);
  }
});

/**
 * Analyze historical visitor data
 * POST /api/visitor/analyze
 * 
 * Body: {
 *   data: HistoricalVisitorData[]
 * }
 */
app.post('/analyze', async (c) => {
  try {
    const { data } = await c.req.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return c.json({
        success: false,
        error: 'Historical data array is required',
      }, 400);
    }

    console.log(`📊 Analyzing ${data.length} historical records...`);

    const agent = new VisitorAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `analysis-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const analysis = await agent.analyzeHistoricalData(data, context);

    return c.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('❌ Historical analysis error:', error);
    return c.json({
      success: false,
      error: error.message || 'Analysis failed',
    }, 500);
  }
});

/**
 * Plan capacity management
 * POST /api/visitor/capacity
 * 
 * Body: {
 *   prediction: VisitorPrediction,
 *   venueCapacity: number
 * }
 */
app.post('/capacity', async (c) => {
  try {
    const { prediction, venueCapacity } = await c.req.json();

    if (!prediction || !venueCapacity) {
      return c.json({
        success: false,
        error: 'Prediction and venue capacity are required',
      }, 400);
    }

    console.log('📊 Planning capacity management...');

    const agent = new VisitorAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `capacity-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const plan = await agent.planCapacity(prediction, venueCapacity, context);

    return c.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('❌ Capacity planning error:', error);
    return c.json({
      success: false,
      error: error.message || 'Planning failed',
    }, 500);
  }
});

/**
 * Project revenue
 * POST /api/visitor/revenue
 * 
 * Body: {
 *   prediction: VisitorPrediction,
 *   ticketPrice: number
 * }
 */
app.post('/revenue', async (c) => {
  try {
    const { prediction, ticketPrice } = await c.req.json();

    if (!prediction || !ticketPrice) {
      return c.json({
        success: false,
        error: 'Prediction and ticket price are required',
      }, 400);
    }

    console.log('💰 Calculating revenue projections...');

    const agent = new VisitorAgent();
    await agent.initialize();

    const context: AgentContext = {
      workflowId: `revenue-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const projection = await agent.projectRevenue(prediction, ticketPrice, context);

    return c.json({
      success: true,
      data: projection,
    });
  } catch (error: any) {
    console.error('❌ Revenue projection error:', error);
    return c.json({
      success: false,
      error: error.message || 'Projection failed',
    }, 500);
  }
});

/**
 * Test visitor agent
 * GET /api/visitor/test
 */
app.get('/test', async (c) => {
  try {
    const agent = new VisitorAgent();
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
    const testRequest: VisitorPredictionRequest = {
      exhibitionTheme: 'Korean Traditional Art',
      targetAudience: 'General Public',
      duration: '3 months',
      venue: 'Main Gallery',
      marketingBudget: 50000,
      seasonalFactor: 'spring',
      specialEvents: ['Opening Reception', 'Artist Talk'],
    };

    const prediction = await agent.predictVisitors(testRequest, context);

    return c.json({
      success: true,
      message: 'Visitor Agent test successful',
      samplePrediction: {
        totalVisitors: prediction.summary.totalVisitors,
        averageDaily: prediction.summary.averageDailyVisitors,
        confidence: prediction.confidence,
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

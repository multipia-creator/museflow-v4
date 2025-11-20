/**
 * AI API Routes
 * AI-powered workflow generation and intent recognition
 */

import { Hono } from 'hono';
import { initGemini } from '../services/gemini.service';
import { initCoordinator } from '../agents/coordinator';
import { initIntent } from '../services/intent.service';
import { DatabaseService } from '../services/database.service';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// AI GENERATION ROUTES
// ============================================================================

/**
 * Generate workflow from natural language
 * POST /api/ai/generate-workflow
 * 
 * Body: {
 *   prompt: string,
 *   context?: {
 *     museum?: string,
 *     budget?: number,
 *     duration?: string,
 *     userId?: string
 *   }
 * }
 */
app.post('/generate-workflow', async (c) => {
  try {
    // Initialize services
    initGemini({ apiKey: c.env.GEMINI_API_KEY });
    const coordinator = initCoordinator();
    await coordinator.initialize();
    const intentService = initIntent();

    const body = await c.req.json();
    const { prompt, context } = body;

    if (!prompt) {
      return c.json({ success: false, error: 'Prompt is required' }, 400);
    }

    console.log('🔮 Generating workflow:', prompt);

    // Generate workflow
    const result = await intentService.generateWorkflow({
      prompt,
      context,
    });

    // Save to database
    const db = new DatabaseService(c.env.DB);
    
    const workflow = await db.createWorkflow({
      name: result.name,
      description: result.description,
      status: 'draft',
      ai_generated: true,
      generation_prompt: prompt,
      generation_model: result.metadata.model,
      created_by: context?.userId || 'ai-system',
      metadata: JSON.stringify(result.metadata),
    });

    // Save nodes
    for (const nodeData of result.nodes) {
      await db.createNode({
        ...nodeData,
        workflow_id: workflow.id,
      });
    }

    // Save connections
    for (const connData of result.connections) {
      await db.createConnection({
        ...connData,
        workflow_id: workflow.id,
      });
    }

    console.log('✅ Workflow generated and saved:', workflow.id);

    return c.json({
      success: true,
      data: {
        workflowId: workflow.id,
        name: result.name,
        description: result.description,
        nodesCount: result.nodes.length,
        connectionsCount: result.connections.length,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('❌ Workflow generation failed:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Recognize intent from natural language
 * POST /api/ai/recognize-intent
 * 
 * Body: { query: string }
 */
app.post('/recognize-intent', async (c) => {
  try {
    initGemini({ apiKey: c.env.GEMINI_API_KEY });
    const intentService = initIntent();

    const body = await c.req.json();
    const { query } = body;

    if (!query) {
      return c.json({ success: false, error: 'Query is required' }, 400);
    }

    const intent = await intentService.recognizeIntent(query);

    return c.json({ success: true, data: intent });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Suggest next steps
 * POST /api/ai/suggest-next-steps
 * 
 * Body: {
 *   workflowId: string,
 *   completedNodes: string[]
 * }
 */
app.post('/suggest-next-steps', async (c) => {
  try {
    initGemini({ apiKey: c.env.GEMINI_API_KEY });
    const intentService = initIntent();

    const body = await c.req.json();
    const { workflowId, completedNodes } = body;

    const suggestions = await intentService.suggestNextSteps(workflowId, completedNodes || []);

    // Save suggestions to database
    const db = new DatabaseService(c.env.DB);
    
    for (const suggestion of suggestions) {
      await db.createSuggestion({
        workflow_id: workflowId,
        suggestion_type: 'next_step',
        title: suggestion,
        priority: 'medium',
        confidence: 0.7,
      });
    }

    return c.json({ success: true, data: suggestions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Get AI suggestions for workflow
 * GET /api/ai/suggestions/:workflowId
 */
app.get('/suggestions/:workflowId', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const workflowId = c.req.param('workflowId');

    const suggestions = await db.listSuggestions(workflowId);

    return c.json({ success: true, data: suggestions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Test AI connection
 * GET /api/ai/test
 */
app.get('/test', async (c) => {
  try {
    initGemini({ apiKey: c.env.GEMINI_API_KEY });
    
    return c.json({
      success: true,
      message: 'AI services initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;

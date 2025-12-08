/**
 * Education API Routes
 * Endpoints for educational program planning and content generation
 */

import { Hono } from 'hono';
import { EducationAgent } from '../agents/education.agent';
import type { EducationProgramRequest } from '../agents/education.agent';
import type { AgentContext } from '../types/agent.types';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Design an educational program
 * POST /api/education/design
 * 
 * Body: {
 *   exhibitionTheme: string,
 *   targetAudience: 'children' | 'teenagers' | 'adults' | 'seniors' | 'families' | 'schools',
 *   ageRange?: string,
 *   duration?: string,
 *   programType?: 'workshop' | 'guided-tour' | 'lecture' | 'hands-on' | 'interactive',
 *   learningObjectives?: string[],
 *   capacity?: number,
 *   budget?: number
 * }
 */
app.post('/design', async (c) => {
  try {
    const request: EducationProgramRequest = await c.req.json();

    if (!request.exhibitionTheme) {
      return c.json({
        success: false,
        error: 'Exhibition theme is required',
      }, 400);
    }

    if (!request.targetAudience) {
      return c.json({
        success: false,
        error: 'Target audience is required',
      }, 400);
    }

    console.log('📚 Education program design request:', request.exhibitionTheme);

    // Initialize Gemini service
    const { initGemini } = await import('../services/gemini.service');
    initGemini({ apiKey: c.env.GEMINI_API_KEY });

    // Initialize Education Agent
    const agent = new EducationAgent();
    await agent.initialize();

    // Create context
    const context: AgentContext = {
      workflowId: `education-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    // Design program
    const program = await agent.designProgram(request, context);

    return c.json({
      success: true,
      data: program,
    });
  } catch (error: any) {
    console.error('❌ Education program design error:', error);
    return c.json({
      success: false,
      error: error.message || 'Program design failed',
    }, 500);
  }
});

/**
 * Generate educational content
 * POST /api/education/content
 * 
 * Body: {
 *   contentType: 'worksheet' | 'guide' | 'quiz' | 'activity-card',
 *   theme: string,
 *   audience: string
 * }
 */
app.post('/content', async (c) => {
  try {
    const { contentType, theme, audience } = await c.req.json();

    if (!contentType || !theme || !audience) {
      return c.json({
        success: false,
        error: 'contentType, theme, and audience are required',
      }, 400);
    }

    console.log(`📚 Content generation request: ${contentType} for ${theme}`);

    // Initialize Education Agent
    const agent = new EducationAgent();
    await agent.initialize();

    // Create context
    const context: AgentContext = {
      workflowId: `content-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    // Generate content
    const content = await agent.generateContent(contentType, theme, audience, context);

    return c.json({
      success: true,
      data: {
        contentType,
        theme,
        audience,
        content,
      },
    });
  } catch (error: any) {
    console.error('❌ Content generation error:', error);
    return c.json({
      success: false,
      error: error.message || 'Content generation failed',
    }, 500);
  }
});

/**
 * Test education agent
 * GET /api/education/test
 */
app.get('/test', async (c) => {
  try {
    console.log('🧪 Testing Education Agent...');

    const agent = new EducationAgent();
    await agent.initialize();

    const testRequest: EducationProgramRequest = {
      exhibitionTheme: 'Ancient Egypt: Mysteries of the Pharaohs',
      targetAudience: 'children',
      ageRange: '8-12 years',
      duration: '60 minutes',
      programType: 'interactive',
      learningObjectives: [
        'Understand daily life in ancient Egypt',
        'Learn about hieroglyphics',
        'Explore mummification process',
      ],
      capacity: 25,
      budget: 500,
    };

    const context: AgentContext = {
      workflowId: 'test-education',
      projectId: 'test-project',
      userId: 'system',
      environment: {
        GEMINI_API_KEY: c.env.GEMINI_API_KEY,
      },
    };

    const program = await agent.designProgram(testRequest, context);

    return c.json({
      success: true,
      message: 'Education Agent test successful',
      data: program,
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

export default app;

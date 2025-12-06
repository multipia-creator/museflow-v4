/**
 * Chatbot API Routes
 * AI-powered museum visitor assistant
 */

import { Hono } from 'hono';
import { ChatbotAgent } from '../agents/chatbot.agent';
import type { AgentContext } from '../types/agent.types';

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Initialize chatbot agent
let chatbotAgent: ChatbotAgent | null = null;

const getChatbotAgent = async (c: any): Promise<ChatbotAgent> => {
  if (!chatbotAgent) {
    chatbotAgent = new ChatbotAgent();
    await chatbotAgent.initialize();
  }
  return chatbotAgent;
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * POST /api/chatbot/session
 * Create new chat session
 * 
 * Body: { userId: string }
 * Response: { success: true, session: ChatSession }
 */
app.post('/session', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({
        success: false,
        error: 'userId is required',
      }, 400);
    }

    const agent = await getChatbotAgent(c);
    const session = agent.createSession(userId);

    return c.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        userId: session.userId,
        startedAt: session.startedAt,
        greeting: '안녕하세요! 저는 뮤지엄 가이드 AI입니다. 무엇을 도와드릴까요? 😊',
      },
    });
  } catch (error: any) {
    console.error('❌ Create session error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to create session',
    }, 500);
  }
});

/**
 * GET /api/chatbot/session/:sessionId
 * Get session details and message history
 * 
 * Response: { success: true, session: ChatSession }
 */
app.get('/session/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const agent = await getChatbotAgent(c);
    
    const session = agent.getSession(sessionId);
    if (!session) {
      return c.json({
        success: false,
        error: 'Session not found',
      }, 404);
    }

    return c.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('❌ Get session error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get session',
    }, 500);
  }
});

/**
 * PUT /api/chatbot/session/:sessionId/context
 * Update session context
 * 
 * Body: { currentExhibition?: string, userPreferences?: any }
 * Response: { success: true }
 */
app.put('/session/:sessionId/context', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const context = await c.req.json();
    
    const agent = await getChatbotAgent(c);
    agent.updateSessionContext(sessionId, context);

    return c.json({
      success: true,
      message: 'Context updated',
    });
  } catch (error: any) {
    console.error('❌ Update context error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to update context',
    }, 500);
  }
});

// ============================================================================
// CHAT MESSAGING
// ============================================================================

/**
 * POST /api/chatbot/message
 * Send message and get AI response
 * 
 * Body: { sessionId: string, message: string }
 * Response: { success: true, response: ChatResponse }
 */
app.post('/message', async (c) => {
  try {
    const { sessionId, message } = await c.req.json();

    if (!sessionId || !message) {
      return c.json({
        success: false,
        error: 'sessionId and message are required',
      }, 400);
    }

    const agent = await getChatbotAgent(c);
    
    // Build agent context
    const context: AgentContext = {
      workflowId: sessionId,
      requestId: `chat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        db: c.env.DB,
        geminiApiKey: c.env.GEMINI_API_KEY,
      },
    };

    const response = await agent.sendMessage(sessionId, message, context);

    return c.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Send message error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to send message',
    }, 500);
  }
});

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * POST /api/chatbot/recommendations
 * Get personalized artwork recommendations
 * 
 * Body: { 
 *   userInterests: string[],
 *   visitedArtworks: string[]
 * }
 * Response: { success: true, recommendations: any[] }
 */
app.post('/recommendations', async (c) => {
  try {
    const { userInterests, visitedArtworks } = await c.req.json();

    if (!userInterests || !Array.isArray(userInterests)) {
      return c.json({
        success: false,
        error: 'userInterests array is required',
      }, 400);
    }

    const agent = await getChatbotAgent(c);
    
    const context: AgentContext = {
      workflowId: `recommendations-${Date.now()}`,
      requestId: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        db: c.env.DB,
        geminiApiKey: c.env.GEMINI_API_KEY,
      },
    };

    const recommendations = await agent.getRecommendations(
      userInterests,
      visitedArtworks || [],
      context
    );

    return c.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    console.error('❌ Recommendations error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get recommendations',
    }, 500);
  }
});

/**
 * GET /api/chatbot/session/:sessionId/preferences
 * Analyze user preferences from conversation
 * 
 * Response: { success: true, preferences: any }
 */
app.get('/session/:sessionId/preferences', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const agent = await getChatbotAgent(c);
    
    const session = agent.getSession(sessionId);
    if (!session) {
      return c.json({
        success: false,
        error: 'Session not found',
      }, 404);
    }

    const preferences = agent.analyzePreferences(session);

    return c.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('❌ Analyze preferences error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to analyze preferences',
    }, 500);
  }
});

// ============================================================================
// STATISTICS & MONITORING
// ============================================================================

/**
 * GET /api/chatbot/stats
 * Get chatbot statistics
 * 
 * Response: { success: true, stats: any }
 */
app.get('/stats', async (c) => {
  try {
    const agent = await getChatbotAgent(c);
    const stats = agent.getStats();

    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Stats error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get stats',
    }, 500);
  }
});

/**
 * GET /api/chatbot/user/:userId/sessions
 * Get all sessions for a user
 * 
 * Response: { success: true, sessions: ChatSession[] }
 */
app.get('/user/:userId/sessions', async (c) => {
  try {
    const userId = c.req.param('userId');
    const agent = await getChatbotAgent(c);
    
    const sessions = agent.getUserSessions(userId);

    return c.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error('❌ Get user sessions error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to get user sessions',
    }, 500);
  }
});

// ============================================================================
// TEST ENDPOINTS
// ============================================================================

/**
 * GET /api/chatbot/test
 * Test chatbot functionality
 * 
 * Response: { success: true, test: any }
 */
app.get('/test', async (c) => {
  try {
    const agent = await getChatbotAgent(c);
    
    // Create test session
    const session = agent.createSession('test-user');
    
    // Build test context
    const context: AgentContext = {
      workflowId: session.sessionId,
      requestId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        db: c.env.DB,
        geminiApiKey: c.env.GEMINI_API_KEY,
      },
    };

    // Send test message
    const response = await agent.sendMessage(
      session.sessionId,
      '안녕하세요! 인상주의 작품을 보고 싶은데 추천해주실 수 있나요?',
      context
    );

    // Get preferences
    const preferences = agent.analyzePreferences(session);

    // Get stats
    const stats = agent.getStats();

    return c.json({
      success: true,
      test: {
        session: {
          sessionId: session.sessionId,
          userId: session.userId,
          messageCount: session.messages.length,
        },
        response,
        preferences,
        stats,
      },
      message: '✅ Chatbot test completed successfully',
    });
  } catch (error: any) {
    console.error('❌ Test error:', error);
    return c.json({
      success: false,
      error: error.message || 'Test failed',
      details: error.stack,
    }, 500);
  }
});

export default app;

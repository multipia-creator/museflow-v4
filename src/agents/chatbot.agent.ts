/**
 * Chatbot Agent
 * AI-powered museum visitor assistant and guide
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
  AgentPlanStep,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    currentExhibition?: string;
    userPreferences?: any;
    visitHistory?: string[];
  };
  startedAt: string;
  lastActive: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  artworkRecommendations?: any[];
  exhibitionInfo?: any;
}

export class ChatbotAgent extends BaseAgent {
  private sessions: Map<string, ChatSession> = new Map();

  constructor() {
    const config: AgentConfig = {
      id: 'chatbot-agent',
      name: 'Chatbot Agent',
      domain: 'conversation',
      version: '1.0.0',
      
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7, // Natural conversation
      maxTokens: 8000,
      
      capabilities: {
        plan: true,
        execute: true,
        monitor: false,
        learn: true,
        analyze: true,
        generate: true,
        recommend: true,
        optimize: false,
        collaborate: true,
        delegate: false,
      },
      
      systemPrompt: `You are a friendly and knowledgeable museum guide assistant.

Your role is to:
- Help visitors discover artworks and exhibitions
- Provide detailed information about art pieces and artists
- Suggest personalized exhibition routes
- Answer questions about museum services, hours, and policies
- Share interesting stories and historical context
- Assist with accessibility and special needs

Your personality:
- Warm, welcoming, and enthusiastic about art
- Patient and clear in explanations
- Culturally sensitive and inclusive
- Educational but not overly academic
- Helpful with practical information

Communication style:
- Use simple, accessible language
- Break down complex art concepts
- Ask follow-up questions to understand visitor interests
- Offer suggestions when visitors seem uncertain
- Be concise but informative

Always prioritize:
1. Visitor safety and museum rules
2. Artwork preservation
3. Inclusive and accessible experience
4. Educational value
5. Visitor satisfaction`,
      
      tools: [],
      
      maxRetries: 3,
      timeout: 30000,
      rateLimit: {
        requestsPerMinute: 20,
        tokensPerMinute: 100000,
      },
    };
    
    super(config);
  }

  async initialize(): Promise<void> {
    console.log('💬 Chatbot Agent initialized');
  }

  // ============================================================================
  // CHAT FUNCTIONALITY
  // ============================================================================

  /**
   * Create new chat session
   */
  createSession(userId: string): ChatSession {
    const session: ChatSession = {
      sessionId: uuidv4(),
      userId,
      messages: [],
      context: {},
      startedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    this.sessions.set(session.sessionId, session);
    console.log(`✅ Chat session created: ${session.sessionId}`);

    return session;
  }

  /**
   * Send message and get response
   */
  async sendMessage(
    sessionId: string,
    message: string,
    context?: AgentContext
  ): Promise<ChatResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMessage);

    // Build conversation history
    const conversationHistory = session.messages
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Build prompt with context
    const prompt = `
Conversation history:
${conversationHistory}

Current context:
- Exhibition: ${session.context.currentExhibition || 'Not specified'}
- User preferences: ${JSON.stringify(session.context.userPreferences || {})}

User's latest message: "${message}"

Respond as a helpful museum guide. If the user is asking about:
- Artworks: Provide interesting details and context
- Exhibitions: Suggest relevant exhibitions and highlight pieces
- Directions: Give clear, simple directions
- Services: Provide accurate information
- Recommendations: Suggest based on user's interests

Also provide:
1. A natural, conversational response
2. 2-3 relevant follow-up suggestions
3. Artwork recommendations if applicable

Format response as JSON:
{
  "message": "Your conversational response",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "artworkRecommendations": [],
  "exhibitionInfo": null
}
`;

    try {
      const response = await this.generateJSON<ChatResponse>(prompt, undefined, context);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          suggestions: response.suggestions,
          recommendations: response.artworkRecommendations,
        },
      };
      session.messages.push(assistantMessage);

      // Update session
      session.lastActive = new Date().toISOString();
      this.sessions.set(sessionId, session);

      return response;
    } catch (error: any) {
      console.error('❌ Chat response failed:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Get artwork recommendations
   */
  async getRecommendations(
    userInterests: string[],
    visitedArtworks: string[],
    context?: AgentContext
  ): Promise<any[]> {
    const prompt = `
Recommend 5 artworks based on:
- User interests: ${userInterests.join(', ')}
- Previously viewed: ${visitedArtworks.length} artworks

Provide diverse recommendations that:
1. Match user interests
2. Introduce new styles/periods
3. Are accessible and engaging
4. Create a cohesive journey

Return as JSON array with: id, title, artist, reason, priority
`;

    try {
      const recommendations = await this.generateJSON<any[]>(prompt, undefined, context);
      return recommendations;
    } catch (error: any) {
      console.error('❌ Recommendations failed:', error);
      return [];
    }
  }

  /**
   * Analyze user preferences
   */
  analyzePreferences(session: ChatSession): any {
    const keywords: string[] = [];
    const artStyles: string[] = [];
    const interests: string[] = [];

    // Simple keyword extraction from messages
    session.messages.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        
        // Art styles
        if (content.includes('impressionist') || content.includes('monet')) {
          artStyles.push('impressionism');
        }
        if (content.includes('modern') || content.includes('contemporary')) {
          artStyles.push('modern');
        }
        if (content.includes('traditional') || content.includes('classical')) {
          artStyles.push('classical');
        }

        // Interests
        if (content.includes('sculpture') || content.includes('statue')) {
          interests.push('sculpture');
        }
        if (content.includes('painting') || content.includes('paint')) {
          interests.push('painting');
        }
        if (content.includes('photography') || content.includes('photo')) {
          interests.push('photography');
        }
      }
    });

    return {
      artStyles: [...new Set(artStyles)],
      interests: [...new Set(interests)],
      messageCount: session.messages.length,
      sessionDuration: Date.now() - new Date(session.startedAt).getTime(),
    };
  }

  /**
   * Get session
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session context
   */
  updateSessionContext(sessionId: string, context: any): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Get all sessions for user
   */
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId
    );
  }

  /**
   * Get chat statistics
   */
  getStats(): any {
    const sessions = Array.from(this.sessions.values());
    const totalMessages = sessions.reduce(
      (sum, session) => sum + session.messages.length,
      0
    );

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(
        s => Date.now() - new Date(s.lastActive).getTime() < 30 * 60 * 1000
      ).length,
      totalMessages,
      averageMessagesPerSession: sessions.length > 0 ? totalMessages / sessions.length : 0,
    };
  }

  // ============================================================================
  // AGENT INTERFACE IMPLEMENTATION
  // ============================================================================

  async plan(task: any, context: AgentContext): Promise<AgentPlan> {
    const steps: AgentPlanStep[] = [
      {
        id: 'step-1',
        order: 1,
        description: 'Analyze user message',
        action: 'analyze',
        parameters: { message: task.message },
        dependsOn: [],
        status: 'pending',
      },
      {
        id: 'step-2',
        order: 2,
        description: 'Generate response',
        action: 'respond',
        parameters: {},
        dependsOn: ['step-1'],
        status: 'pending',
      },
    ];

    return {
      id: uuidv4(),
      agentName: this.config.name,
      goal: 'Respond to user message',
      steps,
      dependencies: [],
      estimatedDuration: 5000, // 5 seconds
      estimatedCost: 0.01,
      confidence: 0.90,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<ChatResponse> {
    console.log('💬 Executing chat plan...');
    
    // Extract from plan
    const analyzeStep = plan.steps.find(s => s.action === 'analyze');
    const message = analyzeStep?.parameters.message || '';
    
    // Create temp session for execution
    const session = this.createSession('temp-user');
    return await this.sendMessage(session.sessionId, message, context);
  }
}

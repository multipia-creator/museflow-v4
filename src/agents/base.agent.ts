/**
 * Base Agent
 * Foundation for all specialized agents
 */

import { getGemini } from '../services/gemini.service';
import type {
  AgentConfig,
  AgentContext,
  AgentAction,
  AgentMessage,
  AgentPlan,
  AgentPlanStep,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected actionHistory: AgentAction[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
  }

  // ============================================================================
  // ABSTRACT METHODS (Must be implemented by subclasses)
  // ============================================================================

  /**
   * Initialize agent with specific tools and capabilities
   */
  abstract initialize(): Promise<void>;

  /**
   * Create a plan for the given task
   */
  abstract plan(task: any, context: AgentContext): Promise<AgentPlan>;

  /**
   * Execute a plan
   */
  abstract execute(plan: AgentPlan, context: AgentContext): Promise<any>;

  // ============================================================================
  // CORE CAPABILITIES
  // ============================================================================

  /**
   * Generate text using Gemini with agent's system prompt
   */
  protected async generateText(prompt: string, context?: AgentContext): Promise<string> {
    const gemini = getGemini();
    
    // Build full prompt with context
    const fullPrompt = this.buildPromptWithContext(prompt, context);
    
    try {
      const response = await gemini.generate(fullPrompt, this.config.systemPrompt);
      
      // Log action
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { prompt },
        output: { text: response.text },
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: response.tokensUsed,
        cost: this.calculateCost(response.tokensUsed),
        success: true,
      });
      
      return response.text;
    } catch (error: any) {
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { prompt },
        output: {},
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate structured JSON using Gemini
   */
  protected async generateJSON<T = any>(
    prompt: string,
    schema?: string,
    context?: AgentContext
  ): Promise<T> {
    const gemini = getGemini();
    const fullPrompt = this.buildPromptWithContext(prompt, context);
    
    try {
      const result = await gemini.generateJSON<T>(fullPrompt, schema, this.config.systemPrompt);
      
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { prompt, schema },
        output: result,
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: gemini.countTokens(JSON.stringify(result)),
        cost: 0,
        success: true,
      });
      
      return result;
    } catch (error: any) {
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { prompt, schema },
        output: {},
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute a tool
   */
  protected async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    const tool = this.config.tools.find(t => t.name === toolName);
    
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    
    try {
      const result = await tool.execute(params);
      
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { tool: toolName, params },
        output: result,
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: 0,
        cost: 0,
        success: true,
      });
      
      return result;
    } catch (error: any) {
      this.logAction({
        id: uuidv4(),
        agentName: this.config.name,
        actionType: 'execute',
        input: { tool: toolName, params },
        output: {},
        timestamp: new Date().toISOString(),
        duration: 0,
        tokensUsed: 0,
        cost: 0,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  // ============================================================================
  // COMMUNICATION (MCP Protocol)
  // ============================================================================

  /**
   * Send message to another agent
   */
  async sendMessage(to: string, message: AgentMessage): Promise<void> {
    // This will be handled by AgentCoordinator
    console.log(`📤 [${this.config.name}] → [${to}]:`, message.payload.action);
  }

  /**
   * Receive message from another agent
   */
  async receiveMessage(message: AgentMessage): Promise<AgentMessage | null> {
    console.log(`📥 [${this.config.name}] ← [${message.from}]:`, message.payload.action);
    
    // Handle message based on type
    switch (message.type) {
      case 'request':
        return await this.handleRequest(message);
      case 'event':
        await this.handleEvent(message);
        return null;
      default:
        return null;
    }
  }

  /**
   * Handle request message
   */
  protected async handleRequest(message: AgentMessage): Promise<AgentMessage> {
    // Default implementation - override in subclasses
    return {
      id: uuidv4(),
      from: this.config.id,
      to: message.from,
      type: 'response',
      payload: {
        action: message.payload.action,
        data: { status: 'not_implemented' },
        context: message.payload.context,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        priority: 'medium',
        requiresResponse: false,
        correlationId: message.id,
      },
    };
  }

  /**
   * Handle event message
   */
  protected async handleEvent(message: AgentMessage): Promise<void> {
    // Default implementation - override in subclasses
    console.log(`🔔 [${this.config.name}] received event:`, message.payload.action);
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  /**
   * Monitor execution of a plan step
   */
  async monitorStep(step: AgentPlanStep, context: AgentContext): Promise<void> {
    console.log(`👁️ [${this.config.name}] Monitoring step: ${step.description}`);
    // Implementation for monitoring step execution
  }

  /**
   * Get agent performance metrics
   */
  getMetrics(): {
    totalActions: number;
    successRate: number;
    averageDuration: number;
    totalCost: number;
  } {
    const successfulActions = this.actionHistory.filter(a => a.success);
    const totalDuration = this.actionHistory.reduce((sum, a) => sum + a.duration, 0);
    const totalCost = this.actionHistory.reduce((sum, a) => sum + a.cost, 0);
    
    return {
      totalActions: this.actionHistory.length,
      successRate: this.actionHistory.length > 0 
        ? successfulActions.length / this.actionHistory.length 
        : 0,
      averageDuration: this.actionHistory.length > 0 
        ? totalDuration / this.actionHistory.length 
        : 0,
      totalCost,
    };
  }

  // ============================================================================
  // LEARNING
  // ============================================================================

  /**
   * Learn from feedback
   */
  async learn(feedback: { rating: number; comment: string }): Promise<void> {
    console.log(`🧠 [${this.config.name}] Learning from feedback:`, feedback);
    // Implementation for learning from feedback
    // Could store in database, adjust parameters, etc.
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Build prompt with context
   */
  protected buildPromptWithContext(prompt: string, context?: AgentContext): string {
    if (!context) {
      return prompt;
    }
    
    let fullPrompt = prompt;
    
    // Add workflow context
    if (context.workflowName) {
      fullPrompt = `Workflow: ${context.workflowName}\n\n${fullPrompt}`;
    }
    
    // Add constraints
    if (context.constraints && Object.keys(context.constraints).length > 0) {
      const constraintsStr = Object.entries(context.constraints)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      fullPrompt = `${fullPrompt}\n\nConstraints:\n${constraintsStr}`;
    }
    
    // Add history
    if (context.history && context.history.length > 0) {
      const historyStr = context.history
        .slice(-3) // Last 3 actions
        .map(action => `- ${action.actionType}: ${action.success ? '✓' : '✗'}`)
        .join('\n');
      fullPrompt = `${fullPrompt}\n\nRecent history:\n${historyStr}`;
    }
    
    return fullPrompt;
  }

  /**
   * Log action to history
   */
  protected logAction(action: AgentAction): void {
    this.actionHistory.push(action);
    
    // Keep only last 100 actions
    if (this.actionHistory.length > 100) {
      this.actionHistory.shift();
    }
  }

  /**
   * Calculate cost based on tokens
   */
  protected calculateCost(tokens: number): number {
    // Gemini 3.0 pricing (approximate)
    const costPerMillionTokens = 0.075; // $0.075 per 1M tokens
    return (tokens / 1_000_000) * costPerMillionTokens;
  }

  /**
   * Get agent info
   */
  getInfo(): AgentConfig {
    return this.config;
  }

  /**
   * Check if agent has capability
   */
  hasCapability(capability: string): boolean {
    return (this.config.capabilities as any)[capability] === true;
  }
}

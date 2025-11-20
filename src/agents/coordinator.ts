/**
 * Agent Coordinator
 * Orchestrates multiple AI agents using MCP protocol
 */

import { ExhibitionAgent } from './exhibition.agent';
import { BudgetAgent } from './budget.agent';
import { ArchiveAgent } from './archive.agent';
import { BaseAgent } from './base.agent';
import type {
  AgentMessage,
  AgentDomain,
  AgentContext,
  ExhibitionPlanRequest,
  ExhibitionPlan,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Agent Coordinator
 * Central orchestrator for all AI agents
 */
export class AgentCoordinator {
  private agents: Map<AgentDomain, BaseAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  
  constructor() {
    // Initialize all agents
    this.registerAgent('exhibition', new ExhibitionAgent());
    this.registerAgent('budget', new BudgetAgent());
    this.registerAgent('archive', new ArchiveAgent());
  }

  /**
   * Initialize all agents
   */
  async initialize(): Promise<void> {
    console.log('🎭 Initializing Agent Coordinator...');
    
    for (const [domain, agent] of this.agents) {
      await agent.initialize();
      console.log(`✅ ${domain} agent ready`);
    }
    
    console.log('✅ Agent Coordinator initialized');
  }

  /**
   * Register an agent
   */
  private registerAgent(domain: AgentDomain, agent: BaseAgent): void {
    this.agents.set(domain, agent);
  }

  /**
   * Get agent by domain
   */
  getAgent(domain: AgentDomain): BaseAgent | undefined {
    return this.agents.get(domain);
  }

  /**
   * Get all agent info
   */
  getAllAgents(): Array<{ domain: AgentDomain; name: string; capabilities: string[] }> {
    return Array.from(this.agents.entries()).map(([domain, agent]) => {
      const info = agent.getInfo();
      return {
        domain,
        name: info.name,
        capabilities: Object.entries(info.capabilities)
          .filter(([_, value]) => value === true)
          .map(([key]) => key),
      };
    });
  }

  /**
   * Create exhibition workflow (main orchestration)
   */
  async createExhibitionWorkflow(
    request: ExhibitionPlanRequest,
    context: AgentContext
  ): Promise<ExhibitionPlan> {
    console.log('🎭 Orchestrating exhibition workflow...');
    
    try {
      // Step 1: Exhibition Agent creates initial plan
      const exhibitionAgent = this.agents.get('exhibition') as ExhibitionAgent;
      if (!exhibitionAgent) {
        throw new Error('Exhibition agent not found');
      }
      
      console.log('📋 Step 1: Creating exhibition plan...');
      const exhibitionPlan = await exhibitionAgent.planExhibition(request, context);
      
      // Step 2: Budget Agent validates/optimizes budget
      if (request.budget) {
        const budgetAgent = this.agents.get('budget') as BudgetAgent;
        if (budgetAgent) {
          console.log('📋 Step 2: Validating budget...');
          
          const budgetEstimate = await budgetAgent.estimateBudget(
            { 
              exhibitionPlan, 
              constraints: { maxBudget: request.budget } 
            },
            context
          );
          
          // Update exhibition plan with accurate budget
          exhibitionPlan.budget = budgetEstimate;
        }
      }
      
      // Step 3: Archive Agent enriches artwork data (optional)
      const archiveAgent = this.agents.get('archive') as ArchiveAgent;
      if (archiveAgent && exhibitionPlan.artworks.length > 0) {
        console.log('📋 Step 3: Enriching artwork data...');
        
        // Could search for similar artworks or validate selections
        // For now, we'll skip this step
      }
      
      console.log('✅ Exhibition workflow created successfully');
      return exhibitionPlan;
      
    } catch (error: any) {
      console.error('❌ Workflow orchestration failed:', error);
      throw new Error(`Workflow orchestration failed: ${error.message}`);
    }
  }

  /**
   * Route message between agents
   */
  async routeMessage(message: AgentMessage): Promise<void> {
    const targetAgent = Array.from(this.agents.values()).find(
      agent => agent.getInfo().id === message.to
    );
    
    if (!targetAgent) {
      console.error(`❌ Target agent not found: ${message.to}`);
      return;
    }
    
    console.log(`📨 Routing message: ${message.from} → ${message.to}`);
    await targetAgent.receiveMessage(message);
  }

  /**
   * Broadcast event to all agents
   */
  async broadcastEvent(event: AgentMessage): Promise<void> {
    console.log(`📢 Broadcasting event: ${event.payload.action}`);
    
    for (const agent of this.agents.values()) {
      await agent.receiveMessage(event);
    }
  }

  /**
   * Get agent metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [domain, agent] of this.agents) {
      metrics[domain] = agent.getMetrics();
    }
    
    return metrics;
  }

  /**
   * Shutdown all agents
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Agent Coordinator...');
    this.agents.clear();
    this.messageQueue = [];
    console.log('✅ Agent Coordinator shut down');
  }
}

/**
 * Singleton instance
 */
let coordinatorInstance: AgentCoordinator | null = null;

export function initCoordinator(): AgentCoordinator {
  if (!coordinatorInstance) {
    coordinatorInstance = new AgentCoordinator();
  }
  return coordinatorInstance;
}

export function getCoordinator(): AgentCoordinator {
  if (!coordinatorInstance) {
    throw new Error('Coordinator not initialized. Call initCoordinator() first.');
  }
  return coordinatorInstance;
}

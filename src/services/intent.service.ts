/**
 * Intent Recognition Service
 * Parse natural language to understand user intent and generate workflows
 */

import { getGemini } from './gemini.service';
import { getCoordinator } from '../agents/coordinator';
import type { ExhibitionPlanRequest } from '../types/agent.types';

export interface Intent {
  type: 'create_workflow' | 'search_artwork' | 'estimate_budget' | 'unknown';
  confidence: number;
  parameters: Record<string, any>;
  rawQuery: string;
}

export interface WorkflowGenerationRequest {
  prompt: string;
  context?: {
    museum?: string;
    budget?: number;
    duration?: string;
    userId?: string;
  };
}

export interface WorkflowGenerationResult {
  workflowId: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any[];
  metadata: {
    generatedBy: 'ai';
    model: string;
    confidence: number;
    processingTime: number;
  };
}

/**
 * Intent Recognition Service
 */
export class IntentService {
  /**
   * Parse natural language query to extract intent
   */
  async recognizeIntent(query: string): Promise<Intent> {
    const gemini = getGemini();
    
    const prompt = `
Analyze this user query and determine the intent:

Query: "${query}"

Identify:
1. Primary intent (create_workflow, search_artwork, estimate_budget, or unknown)
2. Confidence level (0-1)
3. Extracted parameters

Examples:
- "새로운 현대미술 전시 기획해줘" → create_workflow, {theme: "현대미술"}
- "인상파 작품 찾아줘" → search_artwork, {style: "인상파"}
- "이 전시 예산 얼마나 들까?" → estimate_budget, {}

Respond with JSON:
{
  "type": "create_workflow|search_artwork|estimate_budget|unknown",
  "confidence": 0.0-1.0,
  "parameters": {},
  "reasoning": "string"
}
`;

    try {
      const result = await gemini.generateJSON<any>(prompt);
      
      return {
        type: result.type,
        confidence: result.confidence,
        parameters: result.parameters || {},
        rawQuery: query,
      };
    } catch (error: any) {
      console.error('❌ Intent recognition failed:', error);
      return {
        type: 'unknown',
        confidence: 0,
        parameters: {},
        rawQuery: query,
      };
    }
  }

  /**
   * Generate complete workflow from natural language
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResult> {
    console.log('🔮 Generating workflow from prompt:', request.prompt);
    const startTime = Date.now();
    
    try {
      // Step 1: Recognize intent
      const intent = await this.recognizeIntent(request.prompt);
      
      if (intent.type !== 'create_workflow') {
        throw new Error(`Invalid intent for workflow generation: ${intent.type}`);
      }
      
      // Step 2: Extract exhibition parameters
      const exhibitionRequest = this.extractExhibitionParams(intent, request.context);
      
      // Step 3: Use Agent Coordinator to orchestrate workflow creation
      const coordinator = getCoordinator();
      await coordinator.initialize();
      
      const exhibitionPlan = await coordinator.createExhibitionWorkflow(
        exhibitionRequest,
        {
          workflowId: `workflow-${Date.now()}`,
          workflowName: exhibitionRequest.theme,
          nodeId: '',
          nodeType: '',
          userId: request.context?.userId || 'system',
          userName: 'AI Generator',
          history: [],
          relevantEntities: [],
          constraints: {
            budget: exhibitionRequest.budget,
            duration: exhibitionRequest.duration,
          },
        }
      );
      
      // Step 4: Convert to workflow format
      const processingTime = Date.now() - startTime;
      
      const result: WorkflowGenerationResult = {
        workflowId: `workflow-${Date.now()}`,
        name: exhibitionPlan.concept.theme,
        description: exhibitionPlan.concept.description,
        nodes: exhibitionPlan.nodes,
        connections: this.generateConnections(exhibitionPlan.nodes),
        metadata: {
          generatedBy: 'ai',
          model: 'gemini-2.0-flash-exp',
          confidence: intent.confidence,
          processingTime,
        },
      };
      
      console.log(`✅ Workflow generated in ${processingTime}ms`);
      return result;
      
    } catch (error: any) {
      console.error('❌ Workflow generation failed:', error);
      throw new Error(`Workflow generation failed: ${error.message}`);
    }
  }

  /**
   * Extract exhibition parameters from intent
   */
  private extractExhibitionParams(
    intent: Intent,
    context?: WorkflowGenerationRequest['context']
  ): ExhibitionPlanRequest {
    return {
      theme: intent.parameters.theme || intent.rawQuery,
      targetAudience: intent.parameters.targetAudience || context?.museum,
      budget: intent.parameters.budget || context?.budget,
      duration: intent.parameters.duration || context?.duration || 'P3M', // 3 months default
      venue: intent.parameters.venue,
      curatorPreference: intent.parameters.curator,
    };
  }

  /**
   * Generate connections between nodes (sequential flow)
   */
  private generateConnections(nodes: any[]): any[] {
    const connections = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: `connection-${i}`,
        from_node: nodes[i].id,
        to_node: nodes[i + 1].id,
        type: 'default',
        style: 'bezier',
        color: nodes[i].color,
      });
    }
    
    return connections;
  }

  /**
   * Suggest next steps based on current workflow state
   */
  async suggestNextSteps(workflowId: string, completedNodes: string[]): Promise<string[]> {
    const gemini = getGemini();
    
    const prompt = `
Given a workflow with these completed nodes: ${completedNodes.join(', ')}

Suggest 3-5 logical next steps for this museum workflow.

Respond with JSON array:
["step 1", "step 2", "step 3"]
`;

    try {
      const suggestions = await gemini.generateJSON<string[]>(prompt);
      return suggestions;
    } catch (error) {
      return [];
    }
  }
}

/**
 * Singleton instance
 */
let intentInstance: IntentService | null = null;

export function initIntent(): IntentService {
  if (!intentInstance) {
    intentInstance = new IntentService();
  }
  return intentInstance;
}

export function getIntent(): IntentService {
  if (!intentInstance) {
    throw new Error('Intent service not initialized. Call initIntent() first.');
  }
  return intentInstance;
}

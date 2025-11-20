/**
 * Budget Agent
 * AI Agent specialized in budget estimation and financial optimization
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
  AgentPlanStep,
  BudgetEstimateRequest,
  BudgetEstimate,
  ExhibitionPlan,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

export class BudgetAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'budget-agent',
      name: 'Budget Agent',
      domain: 'budget',
      version: '1.0.0',
      
      model: 'gemini-2.0-flash-exp',
      temperature: 0.3, // Lower temperature for more consistent calculations
      maxTokens: 4000,
      
      capabilities: {
        plan: true,
        execute: true,
        monitor: true,
        learn: true,
        analyze: true,
        generate: false,
        recommend: true,
        optimize: true,
        collaborate: true,
        delegate: false,
      },
      
      systemPrompt: `You are an expert financial analyst and budget planner for museums.

Your expertise includes:
- Exhibition cost estimation
- Budget optimization
- Financial feasibility analysis
- Cost breakdown by category
- Contingency planning
- ROI analysis

When estimating budgets:
1. Consider all cost categories (venue, artworks, staff, marketing, etc.)
2. Provide detailed breakdowns
3. Include 10-15% contingency
4. Consider market rates and historical data
5. Flag potential cost overruns
6. Suggest cost-saving alternatives

Always provide realistic, well-justified estimates.`,
      
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
    console.log('💰 Budget Agent initialized');
  }

  // ============================================================================
  // BUDGET ESTIMATION
  // ============================================================================

  /**
   * Estimate comprehensive budget for exhibition plan
   */
  async estimateBudget(request: BudgetEstimateRequest, context: AgentContext): Promise<BudgetEstimate> {
    console.log('💰 Estimating budget for exhibition...');
    
    const plan = request.exhibitionPlan;
    const constraints = request.constraints;
    
    const prompt = `
Estimate a detailed budget for this exhibition:

Exhibition: ${plan.concept.theme}
Description: ${plan.concept.description}
Duration: ${plan.timeline.startDate} to ${plan.timeline.endDate}
Number of Artworks: ${plan.artworks.length}
Target Audience: ${plan.concept.targetAudience}

${constraints?.maxBudget ? `Maximum Budget: $${constraints.maxBudget.toLocaleString()}` : ''}
${constraints?.mustInclude ? `Must Include: ${constraints.mustInclude.join(', ')}` : ''}
${constraints?.canOmit ? `Can Omit: ${constraints.canOmit.join(', ')}` : ''}

Provide a comprehensive budget estimate with:
1. Total estimated cost
2. Detailed breakdown by category:
   - Venue rental
   - Artwork loans and insurance
   - Installation and deinstallation
   - Lighting and equipment
   - Marketing and publicity
   - Staffing (curators, guards, guides)
   - Educational programs
   - Opening event
   - Catalog production
   - Contingency (10-15%)
3. Confidence level (0-1)
4. Alternative scenarios (if over budget)

For each category, provide:
- Description
- Estimated amount
- List of specific items with quantity, unit cost, and total

Format as JSON:
{
  "total": number,
  "breakdown": [
    {
      "category": "string",
      "amount": number,
      "items": [
        {
          "description": "string",
          "quantity": number,
          "unitCost": number,
          "total": number
        }
      ]
    }
  ],
  "contingency": number,
  "confidence": number,
  "alternatives": [
    {
      "scenario": "string",
      "total": number,
      "changes": ["string"]
    }
  ]
}
`;

    try {
      const estimate = await this.generateJSON<BudgetEstimate>(prompt, undefined, context);
      
      console.log(`✅ Budget estimated: $${estimate.total.toLocaleString()}`);
      return estimate;
      
    } catch (error: any) {
      console.error('❌ Failed to estimate budget:', error);
      throw new Error(`Budget estimation failed: ${error.message}`);
    }
  }

  /**
   * Optimize budget to meet constraints
   */
  async optimizeBudget(
    estimate: BudgetEstimate,
    maxBudget: number,
    context: AgentContext
  ): Promise<BudgetEstimate> {
    console.log('💰 Optimizing budget...');
    
    const prompt = `
Current budget estimate: $${estimate.total.toLocaleString()}
Target budget: $${maxBudget.toLocaleString()}
Reduction needed: $${(estimate.total - maxBudget).toLocaleString()}

Current breakdown:
${estimate.breakdown.map(cat => 
  `- ${cat.category}: $${cat.amount.toLocaleString()}`
).join('\n')}

Optimize this budget to meet the target while:
1. Maintaining exhibition quality
2. Preserving core elements
3. Suggesting practical alternatives
4. Identifying cost-saving opportunities

Provide optimized budget with same JSON structure as before.
`;

    try {
      const optimized = await this.generateJSON<BudgetEstimate>(prompt, undefined, context);
      
      console.log(`✅ Budget optimized: $${optimized.total.toLocaleString()}`);
      return optimized;
      
    } catch (error: any) {
      console.error('❌ Failed to optimize budget:', error);
      throw new Error(`Budget optimization failed: ${error.message}`);
    }
  }

  /**
   * Validate budget against constraints
   */
  async validateBudget(
    estimate: BudgetEstimate,
    constraints?: {
      maxBudget?: number;
      requiredCategories?: string[];
    }
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check max budget
    if (constraints?.maxBudget && estimate.total > constraints.maxBudget) {
      issues.push(`Total exceeds maximum budget by $${(estimate.total - constraints.maxBudget).toLocaleString()}`);
    }
    
    // Check required categories
    if (constraints?.requiredCategories) {
      const categories = estimate.breakdown.map(b => b.category.toLowerCase());
      const missing = constraints.requiredCategories.filter(
        req => !categories.some(cat => cat.includes(req.toLowerCase()))
      );
      
      if (missing.length > 0) {
        issues.push(`Missing required categories: ${missing.join(', ')}`);
      }
    }
    
    // Check contingency
    const contingencyRatio = estimate.contingency / estimate.total;
    if (contingencyRatio < 0.05) {
      issues.push('Contingency too low (should be at least 5%)');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // ============================================================================
  // AGENT INTERFACE IMPLEMENTATION
  // ============================================================================

  async plan(task: BudgetEstimateRequest, context: AgentContext): Promise<AgentPlan> {
    const steps: AgentPlanStep[] = [
      {
        id: 'step-1',
        order: 1,
        description: 'Analyze exhibition requirements',
        action: 'analyze',
        parameters: { plan: task.exhibitionPlan },
        dependsOn: [],
        status: 'pending',
      },
      {
        id: 'step-2',
        order: 2,
        description: 'Calculate cost estimates',
        action: 'calculate',
        parameters: {},
        dependsOn: ['step-1'],
        status: 'pending',
      },
      {
        id: 'step-3',
        order: 3,
        description: 'Create budget breakdown',
        action: 'breakdown',
        parameters: {},
        dependsOn: ['step-2'],
        status: 'pending',
      },
      {
        id: 'step-4',
        order: 4,
        description: 'Validate against constraints',
        action: 'validate',
        parameters: { constraints: task.constraints },
        dependsOn: ['step-3'],
        status: 'pending',
      },
      {
        id: 'step-5',
        order: 5,
        description: 'Generate alternatives if needed',
        action: 'optimize',
        parameters: {},
        dependsOn: ['step-4'],
        status: 'pending',
      },
    ];

    return {
      id: uuidv4(),
      agentName: this.config.name,
      goal: 'Estimate comprehensive exhibition budget',
      steps,
      dependencies: [],
      estimatedDuration: 15000, // 15 seconds
      estimatedCost: 0.02,
      confidence: 0.9,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<BudgetEstimate> {
    console.log('💰 Executing budget estimation...');
    
    // Extract request from plan
    const analyzeStep = plan.steps.find(s => s.action === 'analyze');
    const validateStep = plan.steps.find(s => s.action === 'validate');
    
    const request: BudgetEstimateRequest = {
      exhibitionPlan: analyzeStep?.parameters.plan,
      constraints: validateStep?.parameters.constraints,
    };
    
    // Execute estimation
    const estimate = await this.estimateBudget(request, context);
    
    // Optimize if over budget
    if (request.constraints?.maxBudget && estimate.total > request.constraints.maxBudget) {
      return await this.optimizeBudget(estimate, request.constraints.maxBudget, context);
    }
    
    return estimate;
  }
}

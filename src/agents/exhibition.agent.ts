/**
 * Exhibition Agent
 * AI Agent specialized in exhibition planning and curation
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
  AgentPlanStep,
  ExhibitionPlanRequest,
  ExhibitionPlan,
} from '../types/agent.types';
import type { NodeParsed } from '../types/database.types';
import { v4 as uuidv4 } from 'uuid';

export class ExhibitionAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'exhibition-agent',
      name: 'Exhibition Agent',
      domain: 'exhibition',
      version: '1.0.0',
      
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 8000,
      
      capabilities: {
        plan: true,
        execute: true,
        monitor: true,
        learn: true,
        analyze: true,
        generate: true,
        recommend: true,
        optimize: true,
        collaborate: true,
        delegate: true,
      },
      
      systemPrompt: `You are an expert exhibition curator and planner for museums.

Your expertise includes:
- Exhibition concept development
- Artwork selection and curation
- Spatial layout and design
- Visitor experience optimization
- Budget estimation
- Timeline planning
- Collaboration with other museum departments

You think critically about:
- Historical and cultural context
- Audience engagement
- Educational value
- Artistic coherence
- Practical constraints

When creating exhibition plans:
1. Start with a clear, compelling concept
2. Select artworks that support the narrative
3. Consider visitor flow and experience
4. Ensure budget feasibility
5. Create realistic timelines
6. Identify key dependencies

Always provide structured, actionable plans.`,
      
      tools: [],
      
      maxRetries: 3,
      timeout: 60000,
      rateLimit: {
        requestsPerMinute: 10,
        tokensPerMinute: 50000,
      },
    };
    
    super(config);
  }

  async initialize(): Promise<void> {
    console.log('🎨 Exhibition Agent initialized');
  }

  // ============================================================================
  // EXHIBITION PLANNING
  // ============================================================================

  /**
   * Create comprehensive exhibition plan from natural language request
   */
  async planExhibition(request: ExhibitionPlanRequest, context: AgentContext): Promise<ExhibitionPlan> {
    console.log('🎨 Planning exhibition:', request.theme);
    
    const prompt = `
Create a comprehensive exhibition plan for:

Theme: ${request.theme}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
${request.budget ? `Budget: $${request.budget.toLocaleString()}` : ''}
${request.duration ? `Duration: ${request.duration}` : ''}
${request.venue ? `Venue: ${request.venue}` : ''}
${request.curatorPreference ? `Curator Preference: ${request.curatorPreference}` : ''}

Provide a complete exhibition plan with:
1. Exhibition concept (theme, description, objectives, target audience)
2. Budget breakdown (total and by category)
3. Recommended artworks (at least 10-15 pieces with titles, artists, and selection rationale)
4. Timeline with milestones
5. Key success metrics

Format as JSON with this structure:
{
  "concept": {
    "theme": "string",
    "description": "string",
    "targetAudience": "string",
    "objectives": ["string"]
  },
  "budget": {
    "total": number,
    "breakdown": {
      "venue": number,
      "artworkLoans": number,
      "installation": number,
      "marketing": number,
      "staffing": number,
      "insurance": number,
      "contingency": number
    }
  },
  "artworks": [
    {
      "id": "artwork-1",
      "title": "string",
      "artist": "string",
      "year": "string",
      "medium": "string",
      "reason": "string"
    }
  ],
  "timeline": {
    "startDate": "ISO date",
    "endDate": "ISO date",
    "milestones": [
      {
        "date": "ISO date",
        "description": "string"
      }
    ]
  },
  "successMetrics": ["string"]
}
`;

    try {
      const planData = await this.generateJSON<any>(prompt, undefined, context);
      
      // Generate workflow nodes
      const nodes = await this.generateWorkflowNodes(planData, context);
      
      const exhibitionPlan: ExhibitionPlan = {
        concept: planData.concept,
        budget: planData.budget,
        artworks: planData.artworks || [],
        timeline: planData.timeline,
        nodes,
      };
      
      console.log('✅ Exhibition plan created:', exhibitionPlan.concept.theme);
      return exhibitionPlan;
      
    } catch (error: any) {
      console.error('❌ Failed to create exhibition plan:', error);
      throw new Error(`Exhibition planning failed: ${error.message}`);
    }
  }

  /**
   * Generate workflow nodes from exhibition plan
   */
  async generateWorkflowNodes(planData: any, context: AgentContext): Promise<NodeParsed[]> {
    console.log('📦 Generating workflow nodes...');
    
    const nodes: NodeParsed[] = [];
    let xOffset = 100;
    let yOffset = 100;
    const horizontalSpacing = 250;
    const verticalSpacing = 200;
    
    // Phase 1: Planning (Exhibition category)
    const planningNodes = [
      {
        type: 'Exhibition Planning',
        title: 'Exhibition Concept',
        description: planData.concept?.description || '',
        category: 'exhibition',
        icon: '🎨',
        color: '#8b5cf6',
      },
      {
        type: 'Curator Assignment',
        title: 'Assign Curator',
        description: 'Select and assign exhibition curator',
        category: 'exhibition',
        icon: '👤',
        color: '#8b5cf6',
      },
      {
        type: 'Budget Planning',
        title: 'Budget Approval',
        description: `Total: $${planData.budget?.total?.toLocaleString() || '0'}`,
        category: 'admin',
        icon: '💰',
        color: '#6366f1',
      },
    ];
    
    planningNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing),
        position_y: yOffset,
      }));
    });
    
    yOffset += verticalSpacing;
    
    // Phase 2: Artwork Selection (Archive category)
    const artworkNodes = [
      {
        type: 'Artwork Selection',
        title: 'Select Artworks',
        description: `${planData.artworks?.length || 0} pieces selected`,
        category: 'archive',
        icon: '🖼️',
        color: '#10b981',
      },
      {
        type: 'Loan Management',
        title: 'Arrange Artwork Loans',
        description: 'Coordinate with lending institutions',
        category: 'archive',
        icon: '🤝',
        color: '#10b981',
      },
      {
        type: 'Condition Report',
        title: 'Artwork Inspection',
        description: 'Document condition of all pieces',
        category: 'archive',
        icon: '📝',
        color: '#10b981',
      },
    ];
    
    artworkNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing),
        position_y: yOffset,
      }));
    });
    
    yOffset += verticalSpacing;
    
    // Phase 3: Installation (Exhibition category)
    const installationNodes = [
      {
        type: 'Layout Design',
        title: 'Space Planning',
        description: 'Design exhibition layout',
        category: 'exhibition',
        icon: '📐',
        color: '#8b5cf6',
      },
      {
        type: 'Lighting Setup',
        title: 'Lighting Design',
        description: 'Plan and install lighting',
        category: 'exhibition',
        icon: '💡',
        color: '#8b5cf6',
      },
      {
        type: 'Installation',
        title: 'Artwork Installation',
        description: 'Install all exhibition pieces',
        category: 'exhibition',
        icon: '🔨',
        color: '#8b5cf6',
      },
      {
        type: 'Label Creation',
        title: 'Create Labels',
        description: 'Design and print labels',
        category: 'exhibition',
        icon: '🏷️',
        color: '#8b5cf6',
      },
    ];
    
    installationNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing),
        position_y: yOffset,
      }));
    });
    
    yOffset += verticalSpacing;
    
    // Phase 4: Marketing & Education (Publication & Education categories)
    const marketingNodes = [
      {
        type: 'Catalog Writing',
        title: 'Exhibition Catalog',
        description: 'Create exhibition catalog',
        category: 'publication',
        icon: '✍️',
        color: '#f59e0b',
      },
      {
        type: 'Press Release',
        title: 'Media Outreach',
        description: 'Prepare press materials',
        category: 'publication',
        icon: '📰',
        color: '#f59e0b',
      },
      {
        type: 'Social Media',
        title: 'Social Campaign',
        description: 'Launch social media campaign',
        category: 'publication',
        icon: '📱',
        color: '#f59e0b',
      },
      {
        type: 'Program Design',
        title: 'Educational Programs',
        description: 'Design tours and workshops',
        category: 'education',
        icon: '📚',
        color: '#06b6d4',
      },
    ];
    
    marketingNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing),
        position_y: yOffset,
      }));
    });
    
    yOffset += verticalSpacing;
    
    // Phase 5: Opening & Operations (Exhibition & Admin categories)
    const operationsNodes = [
      {
        type: 'Opening Event',
        title: 'Opening Reception',
        description: 'Host exhibition opening',
        category: 'exhibition',
        icon: '🎉',
        color: '#8b5cf6',
      },
      {
        type: 'Visitor Services',
        title: 'Daily Operations',
        description: 'Manage visitor experience',
        category: 'admin',
        icon: '🎫',
        color: '#6366f1',
      },
      {
        type: 'Visitor Feedback',
        title: 'Collect Feedback',
        description: 'Gather visitor responses',
        category: 'exhibition',
        icon: '📝',
        color: '#8b5cf6',
      },
    ];
    
    operationsNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing),
        position_y: yOffset,
      }));
    });
    
    yOffset += verticalSpacing;
    
    // Phase 6: Closing (Exhibition & Archive categories)
    const closingNodes = [
      {
        type: 'Deinstallation',
        title: 'Exhibition Closure',
        description: 'Deinstall and pack artworks',
        category: 'exhibition',
        icon: '📦',
        color: '#8b5cf6',
      },
      {
        type: 'Evaluation',
        title: 'Exhibition Evaluation',
        description: 'Analyze success metrics',
        category: 'admin',
        icon: '📊',
        color: '#6366f1',
      },
    ];
    
    closingNodes.forEach((nodeData, index) => {
      nodes.push(this.createNode({
        ...nodeData,
        workflowId: context.workflowId,
        position_x: xOffset + (index * horizontalSpacing) + 250,
        position_y: yOffset,
      }));
    });
    
    console.log(`✅ Generated ${nodes.length} workflow nodes`);
    return nodes;
  }

  /**
   * Create a node with default values
   */
  private createNode(data: Partial<NodeParsed> & { workflowId: string }): NodeParsed {
    return {
      id: `node-${uuidv4()}`,
      workflow_id: data.workflowId,
      type: data.type || 'Unknown',
      category: data.category || 'exhibition',
      position_x: data.position_x || 0,
      position_y: data.position_y || 0,
      width: 200,
      height: 150,
      title: data.title || data.type || 'Untitled',
      description: data.description || '',
      status: 'todo',
      color: data.color || '#8b5cf6',
      icon: data.icon || '📦',
      assigned_agent: 'exhibition-agent',
      agent_config: null,
      execution_status: null,
      execution_started_at: null,
      execution_completed_at: null,
      execution_result: null,
      execution_error: null,
      execution_progress: 0,
      notion_task_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
    };
  }

  // ============================================================================
  // AGENT INTERFACE IMPLEMENTATION
  // ============================================================================

  async plan(task: ExhibitionPlanRequest, context: AgentContext): Promise<AgentPlan> {
    const steps: AgentPlanStep[] = [
      {
        id: 'step-1',
        order: 1,
        description: 'Analyze exhibition request and constraints',
        action: 'analyze',
        parameters: { task },
        dependsOn: [],
        status: 'pending',
      },
      {
        id: 'step-2',
        order: 2,
        description: 'Generate exhibition concept',
        action: 'generateConcept',
        parameters: { theme: task.theme },
        dependsOn: ['step-1'],
        status: 'pending',
      },
      {
        id: 'step-3',
        order: 3,
        description: 'Select artworks',
        action: 'selectArtworks',
        parameters: { concept: 'TBD' },
        dependsOn: ['step-2'],
        status: 'pending',
      },
      {
        id: 'step-4',
        order: 4,
        description: 'Estimate budget',
        action: 'estimateBudget',
        parameters: { artworks: 'TBD' },
        dependsOn: ['step-3'],
        status: 'pending',
      },
      {
        id: 'step-5',
        order: 5,
        description: 'Create timeline',
        action: 'createTimeline',
        parameters: { duration: task.duration },
        dependsOn: ['step-4'],
        status: 'pending',
      },
      {
        id: 'step-6',
        order: 6,
        description: 'Generate workflow nodes',
        action: 'generateNodes',
        parameters: {},
        dependsOn: ['step-5'],
        status: 'pending',
      },
    ];

    return {
      id: uuidv4(),
      agentName: this.config.name,
      goal: `Create exhibition plan for: ${task.theme}`,
      steps,
      dependencies: ['budget-agent', 'archive-agent'],
      estimatedDuration: 30000, // 30 seconds
      estimatedCost: 0.05,
      confidence: 0.85,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<ExhibitionPlan> {
    console.log('🎨 Executing exhibition plan...');
    
    // For now, extract request from plan steps
    const analyzeStep = plan.steps.find(s => s.action === 'analyze');
    const request: ExhibitionPlanRequest = analyzeStep?.parameters.task || {};
    
    // Execute the actual planning
    return await this.planExhibition(request, context);
  }
}

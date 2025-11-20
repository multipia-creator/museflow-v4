/**
 * Archive Agent
 * AI Agent specialized in artwork search and recommendation
 */

import { BaseAgent } from './base.agent';
import type {
  AgentConfig,
  AgentContext,
  AgentPlan,
  ArchiveSearchRequest,
  ArchiveSearchResult,
} from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

export class ArchiveAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'archive-agent',
      name: 'Archive Agent',
      domain: 'archive',
      version: '1.0.0',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.5,
      maxTokens: 6000,
      capabilities: {
        plan: true,
        execute: true,
        monitor: true,
        learn: true,
        analyze: true,
        generate: false,
        recommend: true,
        optimize: false,
        collaborate: true,
        delegate: false,
      },
      systemPrompt: `You are an expert art archivist and collections manager.

Your expertise:
- Art history and movements
- Artist biographies
- Artwork provenance
- Collection management
- Conservation
- Semantic artwork search

When searching artworks:
1. Understand query intent
2. Consider historical context
3. Match artistic styles
4. Ensure availability
5. Provide relevance scores`,
      tools: [],
      maxRetries: 3,
      timeout: 30000,
      rateLimit: { requestsPerMinute: 20, tokensPerMinute: 100000 },
    };
    super(config);
  }

  async initialize(): Promise<void> {
    console.log('📦 Archive Agent initialized');
  }

  async searchArtworks(request: ArchiveSearchRequest, context: AgentContext): Promise<ArchiveSearchResult> {
    console.log('📦 Searching artworks:', request.query);
    
    const prompt = `
Search museum archives for artworks matching:

Query: ${request.query}
${request.filters ? `Filters: ${JSON.stringify(request.filters)}` : ''}
Limit: ${request.limit || 20}

Generate realistic artwork results with:
- Korean modern/contemporary artists preferred
- Include artist, year, medium, dimensions
- Relevance score (0-1)
- Availability status

JSON format:
{
  "artworks": [{
    "id": "string",
    "title": "string",
    "artist": "string",
    "year": number,
    "medium": "string",
    "dimensions": "string",
    "location": "string",
    "available": boolean,
    "relevanceScore": number
  }],
  "totalResults": number,
  "queryUnderstanding": "string"
}
`;

    try {
      const result = await this.generateJSON<ArchiveSearchResult>(prompt, undefined, context);
      console.log(`✅ Found ${result.artworks.length} artworks`);
      return result;
    } catch (error: any) {
      throw new Error(`Artwork search failed: ${error.message}`);
    }
  }

  async plan(task: ArchiveSearchRequest, context: AgentContext): Promise<AgentPlan> {
    return {
      id: uuidv4(),
      agentName: this.config.name,
      goal: `Search artworks: ${task.query}`,
      steps: [
        {
          id: 'step-1',
          order: 1,
          description: 'Parse query and filters',
          action: 'parse',
          parameters: task,
          dependsOn: [],
          status: 'pending',
        },
        {
          id: 'step-2',
          order: 2,
          description: 'Search database',
          action: 'search',
          parameters: {},
          dependsOn: ['step-1'],
          status: 'pending',
        },
        {
          id: 'step-3',
          order: 3,
          description: 'Rank by relevance',
          action: 'rank',
          parameters: {},
          dependsOn: ['step-2'],
          status: 'pending',
        },
      ],
      dependencies: [],
      estimatedDuration: 10000,
      estimatedCost: 0.01,
      confidence: 0.9,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<ArchiveSearchResult> {
    const parseStep = plan.steps.find(s => s.action === 'parse');
    const request: ArchiveSearchRequest = parseStep?.parameters as ArchiveSearchRequest;
    return await this.searchArtworks(request, context);
  }
}

/**
 * Agent System Types
 * Types for AI Multi-Agent System
 */

import type { Node, NodeParsed } from './database.types';

// ============================================================================
// AGENT DOMAINS
// ============================================================================

export type AgentDomain = 
  | 'exhibition'
  | 'education'
  | 'archive'
  | 'publication'
  | 'research'
  | 'administration'
  | 'budget'
  | 'coordination';

// ============================================================================
// AGENT CAPABILITIES
// ============================================================================

export interface AgentCapabilities {
  // Core capabilities
  plan: boolean;      // Can create plans
  execute: boolean;   // Can execute tasks
  monitor: boolean;   // Can monitor progress
  learn: boolean;     // Can learn from feedback
  
  // Specialized capabilities
  analyze: boolean;   // Can analyze data
  generate: boolean;  // Can generate content
  recommend: boolean; // Can make recommendations
  optimize: boolean;  // Can optimize workflows
  
  // Communication
  collaborate: boolean; // Can work with other agents
  delegate: boolean;    // Can delegate tasks
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  domain: AgentDomain;
  version: string;
  
  // Model configuration
  model: string; // 'gemini-3.0-pro'
  temperature: number;
  maxTokens: number;
  
  // Capabilities
  capabilities: AgentCapabilities;
  
  // Behavior
  systemPrompt: string;
  tools: AgentTool[];
  
  // Limits
  maxRetries: number;
  timeout: number; // milliseconds
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// ============================================================================
// AGENT TOOLS
// ============================================================================

export interface AgentTool {
  name: string;
  description: string;
  parameters: AgentToolParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface AgentToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

// ============================================================================
// AGENT CONTEXT
// ============================================================================

export interface AgentContext {
  // Current workflow
  workflowId: string;
  workflowName: string;
  
  // Current node
  nodeId: string;
  nodeType: string;
  
  // User information
  userId: string;
  userName: string;
  
  // Previous context
  history: AgentAction[];
  
  // Knowledge graph
  relevantEntities: string[];
  
  // Constraints
  constraints: {
    budget?: number;
    deadline?: string;
    teamSize?: number;
    [key: string]: any;
  };
}

// ============================================================================
// AGENT ACTIONS
// ============================================================================

export interface AgentAction {
  id: string;
  agentName: string;
  actionType: 'plan' | 'execute' | 'monitor' | 'communicate' | 'learn';
  
  // Action details
  input: Record<string, any>;
  output: Record<string, any>;
  
  // Metadata
  timestamp: string;
  duration: number;
  tokensUsed: number;
  cost: number;
  
  // Result
  success: boolean;
  error?: string;
}

// ============================================================================
// AGENT MESSAGES (MCP Protocol)
// ============================================================================

export interface AgentMessage {
  id: string;
  from: string; // Agent ID
  to: string;   // Agent ID or 'coordinator'
  type: 'request' | 'response' | 'event' | 'negotiation';
  
  payload: {
    action: string;
    data: Record<string, any>;
    context: AgentContext;
  };
  
  metadata: {
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requiresResponse: boolean;
    correlationId?: string; // For request-response pairing
  };
}

// ============================================================================
// AGENT PLANS
// ============================================================================

export interface AgentPlan {
  id: string;
  agentName: string;
  goal: string;
  
  // Plan steps
  steps: AgentPlanStep[];
  
  // Dependencies
  dependencies: string[]; // Other agent IDs
  
  // Estimates
  estimatedDuration: number; // milliseconds
  estimatedCost: number;
  confidence: number; // 0-1
  
  // Status
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
  
  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentPlanStep {
  id: string;
  order: number;
  description: string;
  
  // Action
  action: string;
  parameters: Record<string, any>;
  
  // Dependencies
  dependsOn: string[]; // Other step IDs
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  
  // Result
  result?: Record<string, any>;
  error?: string;
  
  // Timing
  startedAt?: string;
  completedAt?: string;
}

// ============================================================================
// AGENT NEGOTIATION
// ============================================================================

export interface AgentNegotiation {
  id: string;
  topic: string;
  participants: string[]; // Agent IDs
  
  // Proposals
  proposals: AgentProposal[];
  
  // Status
  status: 'open' | 'resolved' | 'deadlock';
  resolution?: AgentResolution;
  
  // Timing
  startedAt: string;
  resolvedAt?: string;
}

export interface AgentProposal {
  id: string;
  agentId: string;
  proposal: Record<string, any>;
  rationale: string;
  priority: number; // Higher = more important
  timestamp: string;
}

export interface AgentResolution {
  agreedProposal: AgentProposal;
  compromises: string[];
  votes: Record<string, 'approve' | 'reject'>;
}

// ============================================================================
// SPECIFIC AGENT TYPES
// ============================================================================

// Exhibition Agent
export interface ExhibitionPlanRequest {
  theme: string;
  targetAudience?: string;
  budget?: number;
  duration?: string; // ISO 8601 duration
  venue?: string;
  curatorPreference?: string;
}

export interface ExhibitionPlan {
  concept: {
    theme: string;
    description: string;
    targetAudience: string;
    objectives: string[];
  };
  
  budget: {
    total: number;
    breakdown: Record<string, number>;
  };
  
  artworks: {
    id: string;
    title: string;
    artist: string;
    reason: string; // Why selected
  }[];
  
  timeline: {
    startDate: string;
    endDate: string;
    milestones: {
      date: string;
      description: string;
    }[];
  };
  
  nodes: NodeParsed[]; // Generated workflow nodes
}

// Budget Agent
export interface BudgetEstimateRequest {
  exhibitionPlan: ExhibitionPlan;
  constraints?: {
    maxBudget?: number;
    mustInclude?: string[];
    canOmit?: string[];
  };
}

export interface BudgetEstimate {
  total: number;
  breakdown: {
    category: string;
    amount: number;
    items: {
      description: string;
      quantity: number;
      unitCost: number;
      total: number;
    }[];
  }[];
  
  contingency: number;
  confidence: number; // 0-1
  
  alternatives?: {
    scenario: string;
    total: number;
    changes: string[];
  }[];
}

// Archive Agent
export interface ArchiveSearchRequest {
  query: string;
  filters?: {
    artist?: string;
    period?: string;
    medium?: string;
    style?: string;
    available?: boolean;
  };
  limit?: number;
}

export interface ArchiveSearchResult {
  artworks: {
    id: string;
    title: string;
    artist: string;
    year: number;
    medium: string;
    dimensions: string;
    imageUrl?: string;
    location: string;
    available: boolean;
    relevanceScore: number;
  }[];
  
  totalResults: number;
  queryUnderstanding: string;
}

// ============================================================================
// AGENT REGISTRY
// ============================================================================

export interface AgentRegistration {
  agentId: string;
  config: AgentConfig;
  status: 'active' | 'inactive' | 'maintenance';
  registeredAt: string;
  lastActivity: string;
  
  // Performance metrics
  metrics: {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    totalCost: number;
  };
}

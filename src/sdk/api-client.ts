/**
 * MuseFlow API Client SDK
 * Type-safe TypeScript SDK for frontend-backend communication
 */

import type {
  Workflow,
  WorkflowParsed,
  Node,
  NodeParsed,
  Connection,
  ConnectionParsed,
  AISuggestion,
} from '../types/database.types';

import type {
  ExhibitionPlanRequest,
  AgentContext,
} from '../types/agent.types';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkflowWithDetails {
  workflow: Workflow;
  nodes: Node[];
  connections: Connection[];
}

export interface WorkflowGenerationResult {
  workflowId: string;
  name: string;
  description: string;
  nodesCount: number;
  connectionsCount: number;
  metadata: {
    generatedAt: string;
    model: string;
    tokensUsed: number;
    generationTime: number;
  };
}

export interface IntentRecognitionResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export class MuseFlowApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${this.timeout}ms`,
        };
      }

      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  // ==========================================================================
  // WORKFLOW METHODS
  // ==========================================================================

  /**
   * Create a new workflow
   */
  async createWorkflow(data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get workflow with nodes and connections
   */
  async getWorkflow(id: string): Promise<ApiResponse<WorkflowWithDetails>> {
    return this.request<WorkflowWithDetails>(`/api/workflows/${id}`);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    id: string,
    data: Partial<Workflow>
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List workflows
   */
  async listWorkflows(userId?: string, limit: number = 50): Promise<ApiResponse<Workflow[]>> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    params.set('limit', limit.toString());

    return this.request<Workflow[]>(`/api/workflows?${params}`);
  }

  // ==========================================================================
  // NODE METHODS
  // ==========================================================================

  /**
   * Add node to workflow
   */
  async createNode(workflowId: string, data: Partial<Node>): Promise<ApiResponse<Node>> {
    return this.request<Node>(`/api/workflows/${workflowId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update node
   */
  async updateNode(id: string, data: Partial<Node>): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workflows/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete node
   */
  async deleteNode(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workflows/nodes/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // CONNECTION METHODS
  // ==========================================================================

  /**
   * Add connection to workflow
   */
  async createConnection(
    workflowId: string,
    data: Partial<Connection>
  ): Promise<ApiResponse<Connection>> {
    return this.request<Connection>(`/api/workflows/${workflowId}/connections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete connection
   */
  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workflows/connections/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // AI METHODS
  // ==========================================================================

  /**
   * Generate workflow from natural language prompt
   * Average time: 3-5 seconds
   */
  async generateWorkflow(
    prompt: string,
    context?: {
      museum?: string;
      budget?: number;
      duration?: string;
      userId?: string;
    }
  ): Promise<ApiResponse<WorkflowGenerationResult>> {
    return this.request<WorkflowGenerationResult>('/api/ai/generate-workflow', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  /**
   * Recognize intent from natural language
   */
  async recognizeIntent(query: string): Promise<ApiResponse<IntentRecognitionResult>> {
    return this.request<IntentRecognitionResult>('/api/ai/recognize-intent', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  /**
   * Get AI suggestions for next steps
   */
  async suggestNextSteps(
    workflowId: string,
    completedNodes: string[] = []
  ): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/api/ai/suggest-next-steps', {
      method: 'POST',
      body: JSON.stringify({ workflowId, completedNodes }),
    });
  }

  /**
   * Get all AI suggestions for a workflow
   */
  async getSuggestions(workflowId: string): Promise<ApiResponse<AISuggestion[]>> {
    return this.request<AISuggestion[]>(`/api/ai/suggestions/${workflowId}`);
  }

  /**
   * Test AI connection
   */
  async testAI(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request('/api/ai/test');
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let defaultClient: MuseFlowApiClient | null = null;

/**
 * Initialize default API client
 */
export function initApiClient(config: ApiClientConfig): MuseFlowApiClient {
  defaultClient = new MuseFlowApiClient(config);
  return defaultClient;
}

/**
 * Get default API client (must be initialized first)
 */
export function getApiClient(): MuseFlowApiClient {
  if (!defaultClient) {
    throw new Error('API client not initialized. Call initApiClient() first.');
  }
  return defaultClient;
}

// ============================================================================
// CONVENIENCE HOOKS (for frontend usage)
// ============================================================================

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook-like API wrapper with loading state management
 */
export class ApiRequest<T = any> {
  loading: boolean = false;
  error: string | null = null;
  data: T | null = null;

  constructor(
    private requestFn: () => Promise<ApiResponse<T>>,
    private options?: UseApiOptions
  ) {}

  async execute(): Promise<T | null> {
    this.loading = true;
    this.error = null;
    this.data = null;

    try {
      const response = await this.requestFn();

      if (response.success && response.data) {
        this.data = response.data;
        this.options?.onSuccess?.(this.data);
        return this.data;
      } else {
        this.error = response.error || 'Unknown error';
        this.options?.onError?.(this.error);
        return null;
      }
    } catch (error: any) {
      this.error = error.message;
      this.options?.onError?.(this.error);
      return null;
    } finally {
      this.loading = false;
    }
  }
}

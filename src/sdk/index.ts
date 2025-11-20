/**
 * MuseFlow SDK
 * Barrel export for all SDK modules
 */

export {
  MuseFlowApiClient,
  initApiClient,
  getApiClient,
  ApiRequest,
  type ApiClientConfig,
  type ApiResponse,
  type WorkflowWithDetails,
  type WorkflowGenerationResult,
  type IntentRecognitionResult,
  type UseApiOptions,
} from './api-client';

export {
  WorkflowManager,
  type WorkflowManagerConfig,
} from './workflow-manager';

// Re-export types for convenience
export type {
  Workflow,
  WorkflowParsed,
  Node,
  NodeParsed,
  Connection,
  ConnectionParsed,
  WorkflowStatus,
  NodeStatus,
  ExecutionStatus,
} from '../types/database.types';

export type {
  AgentContext,
  ExhibitionPlanRequest,
  ExhibitionPlan,
} from '../types/agent.types';

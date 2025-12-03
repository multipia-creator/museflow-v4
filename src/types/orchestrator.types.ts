/**
 * AI Orchestrator Type Definitions
 * MSA-ready, Zero Error Rate
 * @version 1.0.0
 */

// ==========================================
// Core Types
// ==========================================

export type ExecutionMode = 'conversational' | 'autonomous';
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type AgentType = 'research' | 'canvas' | 'document' | 'widget' | 'integration' | 'monitor';
export type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// ==========================================
// AI Orchestrator Session
// ==========================================

export interface AISession {
  id: string;
  userId: number;
  command: string;
  mode: ExecutionMode;
  status: ExecutionStatus;
  currentPhase?: string;
  startTime: string;
  endTime?: string;
  totalDurationMs?: number;
  metadata?: Record<string, any>;
}

// ==========================================
// Execution Context
// ==========================================

export interface ExecutionContext {
  sessionId: string;
  userId: number;
  command: string;
  mode: ExecutionMode;
  userHistory: UserHistoryContext[];
  learningData: LearningDataContext[];
  projectContext?: ProjectContext;
}

export interface UserHistoryContext {
  taskType: string;
  frequency: number;
  successRate: number;
  lastExecutedAt: string;
  averageDurationMs: number;
}

export interface LearningDataContext {
  taskType: string;
  userInput: string;
  aiDecision: Record<string, any>;
  userFeedback: 'approved' | 'rejected' | 'modified';
  successRate: number;
  createdAt: string;
}

export interface ProjectContext {
  projectId: string;
  projectName: string;
  projectType: string;
  relatedTasks: string[];
  recentActivity: string[];
}

// ==========================================
// Workflow Definition
// ==========================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  phases: WorkflowPhase[];
  estimatedDurationMs: number;
  requiredAgents: AgentType[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  agent: AgentType;
  status: PhaseStatus;
  requiresApproval: boolean;
  estimatedDurationMs: number;
  actualDurationMs?: number;
  startTime?: string;
  endTime?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

// ==========================================
// Agent Base Interface
// ==========================================

export interface AgentConfig {
  type: AgentType;
  name: string;
  enabled: boolean;
  priority: number;
  maxRetries: number;
  timeoutMs: number;
}

export interface AgentExecutionResult {
  success: boolean;
  agent: AgentType;
  phase: string;
  durationMs: number;
  output?: Record<string, any>;
  error?: string;
  metadata?: Record<string, any>;
}

// ==========================================
// Multi-Agent Execution
// ==========================================

export interface MultiAgentExecution {
  sessionId: string;
  workflow: Workflow;
  currentPhaseIndex: number;
  completedPhases: string[];
  failedPhases: string[];
  totalProgress: number; // 0-100
  startTime: string;
  lastUpdateTime: string;
}

// ==========================================
// Event Types (for SSE)
// ==========================================

export type EventType = 
  | 'session-started'
  | 'phase-started'
  | 'phase-progress'
  | 'phase-completed'
  | 'phase-failed'
  | 'agent-action'
  | 'approval-required'
  | 'session-completed'
  | 'session-failed'
  | 'canvas-node-created'
  | 'canvas-node-updated'
  | 'dashboard-widget-updated'
  | 'error';

export interface ExecutionEvent {
  type: EventType;
  sessionId: string;
  timestamp: string;
  phase?: string;
  agent?: AgentType;
  progress?: number;
  message: string;
  data?: Record<string, any>;
  error?: string;
}

// ==========================================
// Canvas Integration
// ==========================================

export interface CanvasNode {
  id: string;
  type: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: Record<string, any>;
  connections?: string[]; // Connected node IDs
  metadata?: {
    createdBy: 'user' | 'ai';
    createdAt: string;
    updatedAt: string;
    aiSessionId?: string;
  };
}

export interface CanvasWorkflow {
  id: string;
  projectId: string;
  name: string;
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  metadata?: Record<string, any>;
}

export interface CanvasConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type?: 'data' | 'control' | 'reference';
}

// ==========================================
// Dashboard Integration
// ==========================================

export interface WidgetUpdate {
  widgetId: string;
  widgetType: string;
  data: Record<string, any>;
  timestamp: string;
  source: 'canvas' | 'ai' | 'user';
  sessionId?: string;
}

export interface DashboardSyncEvent {
  type: 'widget-update' | 'widget-create' | 'widget-delete';
  widgetId: string;
  data: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

// ==========================================
// AI Decision & Approval
// ==========================================

export interface AIDecision {
  sessionId: string;
  phase: string;
  decisionType: 'auto-proceed' | 'user-approval-required';
  options: DecisionOption[];
  recommendedOption?: string;
  reasoning: string;
  timestamp: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  data: Record<string, any>;
  successProbability?: number; // 0-100
  estimatedDurationMs?: number;
  pros?: string[];
  cons?: string[];
}

export interface UserDecision {
  sessionId: string;
  phase: string;
  selectedOptionId: string;
  feedback?: string;
  timestamp: string;
}

// ==========================================
// External Integrations
// ==========================================

export interface ExternalAPIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface GoogleDocsResult {
  documentId: string;
  documentUrl: string;
  title: string;
  content: string;
}

export interface GoogleCalendarResult {
  eventId: string;
  eventUrl: string;
  summary: string;
  startTime: string;
  endTime: string;
}

export interface GmailResult {
  messageId: string;
  threadId: string;
  to: string[];
  subject: string;
  status: 'draft' | 'sent';
}

// ==========================================
// Error Handling
// ==========================================

export interface OrchestratorError {
  code: string;
  message: string;
  phase?: string;
  agent?: AgentType;
  details?: Record<string, any>;
  timestamp: string;
  stack?: string;
}

// ==========================================
// Metrics & Analytics
// ==========================================

export interface ExecutionMetrics {
  sessionId: string;
  totalDurationMs: number;
  phaseMetrics: PhaseMetrics[];
  agentMetrics: AgentMetrics[];
  successRate: number;
  userInterventions: number;
  costEstimate?: number;
}

export interface PhaseMetrics {
  phase: string;
  durationMs: number;
  status: PhaseStatus;
  retries: number;
  error?: string;
}

export interface AgentMetrics {
  agent: AgentType;
  executionCount: number;
  totalDurationMs: number;
  averageDurationMs: number;
  successRate: number;
  errors: number;
}

// ==========================================
// Database Models
// ==========================================

export interface AIExecutionSessionDB {
  id: number;
  user_id: number;
  command: string;
  mode: ExecutionMode;
  status: ExecutionStatus;
  workflow_id?: string;
  current_phase?: string;
  start_time: string;
  end_time?: string;
  total_duration_ms?: number;
  metadata?: string; // JSON
  created_at: string;
  updated_at: string;
}

export interface AIExecutionEventDB {
  id: number;
  session_id: number;
  event_type: EventType;
  phase_name?: string;
  agent_type?: AgentType;
  event_data?: string; // JSON
  timestamp: string;
  created_at: string;
}

export interface CanvasDashboardSyncDB {
  id: number;
  canvas_node_id: string;
  canvas_node_type: string;
  dashboard_widget_id: string;
  sync_data: string; // JSON
  sync_timestamp: string;
  sync_status: 'pending' | 'completed' | 'failed';
  session_id?: number;
  created_at: string;
}

export interface LearningDataDB {
  id: number;
  user_id: number;
  task_type: string;
  user_input: string;
  ai_decision: string; // JSON
  user_feedback?: 'approved' | 'rejected' | 'modified';
  success_rate?: number;
  session_id?: number;
  created_at: string;
}

// ==========================================
// API Request/Response Types
// ==========================================

export interface ExecuteAIRequest {
  command: string;
  mode?: ExecutionMode;
  projectContext?: ProjectContext;
  options?: {
    autoApprove?: boolean;
    skipPhases?: string[];
    customWorkflow?: Partial<Workflow>;
  };
}

export interface ExecuteAIResponse {
  success: boolean;
  sessionId: string;
  workflow: Workflow;
  streamUrl: string;
  message: string;
}

export interface GetSessionStatusRequest {
  sessionId: string;
}

export interface GetSessionStatusResponse {
  success: boolean;
  session: AISession;
  execution: MultiAgentExecution;
  metrics: ExecutionMetrics;
}

export interface SubmitDecisionRequest {
  sessionId: string;
  phase: string;
  selectedOptionId: string;
  feedback?: string;
}

export interface SubmitDecisionResponse {
  success: boolean;
  message: string;
  nextPhase?: string;
}

// ==========================================
// Type Guards
// ==========================================

export function isExecutionMode(value: string): value is ExecutionMode {
  return value === 'conversational' || value === 'autonomous';
}

export function isAgentType(value: string): value is AgentType {
  return ['research', 'canvas', 'document', 'widget', 'integration', 'monitor'].includes(value);
}

export function isEventType(value: string): value is EventType {
  return [
    'session-started',
    'phase-started',
    'phase-progress',
    'phase-completed',
    'phase-failed',
    'agent-action',
    'approval-required',
    'session-completed',
    'session-failed',
    'canvas-node-created',
    'canvas-node-updated',
    'dashboard-widget-updated',
    'error'
  ].includes(value);
}

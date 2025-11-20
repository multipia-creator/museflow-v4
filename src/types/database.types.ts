/**
 * Database Types
 * Auto-generated TypeScript types for Cloudflare D1 schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type NodeStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type ExecutionStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ConnectionType = 'default' | 'data' | 'dependency' | 'conditional';
export type SuggestionType = 'next_step' | 'optimization' | 'warning' | 'info';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'dismissed';
export type EntityType = 'artwork' | 'artist' | 'exhibition' | 'curator' | 'venue' | 'institution';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Workflow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  
  // AI metadata
  ai_generated: boolean;
  generation_prompt: string | null;
  generation_model: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  
  // User info
  created_by: string;
  assigned_to: string | null;
  
  // Integration
  notion_page_id: string | null;
  github_repo: string | null;
  
  // Viewport
  viewport_x: number;
  viewport_y: number;
  viewport_zoom: number;
  
  // Metadata
  metadata: string | null; // JSON
  tags: string | null;
}

export interface Node {
  id: string;
  workflow_id: string;
  
  // Type
  type: string;
  category: string;
  
  // Position
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  
  // Properties
  title: string | null;
  description: string | null;
  status: NodeStatus;
  color: string;
  icon: string;
  
  // Agent
  assigned_agent: string | null;
  agent_config: string | null; // JSON
  
  // Execution
  execution_status: ExecutionStatus | null;
  execution_started_at: string | null;
  execution_completed_at: string | null;
  execution_result: string | null; // JSON
  execution_error: string | null;
  execution_progress: number;
  
  // Integration
  notion_task_id: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Custom
  custom_data: string | null; // JSON
}

export interface Connection {
  id: string;
  workflow_id: string;
  from_node: string;
  to_node: string;
  type: ConnectionType;
  color: string | null;
  style: string;
  label: string | null;
  data_schema: string | null; // JSON
  created_at: string;
}

export interface AgentExecution {
  id: string;
  node_id: string;
  workflow_id: string;
  
  // Agent
  agent_name: string;
  agent_version: string | null;
  
  // Status
  status: ExecutionStatus;
  
  // Data
  input: string | null; // JSON
  output: string | null; // JSON
  error: string | null;
  error_stack: string | null;
  
  // Metrics
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  cost_usd: number | null;
  
  // Retry
  retry_count: number;
  max_retries: number;
  
  // Metadata
  metadata: string | null; // JSON
}

export interface CollaborationSession {
  id: string;
  workflow_id: string;
  user_id: string;
  username: string;
  
  // State
  cursor_x: number | null;
  cursor_y: number | null;
  selected_nodes: string | null; // JSON array
  
  // Session
  connected_at: string;
  last_activity: string;
  is_active: boolean;
  socket_id: string | null;
}

export interface KnowledgeEntity {
  id: string;
  entity_type: EntityType;
  name: string;
  description: string | null;
  properties: string | null; // JSON
  embedding_vector: string | null; // JSON array
  
  // External IDs
  museum_api_id: string | null;
  notion_page_id: string | null;
  wikidata_id: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Quality
  confidence_score: number;
  data_source: string | null;
}

export interface KnowledgeRelationship {
  id: string;
  from_entity: string;
  to_entity: string;
  relationship_type: string;
  properties: string | null; // JSON
  weight: number;
  confidence: number;
  created_at: string;
}

export interface WorkflowEvent {
  id: string;
  workflow_id: string;
  event_type: string;
  event_data: string | null; // JSON
  user_id: string | null;
  user_name: string | null;
  occurred_at: string;
  is_ai_generated: boolean;
  agent_name: string | null;
}

export interface AISuggestion {
  id: string;
  workflow_id: string | null;
  node_id: string | null;
  suggestion_type: SuggestionType;
  title: string;
  description: string | null;
  action_type: string | null;
  action_data: string | null; // JSON
  priority: Priority;
  confidence: number;
  status: SuggestionStatus;
  user_feedback: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface MuseumDataCache {
  id: string;
  api_endpoint: string;
  query_params: string | null; // JSON
  response_data: string; // JSON
  cached_at: string;
  expires_at: string | null;
  hit_count: number;
}

// ============================================================================
// PARSED TYPES (with JSON fields parsed)
// ============================================================================

export interface WorkflowParsed extends Omit<Workflow, 'metadata'> {
  metadata: Record<string, any> | null;
}

export interface NodeParsed extends Omit<Node, 'agent_config' | 'execution_result' | 'custom_data'> {
  agent_config: Record<string, any> | null;
  execution_result: Record<string, any> | null;
  custom_data: Record<string, any> | null;
}

export interface ConnectionParsed extends Omit<Connection, 'data_schema'> {
  data_schema: Record<string, any> | null;
}

export interface AgentExecutionParsed extends Omit<AgentExecution, 'input' | 'output' | 'metadata'> {
  input: Record<string, any> | null;
  output: Record<string, any> | null;
  metadata: Record<string, any> | null;
}

export interface CollaborationSessionParsed extends Omit<CollaborationSession, 'selected_nodes'> {
  selected_nodes: string[] | null;
}

export interface KnowledgeEntityParsed extends Omit<KnowledgeEntity, 'properties' | 'embedding_vector'> {
  properties: Record<string, any> | null;
  embedding_vector: number[] | null;
}

export interface KnowledgeRelationshipParsed extends Omit<KnowledgeRelationship, 'properties'> {
  properties: Record<string, any> | null;
}

export interface AISuggestionParsed extends Omit<AISuggestion, 'action_data'> {
  action_data: Record<string, any> | null;
}

export interface MuseumDataCacheParsed extends Omit<MuseumDataCache, 'query_params' | 'response_data'> {
  query_params: Record<string, any> | null;
  response_data: Record<string, any>;
}

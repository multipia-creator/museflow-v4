/**
 * Database Service
 * Cloudflare D1 CRUD operations
 */

import type {
  Workflow,
  Node,
  Connection,
  AgentExecution,
  CollaborationSession,
  AISuggestion,
} from '../types/database.types';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ============================================================================
  // WORKFLOWS
  // ============================================================================

  async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const workflow: Workflow = {
      id: uuidv4(),
      project_id: data.project_id || uuidv4(),
      name: data.name || 'Untitled Workflow',
      description: data.description || null,
      status: data.status || 'draft',
      ai_generated: data.ai_generated || false,
      generation_prompt: data.generation_prompt || null,
      generation_model: data.generation_model || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: data.started_at || null,
      completed_at: data.completed_at || null,
      created_by: data.created_by || 'system',
      assigned_to: data.assigned_to || null,
      notion_page_id: data.notion_page_id || null,
      github_repo: data.github_repo || null,
      viewport_x: data.viewport_x || 0,
      viewport_y: data.viewport_y || 0,
      viewport_zoom: data.viewport_zoom || 1,
      metadata: data.metadata || null,
      tags: data.tags || null,
    };

    await this.db
      .prepare(
        `INSERT INTO workflows (
          id, project_id, name, description, status, ai_generated, 
          generation_prompt, generation_model, created_at, updated_at, 
          started_at, completed_at, created_by, assigned_to, notion_page_id, 
          github_repo, viewport_x, viewport_y, viewport_zoom, metadata, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        workflow.id,
        workflow.project_id,
        workflow.name,
        workflow.description,
        workflow.status,
        workflow.ai_generated ? 1 : 0,
        workflow.generation_prompt,
        workflow.generation_model,
        workflow.created_at,
        workflow.updated_at,
        workflow.started_at,
        workflow.completed_at,
        workflow.created_by,
        workflow.assigned_to,
        workflow.notion_page_id,
        workflow.github_repo,
        workflow.viewport_x,
        workflow.viewport_y,
        workflow.viewport_zoom,
        workflow.metadata,
        workflow.tags
      )
      .run();

    return workflow;
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    const result = await this.db
      .prepare('SELECT * FROM workflows WHERE id = ?')
      .bind(id)
      .first<Workflow>();

    return result || null;
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.viewport_x !== undefined) {
      updates.push('viewport_x = ?');
      values.push(data.viewport_x);
    }
    if (data.viewport_y !== undefined) {
      updates.push('viewport_y = ?');
      values.push(data.viewport_y);
    }
    if (data.viewport_zoom !== undefined) {
      updates.push('viewport_zoom = ?');
      values.push(data.viewport_zoom);
    }

    if (updates.length === 0) return;

    values.push(id);

    await this.db
      .prepare(`UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM workflows WHERE id = ?').bind(id).run();
  }

  async listWorkflows(userId?: string, limit: number = 50): Promise<Workflow[]> {
    let query = 'SELECT * FROM workflows';
    const params: any[] = [];

    if (userId) {
      query += ' WHERE created_by = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const result = await this.db.prepare(query).bind(...params).all<Workflow>();
    return result.results || [];
  }

  // ============================================================================
  // NODES
  // ============================================================================

  async createNode(data: Partial<Node>): Promise<Node> {
    const node: Node = {
      id: data.id || uuidv4(),
      workflow_id: data.workflow_id!,
      type: data.type || 'Unknown',
      category: data.category || 'exhibition',
      position_x: data.position_x || 0,
      position_y: data.position_y || 0,
      width: data.width || 200,
      height: data.height || 150,
      title: data.title || null,
      description: data.description || null,
      status: data.status || 'todo',
      color: data.color || '#8b5cf6',
      icon: data.icon || '📦',
      assigned_agent: data.assigned_agent || null,
      agent_config: data.agent_config || null,
      execution_status: data.execution_status || null,
      execution_started_at: data.execution_started_at || null,
      execution_completed_at: data.execution_completed_at || null,
      execution_result: data.execution_result || null,
      execution_error: data.execution_error || null,
      execution_progress: data.execution_progress || 0,
      notion_task_id: data.notion_task_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: data.custom_data || null,
    };

    await this.db
      .prepare(
        `INSERT INTO nodes (
          id, workflow_id, type, category, position_x, position_y, width, height,
          title, description, status, color, icon, assigned_agent, agent_config,
          execution_status, execution_started_at, execution_completed_at,
          execution_result, execution_error, execution_progress, notion_task_id,
          created_at, updated_at, custom_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        node.id,
        node.workflow_id,
        node.type,
        node.category,
        node.position_x,
        node.position_y,
        node.width,
        node.height,
        node.title,
        node.description,
        node.status,
        node.color,
        node.icon,
        node.assigned_agent,
        node.agent_config,
        node.execution_status,
        node.execution_started_at,
        node.execution_completed_at,
        node.execution_result,
        node.execution_error,
        node.execution_progress,
        node.notion_task_id,
        node.created_at,
        node.updated_at,
        node.custom_data
      )
      .run();

    return node;
  }

  async getNode(id: string): Promise<Node | null> {
    const result = await this.db
      .prepare('SELECT * FROM nodes WHERE id = ?')
      .bind(id)
      .first<Node>();

    return result || null;
  }

  async listNodes(workflowId: string): Promise<Node[]> {
    const result = await this.db
      .prepare('SELECT * FROM nodes WHERE workflow_id = ? ORDER BY position_y, position_x')
      .bind(workflowId)
      .all<Node>();

    return result.results || [];
  }

  async updateNode(id: string, data: Partial<Node>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'workflow_id') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) return;

    values.push(id);

    await this.db
      .prepare(`UPDATE nodes SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async deleteNode(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM nodes WHERE id = ?').bind(id).run();
  }

  // ============================================================================
  // CONNECTIONS
  // ============================================================================

  async createConnection(data: Partial<Connection>): Promise<Connection> {
    const connection: Connection = {
      id: data.id || uuidv4(),
      workflow_id: data.workflow_id!,
      from_node: data.from_node!,
      to_node: data.to_node!,
      type: data.type || 'default',
      color: data.color || null,
      style: data.style || 'bezier',
      label: data.label || null,
      data_schema: data.data_schema || null,
      created_at: new Date().toISOString(),
    };

    await this.db
      .prepare(
        `INSERT INTO connections (
          id, workflow_id, from_node, to_node, type, color, style, label, data_schema, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        connection.id,
        connection.workflow_id,
        connection.from_node,
        connection.to_node,
        connection.type,
        connection.color,
        connection.style,
        connection.label,
        connection.data_schema,
        connection.created_at
      )
      .run();

    return connection;
  }

  async listConnections(workflowId: string): Promise<Connection[]> {
    const result = await this.db
      .prepare('SELECT * FROM connections WHERE workflow_id = ?')
      .bind(workflowId)
      .all<Connection>();

    return result.results || [];
  }

  async deleteConnection(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM connections WHERE id = ?').bind(id).run();
  }

  // ============================================================================
  // AGENT EXECUTIONS
  // ============================================================================

  async createAgentExecution(data: Partial<AgentExecution>): Promise<AgentExecution> {
    const execution: AgentExecution = {
      id: data.id || uuidv4(),
      node_id: data.node_id!,
      workflow_id: data.workflow_id!,
      agent_name: data.agent_name!,
      agent_version: data.agent_version || null,
      status: data.status || 'queued',
      input: data.input || null,
      output: data.output || null,
      error: data.error || null,
      error_stack: data.error_stack || null,
      started_at: data.started_at || null,
      completed_at: data.completed_at || null,
      duration_ms: data.duration_ms || null,
      tokens_used: data.tokens_used || null,
      cost_usd: data.cost_usd || null,
      retry_count: data.retry_count || 0,
      max_retries: data.max_retries || 3,
      metadata: data.metadata || null,
    };

    await this.db
      .prepare(
        `INSERT INTO agent_executions (
          id, node_id, workflow_id, agent_name, agent_version, status, input, output,
          error, error_stack, started_at, completed_at, duration_ms, tokens_used,
          cost_usd, retry_count, max_retries, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        execution.id,
        execution.node_id,
        execution.workflow_id,
        execution.agent_name,
        execution.agent_version,
        execution.status,
        execution.input,
        execution.output,
        execution.error,
        execution.error_stack,
        execution.started_at,
        execution.completed_at,
        execution.duration_ms,
        execution.tokens_used,
        execution.cost_usd,
        execution.retry_count,
        execution.max_retries,
        execution.metadata
      )
      .run();

    return execution;
  }

  async updateAgentExecution(id: string, data: Partial<AgentExecution>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) return;

    values.push(id);

    await this.db
      .prepare(`UPDATE agent_executions SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  // ============================================================================
  // COLLABORATION SESSIONS
  // ============================================================================

  async createSession(data: Partial<CollaborationSession>): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: data.id || uuidv4(),
      workflow_id: data.workflow_id!,
      user_id: data.user_id!,
      username: data.username!,
      cursor_x: data.cursor_x || null,
      cursor_y: data.cursor_y || null,
      selected_nodes: data.selected_nodes || null,
      connected_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_active: true,
      socket_id: data.socket_id || null,
    };

    await this.db
      .prepare(
        `INSERT OR REPLACE INTO collaboration_sessions (
          id, workflow_id, user_id, username, cursor_x, cursor_y, selected_nodes,
          connected_at, last_activity, is_active, socket_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        session.id,
        session.workflow_id,
        session.user_id,
        session.username,
        session.cursor_x,
        session.cursor_y,
        session.selected_nodes,
        session.connected_at,
        session.last_activity,
        session.is_active ? 1 : 0,
        session.socket_id
      )
      .run();

    return session;
  }

  async listActiveSessions(workflowId: string): Promise<CollaborationSession[]> {
    const result = await this.db
      .prepare('SELECT * FROM collaboration_sessions WHERE workflow_id = ? AND is_active = 1')
      .bind(workflowId)
      .all<CollaborationSession>();

    return result.results || [];
  }

  // ============================================================================
  // AI SUGGESTIONS
  // ============================================================================

  async createSuggestion(data: Partial<AISuggestion>): Promise<AISuggestion> {
    const suggestion: AISuggestion = {
      id: data.id || uuidv4(),
      workflow_id: data.workflow_id || null,
      node_id: data.node_id || null,
      suggestion_type: data.suggestion_type!,
      title: data.title!,
      description: data.description || null,
      action_type: data.action_type || null,
      action_data: data.action_data || null,
      priority: data.priority || 'medium',
      confidence: data.confidence || 0.5,
      status: data.status || 'pending',
      user_feedback: data.user_feedback || null,
      created_at: new Date().toISOString(),
      responded_at: data.responded_at || null,
    };

    await this.db
      .prepare(
        `INSERT INTO ai_suggestions (
          id, workflow_id, node_id, suggestion_type, title, description,
          action_type, action_data, priority, confidence, status,
          user_feedback, created_at, responded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        suggestion.id,
        suggestion.workflow_id,
        suggestion.node_id,
        suggestion.suggestion_type,
        suggestion.title,
        suggestion.description,
        suggestion.action_type,
        suggestion.action_data,
        suggestion.priority,
        suggestion.confidence,
        suggestion.status,
        suggestion.user_feedback,
        suggestion.created_at,
        suggestion.responded_at
      )
      .run();

    return suggestion;
  }

  async listSuggestions(workflowId: string): Promise<AISuggestion[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM ai_suggestions WHERE workflow_id = ? AND status = ? ORDER BY priority DESC, created_at DESC'
      )
      .bind(workflowId, 'pending')
      .all<AISuggestion>();

    return result.results || [];
  }
}

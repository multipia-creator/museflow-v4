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

  // ========================================================================
  // MUSEUM DATA CACHE
  // ========================================================================

  async cacheMuseumData(
    endpoint: string,
    queryParams: Record<string, any>,
    responseData: any
  ): Promise<void> {
    const id = this.generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    await this.db
      .prepare(
        `INSERT INTO museum_data_cache (
          id, api_endpoint, query_params, response_data, cached_at, expires_at, hit_count
        ) VALUES (?, ?, ?, ?, datetime('now'), ?, 0)`
      )
      .bind(
        id,
        endpoint,
        JSON.stringify(queryParams),
        JSON.stringify(responseData),
        expiresAt
      )
      .run();
  }

  async getMuseumCache(
    endpoint: string,
    queryParams: Record<string, any>
  ): Promise<any | null> {
    const result = await this.db
      .prepare(
        `SELECT * FROM museum_data_cache 
         WHERE api_endpoint = ? 
         AND query_params = ? 
         AND expires_at > datetime('now')
         ORDER BY cached_at DESC
         LIMIT 1`
      )
      .bind(endpoint, JSON.stringify(queryParams))
      .first<any>();

    if (result) {
      // Increment hit count
      await this.db
        .prepare('UPDATE museum_data_cache SET hit_count = hit_count + 1 WHERE id = ?')
        .bind(result.id)
        .run();

      return JSON.parse(result.response_data);
    }

    return null;
  }

  // ========================================================================
  // NFT ASSETS
  // ========================================================================

  async createNFTAsset(data: any): Promise<any> {
    const nft = {
      id: data.id || this.generateId(),
      token_id: data.token_id,
      contract_address: data.contract_address,
      blockchain: data.blockchain,
      token_standard: data.token_standard || 'ERC-721',
      name: data.name,
      description: data.description || null,
      image_url: data.image_url || null,
      animation_url: data.animation_url || null,
      external_url: data.external_url || null,
      metadata_url: data.metadata_url,
      metadata_json: data.metadata_json || null,
      artwork_id: data.artwork_id || null,
      exhibition_id: data.exhibition_id || null,
      creator_address: data.creator_address,
      current_owner_address: data.current_owner_address || data.creator_address,
      minted_at: data.minted_at || new Date().toISOString(),
      minting_transaction: data.minting_transaction || null,
      attributes: data.attributes || null,
      rarity_score: data.rarity_score || null,
      price_in_eth: data.price_in_eth || null,
      last_sale_price: data.last_sale_price || null,
      total_sales: data.total_sales || 0,
      status: data.status || 'minted',
      visibility: data.visibility || 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.db
      .prepare(
        `INSERT INTO nft_assets (
          id, token_id, contract_address, blockchain, token_standard,
          name, description, image_url, animation_url, external_url,
          metadata_url, metadata_json, artwork_id, exhibition_id,
          creator_address, current_owner_address, minted_at, minting_transaction,
          attributes, rarity_score, price_in_eth, last_sale_price, total_sales,
          status, visibility, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        nft.id,
        nft.token_id,
        nft.contract_address,
        nft.blockchain,
        nft.token_standard,
        nft.name,
        nft.description,
        nft.image_url,
        nft.animation_url,
        nft.external_url,
        nft.metadata_url,
        nft.metadata_json,
        nft.artwork_id,
        nft.exhibition_id,
        nft.creator_address,
        nft.current_owner_address,
        nft.minted_at,
        nft.minting_transaction,
        nft.attributes,
        nft.rarity_score,
        nft.price_in_eth,
        nft.last_sale_price,
        nft.total_sales,
        nft.status,
        nft.visibility,
        nft.created_at,
        nft.updated_at
      )
      .run();

    return nft;
  }

  async getNFTAsset(id: string): Promise<any | null> {
    const result = await this.db
      .prepare('SELECT * FROM nft_assets WHERE id = ?')
      .bind(id)
      .first<any>();

    return result || null;
  }

  async getNFTByTokenId(tokenId: string, contractAddress: string): Promise<any | null> {
    const result = await this.db
      .prepare('SELECT * FROM nft_assets WHERE token_id = ? AND contract_address = ?')
      .bind(tokenId, contractAddress)
      .first<any>();

    return result || null;
  }

  async listNFTsByExhibition(exhibitionId: string): Promise<any[]> {
    const result = await this.db
      .prepare('SELECT * FROM nft_assets WHERE exhibition_id = ? ORDER BY created_at DESC')
      .bind(exhibitionId)
      .all<any>();

    return result.results || [];
  }

  async listNFTsByArtwork(artworkId: string): Promise<any[]> {
    const result = await this.db
      .prepare('SELECT * FROM nft_assets WHERE artwork_id = ? ORDER BY created_at DESC')
      .bind(artworkId)
      .all<any>();

    return result.results || [];
  }

  async listNFTsByOwner(ownerAddress: string): Promise<any[]> {
    const result = await this.db
      .prepare('SELECT * FROM nft_assets WHERE current_owner_address = ? ORDER BY created_at DESC')
      .bind(ownerAddress)
      .all<any>();

    return result.results || [];
  }

  async updateNFTAsset(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.current_owner_address !== undefined) {
      updates.push('current_owner_address = ?');
      values.push(data.current_owner_address);
    }
    if (data.price_in_eth !== undefined) {
      updates.push('price_in_eth = ?');
      values.push(data.price_in_eth);
    }
    if (data.last_sale_price !== undefined) {
      updates.push('last_sale_price = ?');
      values.push(data.last_sale_price);
    }
    if (data.total_sales !== undefined) {
      updates.push('total_sales = ?');
      values.push(data.total_sales);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.visibility !== undefined) {
      updates.push('visibility = ?');
      values.push(data.visibility);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = datetime(\'now\')');
    values.push(id);

    await this.db
      .prepare(`UPDATE nft_assets SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async deleteNFTAsset(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM nft_assets WHERE id = ?').bind(id).run();
  }

  // NFT Collections

  async createNFTCollection(data: any): Promise<any> {
    const collection = {
      id: data.id || this.generateId(),
      name: data.name,
      symbol: data.symbol,
      description: data.description || null,
      contract_address: data.contract_address,
      blockchain: data.blockchain,
      token_standard: data.token_standard || 'ERC-721',
      base_uri: data.base_uri || null,
      collection_image: data.collection_image || null,
      external_url: data.external_url || null,
      exhibition_id: data.exhibition_id || null,
      total_supply: data.total_supply || 0,
      max_supply: data.max_supply || null,
      minted_count: data.minted_count || 0,
      floor_price: data.floor_price || null,
      total_volume: data.total_volume || null,
      royalty_percentage: data.royalty_percentage || 0,
      royalty_recipient: data.royalty_recipient || null,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.db
      .prepare(
        `INSERT INTO nft_collections (
          id, name, symbol, description, contract_address, blockchain, token_standard,
          base_uri, collection_image, external_url, exhibition_id,
          total_supply, max_supply, minted_count, floor_price, total_volume,
          royalty_percentage, royalty_recipient, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        collection.id,
        collection.name,
        collection.symbol,
        collection.description,
        collection.contract_address,
        collection.blockchain,
        collection.token_standard,
        collection.base_uri,
        collection.collection_image,
        collection.external_url,
        collection.exhibition_id,
        collection.total_supply,
        collection.max_supply,
        collection.minted_count,
        collection.floor_price,
        collection.total_volume,
        collection.royalty_percentage,
        collection.royalty_recipient,
        collection.status,
        collection.created_at,
        collection.updated_at
      )
      .run();

    return collection;
  }

  async getNFTCollection(id: string): Promise<any | null> {
    const result = await this.db
      .prepare('SELECT * FROM nft_collections WHERE id = ?')
      .bind(id)
      .first<any>();

    return result || null;
  }

  async listNFTCollections(): Promise<any[]> {
    const result = await this.db
      .prepare('SELECT * FROM nft_collections ORDER BY created_at DESC')
      .all<any>();

    return result.results || [];
  }

  // NFT Transfer History

  async recordNFTTransfer(data: any): Promise<any> {
    const transfer = {
      id: this.generateId(),
      nft_id: data.nft_id,
      token_id: data.token_id,
      from_address: data.from_address,
      to_address: data.to_address,
      transaction_hash: data.transaction_hash,
      block_number: data.block_number || null,
      price_in_eth: data.price_in_eth || null,
      price_in_usd: data.price_in_usd || null,
      transfer_type: data.transfer_type, // 'mint', 'sale', 'transfer', 'burn'
      marketplace: data.marketplace || null,
      transferred_at: data.transferred_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await this.db
      .prepare(
        `INSERT INTO nft_transfers (
          id, nft_id, token_id, from_address, to_address, transaction_hash,
          block_number, price_in_eth, price_in_usd, transfer_type, marketplace,
          transferred_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        transfer.id,
        transfer.nft_id,
        transfer.token_id,
        transfer.from_address,
        transfer.to_address,
        transfer.transaction_hash,
        transfer.block_number,
        transfer.price_in_eth,
        transfer.price_in_usd,
        transfer.transfer_type,
        transfer.marketplace,
        transfer.transferred_at,
        transfer.created_at
      )
      .run();

    return transfer;
  }

  async getNFTTransferHistory(nftId: string): Promise<any[]> {
    const result = await this.db
      .prepare('SELECT * FROM nft_transfers WHERE nft_id = ? ORDER BY transferred_at DESC')
      .bind(nftId)
      .all<any>();

    return result.results || [];
  }
}

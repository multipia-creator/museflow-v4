-- ============================================================================
-- MuseFlow V4 - Initial Complete Schema
-- Created: 2025-01-23
-- Purpose: Unified database schema for museum workflow system
-- Combines: Authentication, Projects, Workflows, Knowledge Graph, NFT Assets
-- ============================================================================

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  profile_image TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================================================
-- PROJECT MANAGEMENT
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  workflow_data TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================================
-- WORKFLOW SYSTEM
-- ============================================================================

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('draft', 'active', 'paused', 'completed', 'archived')) DEFAULT 'draft',
  
  -- AI Generation metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  generation_prompt TEXT,
  generation_model TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  
  -- User information
  created_by TEXT NOT NULL,
  assigned_to TEXT,
  
  -- Integration IDs
  notion_page_id TEXT,
  github_repo TEXT,
  
  -- Canvas viewport state
  viewport_x REAL DEFAULT 0,
  viewport_y REAL DEFAULT 0,
  viewport_zoom REAL DEFAULT 1,
  
  -- Additional metadata (JSON)
  metadata TEXT,
  tags TEXT
);

CREATE INDEX idx_workflows_project ON workflows(project_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);
CREATE INDEX idx_workflows_notion ON workflows(notion_page_id);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Node type and category
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Visual properties
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  width REAL DEFAULT 200,
  height REAL DEFAULT 150,
  
  -- Node properties
  title TEXT,
  description TEXT,
  status TEXT CHECK(status IN ('todo', 'in-progress', 'done', 'blocked')) DEFAULT 'todo',
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '📦',
  
  -- AI Agent assignment
  assigned_agent TEXT,
  agent_config TEXT,
  
  -- Execution state
  execution_status TEXT CHECK(execution_status IN ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled')),
  execution_started_at DATETIME,
  execution_completed_at DATETIME,
  execution_result TEXT,
  execution_error TEXT,
  execution_progress REAL DEFAULT 0,
  
  -- Integration
  notion_task_id TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Additional data (JSON)
  custom_data TEXT
);

CREATE INDEX idx_nodes_workflow ON nodes(workflow_id);
CREATE INDEX idx_nodes_category ON nodes(category);
CREATE INDEX idx_nodes_status ON nodes(status);
CREATE INDEX idx_nodes_agent ON nodes(assigned_agent);
CREATE INDEX idx_nodes_execution_status ON nodes(execution_status);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Connection endpoints
  from_node TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  
  -- Connection type
  type TEXT DEFAULT 'default' CHECK(type IN ('default', 'data', 'dependency', 'conditional')),
  
  -- Visual properties
  color TEXT,
  style TEXT DEFAULT 'bezier',
  label TEXT,
  
  -- Connection data
  data_schema TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(from_node, to_node, type)
);

CREATE INDEX idx_connections_workflow ON connections(workflow_id);
CREATE INDEX idx_connections_from ON connections(from_node);
CREATE INDEX idx_connections_to ON connections(to_node);

-- ============================================================================
-- AI AGENT SYSTEM
-- ============================================================================

-- Agent executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Agent information
  agent_name TEXT NOT NULL,
  agent_version TEXT,
  
  -- Execution details
  status TEXT CHECK(status IN ('queued', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
  
  -- Input/Output
  input TEXT,
  output TEXT,
  error TEXT,
  error_stack TEXT,
  
  -- Performance metrics
  started_at DATETIME,
  completed_at DATETIME,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd REAL,
  
  -- Retry information
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Additional metadata
  metadata TEXT
);

CREATE INDEX idx_agent_executions_node ON agent_executions(node_id);
CREATE INDEX idx_agent_executions_workflow ON agent_executions(workflow_id);
CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_name);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started ON agent_executions(started_at);

-- AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id) ON DELETE CASCADE,
  node_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
  
  -- Suggestion details
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Suggested action
  action_type TEXT,
  action_data TEXT,
  
  -- Priority and confidence
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  confidence REAL DEFAULT 0.5,
  
  -- User interaction
  status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'dismissed')) DEFAULT 'pending',
  user_feedback TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME
);

CREATE INDEX idx_suggestions_workflow ON ai_suggestions(workflow_id);
CREATE INDEX idx_suggestions_node ON ai_suggestions(node_id);
CREATE INDEX idx_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_suggestions_priority ON ai_suggestions(priority);

-- ============================================================================
-- COLLABORATION SYSTEM
-- ============================================================================

-- Collaboration sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  
  -- User state
  cursor_x REAL,
  cursor_y REAL,
  selected_nodes TEXT,
  
  -- Session info
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- WebSocket connection
  socket_id TEXT,
  
  UNIQUE(workflow_id, user_id)
);

CREATE INDEX idx_collab_workflow ON collaboration_sessions(workflow_id);
CREATE INDEX idx_collab_user ON collaboration_sessions(user_id);
CREATE INDEX idx_collab_active ON collaboration_sessions(is_active);

-- ============================================================================
-- KNOWLEDGE GRAPH
-- ============================================================================

-- Knowledge entities table
CREATE TABLE IF NOT EXISTS knowledge_entities (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('artwork', 'artist', 'exhibition', 'curator', 'venue', 'institution')),
  
  -- Core properties
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  properties TEXT,
  
  -- Vector embedding
  embedding_vector TEXT,
  
  -- External IDs
  museum_api_id TEXT,
  notion_page_id TEXT,
  wikidata_id TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Data quality
  confidence_score REAL DEFAULT 1.0,
  data_source TEXT
);

CREATE INDEX idx_knowledge_type ON knowledge_entities(entity_type);
CREATE INDEX idx_knowledge_name ON knowledge_entities(name);
CREATE INDEX idx_knowledge_museum_id ON knowledge_entities(museum_api_id);

-- Knowledge relationships table
CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id TEXT PRIMARY KEY,
  
  -- Relationship endpoints
  from_entity TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  to_entity TEXT NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  
  -- Relationship type
  relationship_type TEXT NOT NULL,
  
  -- Properties
  properties TEXT,
  
  -- Strength/weight
  weight REAL DEFAULT 1.0,
  confidence REAL DEFAULT 1.0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(from_entity, to_entity, relationship_type)
);

CREATE INDEX idx_relationships_from ON knowledge_relationships(from_entity);
CREATE INDEX idx_relationships_to ON knowledge_relationships(to_entity);
CREATE INDEX idx_relationships_type ON knowledge_relationships(relationship_type);

-- ============================================================================
-- EVENT SOURCING
-- ============================================================================

-- Workflow events table
CREATE TABLE IF NOT EXISTS workflow_events (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL,
  event_data TEXT,
  
  -- User who triggered the event
  user_id TEXT,
  user_name TEXT,
  
  -- Timestamp
  occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- AI or human action
  is_ai_generated BOOLEAN DEFAULT FALSE,
  agent_name TEXT
);

CREATE INDEX idx_events_workflow ON workflow_events(workflow_id);
CREATE INDEX idx_events_type ON workflow_events(event_type);
CREATE INDEX idx_events_time ON workflow_events(occurred_at);

-- ============================================================================
-- CACHING SYSTEM
-- ============================================================================

-- Museum data cache table
CREATE TABLE IF NOT EXISTS museum_data_cache (
  id TEXT PRIMARY KEY,
  api_endpoint TEXT NOT NULL,
  query_params TEXT,
  
  -- Cached data
  response_data TEXT NOT NULL,
  
  -- Cache metadata
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  hit_count INTEGER DEFAULT 0,
  
  UNIQUE(api_endpoint, query_params)
);

CREATE INDEX idx_cache_endpoint ON museum_data_cache(api_endpoint);
CREATE INDEX idx_cache_expires ON museum_data_cache(expires_at);

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_workflows_timestamp 
AFTER UPDATE ON workflows
BEGIN
  UPDATE workflows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_nodes_timestamp 
AFTER UPDATE ON nodes
BEGIN
  UPDATE nodes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_knowledge_entities_timestamp 
AFTER UPDATE ON knowledge_entities
BEGIN
  UPDATE knowledge_entities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- End of Initial Schema
-- ============================================================================

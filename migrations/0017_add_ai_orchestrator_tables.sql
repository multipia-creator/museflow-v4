-- Migration: Add AI Orchestrator Tables
-- Version: 1.0.0
-- Date: 2025-12-03
-- Description: AI Orchestration 시스템을 위한 4개 핵심 테이블 추가

-- ==========================================
-- 1. AI Execution Sessions
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_execution_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    command TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('conversational', 'autonomous')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    workflow_id TEXT,
    current_phase TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    total_duration_ms INTEGER,
    metadata TEXT, -- JSON: { projectContext, userHistory, etc. }
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_execution_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_status ON ai_execution_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_workflow_id ON ai_execution_sessions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_created_at ON ai_execution_sessions(created_at DESC);

-- ==========================================
-- 2. AI Execution Events
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_execution_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN (
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
    )),
    phase_name TEXT,
    agent_type TEXT CHECK(agent_type IN ('research', 'canvas', 'document', 'widget', 'integration', 'monitor')),
    event_data TEXT, -- JSON: { progress, output, error, etc. }
    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES ai_execution_sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_events_session_id ON ai_execution_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_event_type ON ai_execution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_events_timestamp ON ai_execution_events(timestamp DESC);

-- ==========================================
-- 3. Canvas Dashboard Sync
-- ==========================================
CREATE TABLE IF NOT EXISTS canvas_dashboard_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canvas_node_id TEXT NOT NULL,
    canvas_node_type TEXT NOT NULL,
    dashboard_widget_id TEXT NOT NULL,
    sync_data TEXT NOT NULL, -- JSON: { widgetData, nodeData, mapping, etc. }
    sync_timestamp DATETIME NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending', 'completed', 'failed')),
    session_id INTEGER,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES ai_execution_sessions(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_sync_node_id ON canvas_dashboard_sync(canvas_node_id);
CREATE INDEX IF NOT EXISTS idx_canvas_sync_widget_id ON canvas_dashboard_sync(dashboard_widget_id);
CREATE INDEX IF NOT EXISTS idx_canvas_sync_status ON canvas_dashboard_sync(sync_status);
CREATE INDEX IF NOT EXISTS idx_canvas_sync_timestamp ON canvas_dashboard_sync(sync_timestamp DESC);

-- ==========================================
-- 4. Learning Data
-- ==========================================
CREATE TABLE IF NOT EXISTS learning_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    task_type TEXT NOT NULL,
    user_input TEXT NOT NULL,
    ai_decision TEXT NOT NULL, -- JSON: { workflow, phases, options, reasoning, etc. }
    user_feedback TEXT CHECK(user_feedback IN ('approved', 'rejected', 'modified')),
    success_rate INTEGER CHECK(success_rate BETWEEN 0 AND 100),
    execution_duration_ms INTEGER,
    context_data TEXT, -- JSON: { userHistory, projectContext, etc. }
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES ai_execution_sessions(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_user_id ON learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_task_type ON learning_data(task_type);
CREATE INDEX IF NOT EXISTS idx_learning_feedback ON learning_data(user_feedback);
CREATE INDEX IF NOT EXISTS idx_learning_created_at ON learning_data(created_at DESC);

-- ==========================================
-- Triggers for updated_at
-- ==========================================

-- ai_execution_sessions trigger
CREATE TRIGGER IF NOT EXISTS update_ai_sessions_timestamp
AFTER UPDATE ON ai_execution_sessions
FOR EACH ROW
BEGIN
    UPDATE ai_execution_sessions 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- canvas_dashboard_sync trigger
CREATE TRIGGER IF NOT EXISTS update_canvas_sync_timestamp
AFTER UPDATE ON canvas_dashboard_sync
FOR EACH ROW
BEGIN
    UPDATE canvas_dashboard_sync 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- ==========================================
-- Initial Data (Optional)
-- ==========================================

-- None for now

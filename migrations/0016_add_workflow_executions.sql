-- Migration: Add Workflow Executions Table
-- Description: Store workflow execution results and history
-- Date: 2025-12-02

CREATE TABLE IF NOT EXISTS workflow_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT UNIQUE NOT NULL,
  project_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed', 'partial')),
  total_nodes INTEGER NOT NULL DEFAULT 0,
  completed_nodes INTEGER NOT NULL DEFAULT 0,
  failed_nodes INTEGER NOT NULL DEFAULT 0,
  nodes TEXT, -- JSON array of node execution results
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  total_execution_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_executions_project_id 
  ON workflow_executions(project_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id 
  ON workflow_executions(execution_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at 
  ON workflow_executions(started_at DESC);

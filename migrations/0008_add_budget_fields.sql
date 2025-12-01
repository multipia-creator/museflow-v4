-- ============================================================================
-- Add Budget Fields to Projects
-- Migration: 0008
-- Purpose: Add budget tracking fields for financial management
-- ============================================================================

-- Add budget fields to projects table
ALTER TABLE projects ADD COLUMN budget_total INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN budget_used INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN budget_currency TEXT DEFAULT 'KRW';
ALTER TABLE projects ADD COLUMN budget_start_date TEXT;
ALTER TABLE projects ADD COLUMN budget_end_date TEXT;

-- Add budget-related metadata
ALTER TABLE projects ADD COLUMN type TEXT DEFAULT 'exhibition';
ALTER TABLE projects ADD COLUMN phase TEXT DEFAULT 'planning';
ALTER TABLE projects ADD COLUMN curator TEXT;
ALTER TABLE projects ADD COLUMN location TEXT;
ALTER TABLE projects ADD COLUMN start_date TEXT;
ALTER TABLE projects ADD COLUMN end_date TEXT;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_projects_budget_total ON projects(budget_total);

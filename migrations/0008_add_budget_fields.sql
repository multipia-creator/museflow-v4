-- ============================================================================
-- Add Extended Budget Fields to Projects
-- Migration: 0008
-- Purpose: Add additional budget tracking fields (currency, date range)
-- Note: budget_total, budget_used already added in 0006
-- ============================================================================

-- Add budget currency and date range (new fields only)
ALTER TABLE projects ADD COLUMN budget_currency TEXT DEFAULT 'KRW';
ALTER TABLE projects ADD COLUMN budget_start_date TEXT;
ALTER TABLE projects ADD COLUMN budget_end_date TEXT;

-- Create additional index for budget total (if not exists)
CREATE INDEX IF NOT EXISTS idx_projects_budget_total ON projects(budget_total);

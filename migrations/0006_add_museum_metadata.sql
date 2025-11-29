-- Add museum-specific metadata to projects table
ALTER TABLE projects ADD COLUMN type TEXT DEFAULT 'special' CHECK(type IN ('permanent', 'special', 'traveling', 'event'));
ALTER TABLE projects ADD COLUMN start_date TEXT;
ALTER TABLE projects ADD COLUMN end_date TEXT;
ALTER TABLE projects ADD COLUMN phase TEXT DEFAULT 'planning' CHECK(phase IN ('planning', 'preparation', 'execution', 'marketing', 'completed'));
ALTER TABLE projects ADD COLUMN location TEXT;
ALTER TABLE projects ADD COLUMN curator TEXT;
ALTER TABLE projects ADD COLUMN budget_total INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN budget_used INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN artwork_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN thumbnail_url TEXT;
ALTER TABLE projects ADD COLUMN color_tag TEXT DEFAULT '#ec4899';

-- Create index for exhibition dates
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);

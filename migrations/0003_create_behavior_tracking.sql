-- Migration: 0003_create_behavior_tracking.sql
-- Description: Create tables for user behavior tracking and personalization
-- Date: 2025-11-22

-- ============================================
-- User Behaviors Table
-- ============================================
-- Tracks all user interactions for personalization
CREATE TABLE IF NOT EXISTS user_behaviors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'click', 'view', 'edit', 'delete', 'create', 'search'
    resource_type TEXT, -- 'project', 'workflow', 'canvas', 'page'
    resource_id INTEGER, -- ID of the resource (can be NULL for page views)
    page_path TEXT, -- Current page URL path
    duration INTEGER DEFAULT 0, -- Time spent in seconds
    metadata TEXT, -- JSON string for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_behaviors_user_id ON user_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_created_at ON user_behaviors(created_at);
CREATE INDEX IF NOT EXISTS idx_behaviors_user_time ON user_behaviors(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behaviors_event_type ON user_behaviors(event_type);
CREATE INDEX IF NOT EXISTS idx_behaviors_resource ON user_behaviors(resource_type, resource_id);

-- ============================================
-- User Preferences Table
-- ============================================
-- Stores user dashboard preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    dashboard_layout TEXT, -- JSON string: ["widget1", "widget2", ...]
    favorite_projects TEXT, -- JSON string: [1, 2, 3]
    hidden_widgets TEXT, -- JSON string: ["widget-id"]
    ui_theme TEXT DEFAULT 'dark', -- 'dark' or 'light'
    language TEXT DEFAULT 'ko', -- User's preferred language
    timezone TEXT DEFAULT 'Asia/Seoul',
    notifications_enabled INTEGER DEFAULT 1, -- Boolean: 0 or 1
    email_digest_enabled INTEGER DEFAULT 1, -- Boolean: 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- User Insights Cache Table
-- ============================================
-- Caches computed insights for performance
CREATE TABLE IF NOT EXISTS user_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    insight_type TEXT NOT NULL, -- 'productivity_score', 'top_features', 'weekly_summary'
    insight_data TEXT NOT NULL, -- JSON string with computed insights
    valid_until DATETIME NOT NULL, -- Cache expiration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insights_user_type ON user_insights(user_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_valid ON user_insights(valid_until);

-- ============================================
-- Insert default preferences for existing users
-- ============================================
INSERT OR IGNORE INTO user_preferences (user_id, dashboard_layout)
SELECT id, '["recent-activity","weekly-chart","top-features","quick-stats"]'
FROM users;

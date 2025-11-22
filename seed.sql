-- Demo User
-- Password: demo123! (hashed with SHA-256)
INSERT OR IGNORE INTO users (id, email, password_hash, name, created_at, last_login) VALUES 
  (1, 'demo@museflow.life', 'a4b68926dcbb3bb050605983391192bd2a2f3da552788e2d15f3c81816e53767', 'Demo User', datetime('now'), datetime('now'));

-- Demo Projects
INSERT OR IGNORE INTO projects (id, user_id, title, description, status, created_at, updated_at) VALUES 
  (1, 1, '2024 봄 특별전', '봄 시즌 특별 전시 기획', 'draft', '2025-11-21 21:30:49', '2025-11-21 21:30:49'),
  (2, 1, '여름 아트 페스티벌', '야외 아트 전시회', 'draft', '2025-11-21 21:30:49', '2025-11-21 21:30:49'),
  (3, 1, 'AI 미술관 시뮬레이션', '디지털 트윈 프로젝트', 'draft', '2025-11-21 21:30:49', '2025-11-21 21:30:49');

-- User Preferences (for demo user)
INSERT OR IGNORE INTO user_preferences (user_id, dashboard_layout, favorite_projects, ui_theme, language) VALUES
  (1, '["daily-briefing","weekly-activity","top-features","quick-stats"]', '[1,2,3]', 'dark', 'ko');

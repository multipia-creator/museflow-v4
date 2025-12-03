-- Insert test user
INSERT OR IGNORE INTO users (id, email, password_hash, name, created_at) 
VALUES (1, 'curator@museflow.life', 'test_hash', 'Test Curator', datetime('now'));

-- Insert test project  
INSERT OR IGNORE INTO projects (id, user_id, title, description, status, created_at)
VALUES (1, 1, '인상주의 특별전', '테스트 프로젝트', 'active', datetime('now'));

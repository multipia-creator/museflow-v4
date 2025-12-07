-- 승인 시스템 테스트용 사용자 생성
-- 테스트 계정 1: 관장 (결재권자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) VALUES 
('director@museum.com', '김관장 (관장)', 'test123', TRUE, datetime('now'));

-- 테스트 계정 2: 학예실장 (결재권자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) VALUES 
('chief@museum.com', '이실장 (학예실장)', 'test123', TRUE, datetime('now'));

-- 테스트 계정 3: 학예사 (일반 사용자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) VALUES 
('curator@museum.com', '박학예 (학예사)', 'test123', FALSE, datetime('now'));

-- 테스트 계정 4: 에듀게이터 (일반 사용자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) VALUES 
('educator@museum.com', '최교육 (에듀게이터)', 'test123', FALSE, datetime('now'));

-- 테스트 프로젝트 (학예사가 생성)
INSERT INTO projects (title, description, user_id, approval_status, created_at) VALUES 
('2024 봄 특별전', '봄을 주제로 한 특별 전시 기획', 
  (SELECT id FROM users WHERE email='curator@museum.com'), 
  'draft', 
  datetime('now'));

INSERT INTO projects (title, description, user_id, approval_status, created_at) VALUES 
('어린이 교육 프로그램', '초등학생 대상 박물관 체험 프로그램', 
  (SELECT id FROM users WHERE email='educator@museum.com'), 
  'draft', 
  datetime('now'));

-- 테스트 승인 요청 (이미 승인 대기 중인 프로젝트)
INSERT INTO projects (title, description, user_id, approval_status, created_at) VALUES 
('문화재 보존 프로젝트', '중요 문화재 보존 처리 계획', 
  (SELECT id FROM users WHERE email='curator@museum.com'), 
  'pending_approval', 
  datetime('now'));

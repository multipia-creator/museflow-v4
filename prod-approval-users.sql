-- 프로덕션 승인 시스템 테스트 계정 생성
-- 실제 사용 가능한 계정

-- 테스트 계정 1: 관장 (결재권자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) 
VALUES ('director@museflow.kr', '김민수 관장', '$2a$10$abcdefghijklmnopqrstuv', TRUE, datetime('now'));

-- 테스트 계정 2: 학예실장 (결재권자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) 
VALUES ('chief@museflow.kr', '이지혜 학예실장', '$2a$10$abcdefghijklmnopqrstuv', TRUE, datetime('now'));

-- 테스트 계정 3: 학예사 (일반 사용자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) 
VALUES ('curator@museflow.kr', '박준영 학예사', '$2a$10$abcdefghijklmnopqrstuv', FALSE, datetime('now'));

-- 테스트 계정 4: 에듀게이터 (일반 사용자)
INSERT INTO users (email, name, password_hash, is_approver, created_at) 
VALUES ('educator@museflow.kr', '최서연 에듀게이터', '$2a$10$abcdefghijklmnopqrstuv', FALSE, datetime('now'));

-- 테스트 프로젝트 1: 학예사가 생성 (승인 대기)
INSERT INTO projects (title, description, user_id, approval_status, created_at) 
VALUES (
  '2024 봄 특별전: 한국의 미',
  '전통 회화와 현대 미술의 만남을 주제로 한 특별 전시 기획. 예산: 5,000만원, 기간: 3개월',
  (SELECT id FROM users WHERE email='curator@museflow.kr'),
  'pending_approval',
  datetime('now')
);

-- 테스트 프로젝트 2: 에듀게이터가 생성 (draft)
INSERT INTO projects (title, description, user_id, approval_status, created_at) 
VALUES (
  '어린이 미술관 체험 프로그램',
  '초등학생 대상 박물관 교육 프로그램 (주말반 운영). 예산: 800만원',
  (SELECT id FROM users WHERE email='educator@museflow.kr'),
  'draft',
  datetime('now')
);

-- 승인 이력 기록 (프로젝트 1 승인 요청)
INSERT INTO approval_history (project_id, user_id, action, comment, created_at)
VALUES (
  (SELECT id FROM projects WHERE title='2024 봄 특별전: 한국의 미'),
  (SELECT id FROM users WHERE email='curator@museflow.kr'),
  'request',
  '기획안 검토 요청드립니다',
  datetime('now')
);

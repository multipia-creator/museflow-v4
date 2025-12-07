-- Migration 0019: Add Approval System (Simple 2-Level: Approvers vs General Users)
-- Date: 2024-12-07
-- Purpose: 관장/학예실장만 결재 권한, 나머지는 일반 사용자

-- ============================================================
-- 1. users 테이블에 결재권한 컬럼 추가
-- ============================================================
ALTER TABLE users ADD COLUMN is_approver BOOLEAN DEFAULT FALSE;

-- 기본값: 관장, 학예실장만 결재권자로 설정 (existing users)
-- Note: 실제 운영시 특정 user_id로 업데이트 필요
-- UPDATE users SET is_approver = TRUE WHERE position IN ('관장', '학예실장');

-- ============================================================
-- 2. projects 테이블에 승인 관련 컬럼 추가
-- ============================================================
ALTER TABLE projects ADD COLUMN approval_status TEXT DEFAULT 'draft';
-- approval_status: 'draft', 'pending_approval', 'approved', 'rejected'

ALTER TABLE projects ADD COLUMN approver_id INTEGER;
-- 승인/반려한 결재권자 ID

ALTER TABLE projects ADD COLUMN approved_at DATETIME;
-- 승인/반려 시각

ALTER TABLE projects ADD COLUMN approval_comment TEXT;
-- 승인/반려 시 코멘트

-- ============================================================
-- 3. 승인 이력 추적 테이블 (선택적)
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'request', 'approve', 'reject'
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_history_project ON approval_history(project_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_user ON approval_history(user_id);

-- ============================================================
-- 4. 승인 대기 중인 프로젝트 조회 성능을 위한 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_approval_status ON projects(approval_status);
CREATE INDEX IF NOT EXISTS idx_projects_approver ON projects(approver_id);

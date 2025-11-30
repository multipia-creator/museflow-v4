-- ============================================================================
-- Dashboard Enhanced Sample Data
-- Team Activities, User Engagement, Analytics Data
-- ============================================================================

-- Add more users for team activity
INSERT OR IGNORE INTO users (id, email, password_hash, name, created_at) VALUES
(3, 'curator1@museflow.ai', 'hash', '김큐레이터', datetime('now', '-6 months')),
(4, 'curator2@museflow.ai', 'hash', '이학예사', datetime('now', '-5 months')),
(5, 'designer@museflow.ai', 'hash', '박디자이너', datetime('now', '-4 months')),
(6, 'marketing@museflow.ai', 'hash', '최마케터', datetime('now', '-3 months')),
(7, 'coordinator@museflow.ai', 'hash', '정코디네이터', datetime('now', '-2 months'));

-- Add team activity comments (using existing comments table)
INSERT OR IGNORE INTO comments (id, task_id, user_id, content, created_at) VALUES
-- Recent activity (last 3 days)
(1, 14, 3, '홍보 이미지 초안 확인했습니다. 색감이 좋네요!', datetime('now', '-2 hours')),
(2, 14, 6, '감사합니다. 수정 사항 반영하겠습니다.', datetime('now', '-1 hour')),
(3, 15, 4, '보도자료 검토 완료. 언론사 리스트 추가 부탁드립니다.', datetime('now', '-5 hours')),
(4, 16, 5, '포스터 인쇄 완료되었습니다.', datetime('now', '-1 day')),
(5, 17, 3, '작품 선정 회의 일정 잡겠습니다.', datetime('now', '-1 day')),
(6, 18, 7, '도자기 포장 자재 주문 완료', datetime('now', '-2 days')),
(7, 19, 4, '작품 목록 정리 중입니다.', datetime('now', '-2 days')),
(8, 20, 6, '디지털 작품 라이선스 확인 필요', datetime('now', '-3 days')),
-- Older activity
(9, 21, 3, '전시 콘셉트 기획안 작성 중', datetime('now', '-5 days')),
(10, 22, 5, '포스터 디자인 시안 3종 완성', datetime('now', '-7 days')),
(11, 23, 4, '도슨트 교육 자료 준비 중', datetime('now', '-10 days')),
(12, 24, 7, '작품 운송 일정 확정', datetime('now', '-12 days'));

-- Add more tasks with various dates for analytics
INSERT OR IGNORE INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, created_at, updated_at) VALUES
-- 한국 근현대 미술 특별전 (Project 5) - 추가 태스크
(5, 2, '전시 도록 제작', '전시 작품 해설 및 작가 인터뷰 포함', 'execution', 'in_progress', 'high', '김큐레이터', '2024-12-10', datetime('now', '-15 days'), datetime('now', '-1 day')),
(5, 2, '오프닝 리셉션 준비', 'VIP 초청 및 케이터링 준비', 'preparation', 'pending', 'medium', '정코디네이터', '2024-11-28', datetime('now', '-20 days'), datetime('now', '-5 days')),

-- 조선 백자 상설전 (Project 6) - 태스크
(6, 2, '조명 설치 점검', '작품 조명 각도 및 밝기 조정', 'execution', 'completed', 'high', '박디자이너', '2024-11-20', datetime('now', '-30 days'), datetime('now', '-10 days')),
(6, 2, '도슨트 교육 실시', '백자 역사 및 작품 해설 교육', 'execution', 'in_progress', 'medium', '이학예사', '2024-12-05', datetime('now', '-25 days'), datetime('now', '-2 days')),
(6, 2, '관람객 피드백 수집', '설문조사 및 방명록 관리', 'execution', 'pending', 'low', '최마케터', '2024-12-15', datetime('now', '-20 days'), datetime('now')),

-- 디지털 아트 순회전 (Project 7) - 태스크
(7, 2, '디지털 작품 라이선스 확보', '작가 10명 라이선스 계약', 'planning', 'in_progress', 'urgent', '김큐레이터', '2024-12-08', datetime('now', '-10 days'), datetime('now')),
(7, 2, 'VR 장비 설치 계획', 'VR 체험 공간 설계', 'planning', 'pending', 'high', '박디자이너', '2024-12-12', datetime('now', '-8 days'), datetime('now')),
(7, 2, '기술 협력사 미팅', '디지털 전시 시스템 논의', 'planning', 'in_progress', 'high', '정코디네이터', '2024-12-05', datetime('now', '-12 days'), datetime('now', '-1 day')),

-- 어린이 체험 기획전 (Project 8) - 태스크
(8, 2, '체험 프로그램 개발', '어린이 대상 미술 워크샵', 'execution', 'in_progress', 'high', '이학예사', '2024-12-15', datetime('now', '-18 days'), datetime('now', '-3 days')),
(8, 2, '안전 시설 점검', '어린이 안전 가이드라인 적용', 'execution', 'completed', 'urgent', '정코디네이터', '2024-11-25', datetime('now', '-25 days'), datetime('now', '-15 days')),
(8, 2, '학교 단체 관람 홍보', '초등학교 대상 홍보 자료 발송', 'marketing', 'pending', 'medium', '최마케터', '2024-12-20', datetime('now', '-10 days'), datetime('now')),

-- 고려청자 특별전 (Project 9) - 태스크
(9, 2, '작품 선정 회의', '청자 명품 50점 선정', 'planning', 'in_progress', 'high', '김큐레이터', '2024-12-10', datetime('now', '-5 days'), datetime('now', '-1 day')),
(9, 2, '보험 계약 체결', '작품 보험 및 운송 보험', 'planning', 'pending', 'urgent', '정코디네이터', '2024-12-08', datetime('now', '-7 days'), datetime('now')),

-- 현대 조각 야외전 (Project 10) - 태스크
(10, 2, '야외 설치 작업', '대형 조각 작품 설치', 'execution', 'in_progress', 'urgent', '박디자이너', '2024-12-05', datetime('now', '-8 days'), datetime('now', '-2 days')),
(10, 2, '날씨 대비 보호 조치', '작품 보호 커버 제작', 'execution', 'in_progress', 'high', '정코디네이터', '2024-12-07', datetime('now', '-6 days'), datetime('now', '-1 day'));

-- Update existing projects with more realistic dates for better timeline visualization
UPDATE projects SET 
    created_at = datetime('now', '-' || (id * 15) || ' days'),
    updated_at = datetime('now', '-' || (id * 2) || ' days')
WHERE id BETWEEN 5 AND 12;

-- Add some visitor statistics (using behavior_logs table if available, or we'll create analytics in dashboard)
-- This will be handled in the dashboard JavaScript

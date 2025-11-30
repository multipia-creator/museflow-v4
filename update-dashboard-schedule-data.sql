-- Update projects with schedule and detailed information for dashboard visualization
-- This adds start_date, description, location, and curator info

-- Update project 1: 브라우저 테스트 프로젝트
UPDATE projects SET 
  start_date = date('now', '-5 days'),
  description = '웹 브라우저 호환성 테스트 및 UI/UX 개선 프로젝트',
  location = '온라인',
  curator = '김테스터'
WHERE id = 1;

-- Update project 2: 2024
UPDATE projects SET 
  start_date = date('now', '+2 days'),
  description = '2024년 연례 기획 전시 - 현대미술의 새로운 시각',
  location = '제1전시관',
  curator = '이큐레이터'
WHERE id = 2;

-- Update project 3: 한국 근현대 미술 특별전
UPDATE projects SET 
  start_date = date('now', '-10 days'),
  description = '한국 근현대 미술의 흐름을 조망하는 대규모 특별 전시',
  location = '제2전시관 (B1-3F)',
  curator = '박미술'
WHERE id = 3;

-- Update project 4: 조선 백자 상설전
UPDATE projects SET 
  start_date = date('now', '-30 days'),
  description = '조선시대 백자의 아름다움과 기술을 만나는 상설 전시',
  location = '도자기관 1층',
  curator = '최도자'
WHERE id = 4;

-- Update project 5: 디지털 아트 순회전
UPDATE projects SET 
  start_date = date('now', '+1 day'),
  description = '미디어 아트와 인터랙티브 작품이 만나는 디지털 전시',
  location = '특별전시관',
  curator = '정디지털'
WHERE id = 5;

-- Update project 6: 어린이 체험 기획전
UPDATE projects SET 
  start_date = date('now', '+3 days'),
  description = '어린이들이 직접 참여하고 체험하는 교육형 전시',
  location = '교육관 2층',
  curator = '김교육'
WHERE id = 6;

-- Update project 7: 고려청자 특별전
UPDATE projects SET 
  start_date = date('now', '-3 days'),
  description = '고려시대 청자의 우아함과 독창성을 담은 특별 기획전',
  location = '도자기관 2층',
  curator = '이청자'
WHERE id = 7;

-- Update project 8: 현대 조각 야외전
UPDATE projects SET 
  start_date = date('now'),
  description = '현대 조각 작품들을 야외 공간에서 만나는 특별한 경험',
  location = '야외 조각공원',
  curator = '박조각'
WHERE id = 8;

-- Update project 9: 한복의 美 특별전
UPDATE projects SET 
  start_date = date('now', '+4 days'),
  description = '전통 한복의 아름다움과 현대적 재해석을 담은 전시',
  location = '전통문화관',
  curator = '최한복'
WHERE id = 9;

-- Update project 10: 불교 미술 순회전
UPDATE projects SET 
  start_date = date('now', '+5 days'),
  description = '불교 미술의 정수를 담은 전국 순회 전시',
  location = '순회 중 (다음: 부산)',
  curator = '정불교'
WHERE id = 10;

-- Add more this week events by creating additional task deadlines
-- These will show up in the weekly timeline

-- Create additional tasks with deadlines this week for richer timeline
INSERT INTO tasks (project_id, user_id, title, description, status, phase, assignee_id, due_date, created_at)
VALUES
  -- Today's tasks
  (8, 2, '야외 조각 설치 완료', '조각 작품 10점 설치 및 안전 점검', 'in_progress', 'execution', 2, date('now'), datetime('now')),
  (3, 2, '전시 오프닝 리셉션 준비', 'VIP 초청장 발송 및 케이터링 준비', 'in_progress', 'marketing', 3, date('now'), datetime('now')),
  
  -- Tomorrow's tasks
  (5, 2, '미디어 아트 기술 점검', '인터랙티브 장비 최종 테스트', 'pending', 'preparation', 4, date('now', '+1 day'), datetime('now')),
  (2, 2, '전시 도록 인쇄 완료', '전시 도록 2000부 인쇄 및 납품', 'pending', 'preparation', 5, date('now', '+1 day'), datetime('now')),
  
  -- Day after tomorrow
  (1, 2, 'UI 테스트 최종 검토', '크로스 브라우저 테스트 완료 보고', 'pending', 'execution', 2, date('now', '+2 days'), datetime('now')),
  (7, 2, '청자 작품 조명 조정', '전시 조명 밝기 및 각도 최적화', 'pending', 'execution', 3, date('now', '+2 days'), datetime('now')),
  
  -- +3 days
  (6, 2, '어린이 체험 프로그램 시연', '교육 프로그램 사전 시연 및 피드백', 'pending', 'preparation', 4, date('now', '+3 days'), datetime('now')),
  (3, 2, '언론사 프리뷰 투어', '주요 언론사 대상 사전 공개', 'pending', 'marketing', 5, date('now', '+3 days'), datetime('now')),
  
  -- +4 days
  (9, 2, '한복 전시 오픈', '한복의 美 특별전 정식 오픈', 'pending', 'execution', 2, date('now', '+4 days'), datetime('now')),
  (5, 2, '디지털 아트 작가 토크', '참여 작가 3인 토크쇼 진행', 'pending', 'marketing', 3, date('now', '+4 days'), datetime('now')),
  
  -- +5 days
  (10, 2, '순회전 부산 이동', '작품 포장 및 부산 이동 준비', 'pending', 'execution', 4, date('now', '+5 days'), datetime('now')),
  (4, 2, '백자 도슨트 교육', '신규 도슨트 교육 프로그램 실시', 'pending', 'marketing', 5, date('now', '+5 days'), datetime('now')),
  
  -- +6 days
  (2, 2, '2024 전시 최종 점검', '개막 전 최종 체크리스트 검토', 'pending', 'preparation', 2, date('now', '+6 days'), datetime('now')),
  (8, 2, '조각 공원 야간 조명 테스트', '야간 관람을 위한 조명 시스템 점검', 'pending', 'execution', 3, date('now', '+6 days'), datetime('now'));

-- ============================================================================
-- Sample Museum Projects Data
-- Purpose: Real-world museum exhibition and education projects
-- ============================================================================

-- 1. 한국 도자기 특별전 (Korean Ceramics Special Exhibition)
INSERT INTO projects (
  user_id, title, description, status, 
  type, phase, curator, location, 
  start_date, end_date, 
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag, 
  workflow_data
) VALUES (
  2, 
  '한국 도자기 특별전', 
  '고려청자에서 조선백자까지, 한국 도자기의 아름다움을 조명하는 대규모 특별전. 국립중앙박물관 소장품 중심으로 약 150점 전시.',
  'active',
  'special', 
  'execution', 
  '김미영', 
  '제1전시관',
  '2025-03-15', 
  '2025-06-30',
  50000000, 
  35000000, 
  'KRW',
  150, 
  '#3b82f6',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "budget", "completed": true}, {"id": "timeline", "completed": false}]}'
);

-- 2. 어린이 박물관 교육 프로그램
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '어린이 박물관 체험교실',
  '초등학생 대상 문화유산 체험 교육 프로그램. 도자기 만들기, 전통 서화 체험 등 다양한 활동 포함.',
  'active',
  'event',
  'marketing',
  '이수진',
  '교육관 2층',
  '2025-02-01',
  '2025-12-31',
  25000000,
  8000000,
  'KRW',
  0,
  '#10b981',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "marketing", "completed": false}]}'
);

-- 3. 세계 문화유산 순회전
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '세계 문화유산 순회전',
  'UNESCO 세계문화유산 사진 및 복제품 전시. 전국 5개 도시 순회 예정.',
  'active',
  'traveling',
  'execution',
  '박준호',
  '전국 순회',
  '2025-04-01',
  '2025-11-30',
  80000000,
  85000000,
  'KRW',
  200,
  '#ef4444',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "budget", "completed": true}, {"id": "venue", "completed": false}]}'
);

-- 4. 디지털 아카이브 구축 프로젝트
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '박물관 소장품 디지털 아카이브',
  '3D 스캔 및 고해상도 촬영을 통한 소장품 디지털화 프로젝트. 총 1,000점 목표.',
  'active',
  'permanent',
  'preparation',
  '최민호',
  '온라인',
  '2025-01-01',
  '2025-12-31',
  60000000,
  20000000,
  'KRW',
  1000,
  '#8b5cf6',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "technical", "completed": false}]}'
);

-- 5. 조선시대 회화 특별전
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '조선 문인화의 세계',
  '18-19세기 조선 후기 문인화 걸작 모음. 국내외 소장품 50점 특별 공개.',
  'active',
  'special',
  'planning',
  '정하은',
  '제2전시관',
  '2025-09-01',
  '2025-12-15',
  45000000,
  5000000,
  'KRW',
  50,
  '#f59e0b',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "artwork", "completed": false}]}'
);

-- 6. 박물관의 밤 (야간 특별 개관)
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '박물관의 밤 - 야간 특별 개관',
  '매월 마지막 주 금요일 야간 개관 이벤트. 음악 공연, 큐레이터 해설 포함.',
  'active',
  'event',
  'execution',
  '김서영',
  '전관',
  '2025-01-31',
  '2025-12-27',
  15000000,
  12000000,
  'KRW',
  0,
  '#ec4899',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "marketing", "completed": true}]}'
);

-- 7. 현대미술 기획전
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '동시대 한국미술 2025',
  '현대 한국 작가 10인의 신작 30점 선보이는 기획전. 미디어 아트, 설치 작품 중심.',
  'draft',
  'special',
  'planning',
  '이재희',
  '기획전시실',
  '2025-10-01',
  '2026-01-31',
  70000000,
  0,
  'KRW',
  30,
  '#06b6d4',
  '{"modules": [{"id": "concept", "completed": false}]}'
);

-- 8. 박물관 상설전시 리뉴얼
INSERT INTO projects (
  user_id, title, description, status,
  type, phase, curator, location,
  start_date, end_date,
  budget_total, budget_used, budget_currency,
  artwork_count, color_tag,
  workflow_data
) VALUES (
  2,
  '상설전시관 전면 리뉴얼',
  '개관 10주년 기념 상설전시 공간 재구성. 동선 개선, 조명 교체, 전시 케이스 신규 제작.',
  'active',
  'permanent',
  'preparation',
  '박민수',
  '상설전시관 1~3층',
  '2025-07-01',
  '2025-12-31',
  120000000,
  30000000,
  'KRW',
  500,
  '#14b8a6',
  '{"modules": [{"id": "concept", "completed": true}, {"id": "design", "completed": false}]}'
);

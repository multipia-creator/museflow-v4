-- Sample Projects with diverse data for visual statistics

-- Project 1: 한국 근현대 미술 특별전 (Marketing phase - 홍보 중)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '한국 근현대 미술 특별전', '1900-1950년대 한국 근현대 미술의 흐름을 조명하는 대규모 특별전', 'special', 'marketing', 'active', '2024-12-01', '2025-03-31', '2층 대전시실', '김미술', 80000000, 65000000, 145, datetime('now', '-10 days'), datetime('now', '-1 day'));

-- Project 2: 조선 백자 상설전 (Execution phase - 진행 중)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '조선 백자 상설전', '조선시대 백자의 아름다움과 기술적 우수성을 보여주는 상설 전시', 'permanent', 'execution', 'active', '2024-01-01', '2025-12-31', '1층 상설전시실', '박도자', 50000000, 42000000, 89, datetime('now', '-30 days'), datetime('now', '-2 days'));

-- Project 3: 디지털 아트 순회전 (Preparation phase - 준비 중)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '디지털 아트 순회전', 'NFT와 AI 아트를 결합한 혁신적인 디지털 아트 순회 전시', 'traveling', 'preparation', 'active', '2025-02-01', '2025-06-30', '3층 멀티미디어실', '이디지털', 120000000, 35000000, 67, datetime('now', '-20 days'), datetime('now', '-3 days'));

-- Project 4: 어린이 체험 기획전 (Planning phase - 기획 중)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '어린이 체험 기획전', '어린이들이 직접 참여하고 체험할 수 있는 인터랙티브 전시', 'event', 'planning', 'draft', '2025-04-01', '2025-08-31', '지하 1층 체험관', '최교육', 95000000, 15000000, 52, datetime('now', '-5 days'), datetime('now', '-1 day'));

-- Project 5: 고려청자 특별전 (Completed - 완료)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '고려청자 특별전', '고려시대 청자의 비색미와 장인정신을 재조명', 'special', 'completed', 'completed', '2024-06-01', '2024-09-30', '2층 특별전시실', '정청자', 70000000, 68000000, 112, datetime('now', '-120 days'), datetime('now', '-30 days'));

-- Project 6: 현대 조각 야외전 (Marketing phase - D-5)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '현대 조각 야외전', '현대 조각가들의 대형 작품을 야외 공간에 전시', 'event', 'marketing', 'active', '2024-12-05', '2025-02-28', '박물관 야외 정원', '송조각', 60000000, 52000000, 34, datetime('now', '-15 days'), datetime('now'));

-- Project 7: 한복의 美 특별전 (Execution phase)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '한복의 美 특별전', '전통 한복부터 현대 한복까지 한복의 변천사와 아름다움', 'special', 'execution', 'active', '2024-11-01', '2025-01-31', '3층 특별전시실', '안의상', 55000000, 48000000, 78, datetime('now', '-40 days'), datetime('now', '-1 day'));

-- Project 8: 불교 미술 순회전 (Planning phase)
INSERT INTO projects (user_id, title, description, type, phase, status, start_date, end_date, location, curator, budget_total, budget_used, artwork_count, created_at, updated_at) 
VALUES (2, '불교 미술 순회전', '한국, 중국, 일본 3국의 불교 미술 비교 전시', 'traveling', 'planning', 'draft', '2025-03-01', '2025-09-30', '2층 대전시실', '민불교', 150000000, 25000000, 156, datetime('now', '-8 days'), datetime('now', '-2 days'));

-- Production Tasks for Dashboard Visualization
-- Adjusted for Production Project IDs (1-10)

-- 한국 근현대 미술 특별전 (Project 3) - 추가 태스크
INSERT OR IGNORE INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, created_at, updated_at) VALUES
(3, 2, '전시 도록 제작', '전시 작품 해설 및 작가 인터뷰 포함', 'execution', 'in_progress', 'high', '김큐레이터', '2024-12-10', datetime('now', '-15 days'), datetime('now', '-1 day')),
(3, 2, '오프닝 리셉션 준비', 'VIP 초청 및 케이터링 준비', 'preparation', 'pending', 'medium', '정코디네이터', '2024-11-28', datetime('now', '-20 days'), datetime('now', '-5 days')),
(3, 2, 'SNS 홍보 콘텐츠 제작', '인스타그램, 페이스북 홍보 이미지 제작', 'marketing', 'in_progress', 'high', '최마케터', '2024-12-03', datetime('now', '-8 days'), datetime('now', '-1 day')),

-- 조선 백자 상설전 (Project 4) - 태스크
(4, 2, '조명 설치 점검', '작품 조명 각도 및 밝기 조정', 'execution', 'completed', 'high', '박디자이너', '2024-11-20', datetime('now', '-30 days'), datetime('now', '-10 days')),
(4, 2, '도슨트 교육 실시', '백자 역사 및 작품 해설 교육', 'execution', 'in_progress', 'medium', '이학예사', '2024-12-05', datetime('now', '-25 days'), datetime('now', '-2 days')),
(4, 2, '관람객 피드백 수집', '설문조사 및 방명록 관리', 'execution', 'pending', 'low', '최마케터', '2024-12-15', datetime('now', '-20 days'), datetime('now')),

-- 디지털 아트 순회전 (Project 5) - 태스크
(5, 2, '디지털 작품 라이선스 확보', '작가 10명 라이선스 계약', 'planning', 'in_progress', 'urgent', '김큐레이터', '2024-12-08', datetime('now', '-10 days'), datetime('now')),
(5, 2, 'VR 장비 설치 계획', 'VR 체험 공간 설계', 'planning', 'pending', 'high', '박디자이너', '2024-12-12', datetime('now', '-8 days'), datetime('now')),
(5, 2, '기술 협력사 미팅', '디지털 전시 시스템 논의', 'planning', 'in_progress', 'high', '정코디네이터', '2024-12-05', datetime('now', '-12 days'), datetime('now', '-1 day')),

-- 어린이 체험 기획전 (Project 6) - 태스크
(6, 2, '체험 프로그램 개발', '어린이 대상 미술 워크샵', 'execution', 'in_progress', 'high', '이학예사', '2024-12-15', datetime('now', '-18 days'), datetime('now', '-3 days')),
(6, 2, '안전 시설 점검', '어린이 안전 가이드라인 적용', 'execution', 'completed', 'urgent', '정코디네이터', '2024-11-25', datetime('now', '-25 days'), datetime('now', '-15 days')),
(6, 2, '학교 단체 관람 홍보', '초등학교 대상 홍보 자료 발송', 'marketing', 'pending', 'medium', '최마케터', '2024-12-20', datetime('now', '-10 days'), datetime('now')),

-- 고려청자 특별전 (Project 7) - 태스크
(7, 2, '작품 선정 회의', '청자 명품 50점 선정', 'planning', 'in_progress', 'high', '김큐레이터', '2024-12-10', datetime('now', '-5 days'), datetime('now', '-1 day')),
(7, 2, '보험 계약 체결', '작품 보험 및 운송 보험', 'planning', 'pending', 'urgent', '정코디네이터', '2024-12-08', datetime('now', '-7 days'), datetime('now')),
(7, 2, '청자 보존 처리', '작품 상태 점검 및 보존 처리', 'preparation', 'in_progress', 'high', '이학예사', '2024-12-12', datetime('now', '-6 days'), datetime('now', '-2 days')),

-- 현대 조각 야외전 (Project 8) - 태스크
(8, 2, '야외 설치 작업', '대형 조각 작품 설치', 'execution', 'in_progress', 'urgent', '박디자이너', '2024-12-05', datetime('now', '-8 days'), datetime('now', '-2 days')),
(8, 2, '날씨 대비 보호 조치', '작품 보호 커버 제작', 'execution', 'in_progress', 'high', '정코디네이터', '2024-12-07', datetime('now', '-6 days'), datetime('now', '-1 day')),
(8, 2, '야외 조명 설치', '야간 조명 시스템 설치', 'execution', 'pending', 'medium', '박디자이너', '2024-12-10', datetime('now', '-5 days'), datetime('now')),

-- 한복의 美 특별전 (Project 9) - 태스크
(9, 2, '한복 대여 계약', '전시용 전통 한복 50벌 대여', 'planning', 'in_progress', 'high', '김큐레이터', '2024-12-15', datetime('now', '-10 days'), datetime('now', '-2 days')),
(9, 2, '한복 전시 기획', '시대별 한복 배치 계획', 'planning', 'pending', 'medium', '이학예사', '2024-12-18', datetime('now', '-8 days'), datetime('now')),

-- 불교 미술 순회전 (Project 10) - 태스크
(10, 2, '불상 운송 일정 조율', '사찰별 불상 운송 스케줄', 'preparation', 'in_progress', 'urgent', '정코디네이터', '2024-12-08', datetime('now', '-9 days'), datetime('now', '-1 day')),
(10, 2, '불교 미술 해설 자료', '불상 및 불교 미술 해설 작성', 'preparation', 'in_progress', 'high', '이학예사', '2024-12-12', datetime('now', '-7 days'), datetime('now', '-2 days')),
(10, 2, '사찰 협력 협약', '전시 협력 사찰 MOU 체결', 'planning', 'completed', 'high', '김큐레이터', '2024-11-25', datetime('now', '-20 days'), datetime('now', '-15 days'));

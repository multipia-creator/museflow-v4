-- Sample Tasks for Projects

-- Project 5 (한국 근현대 미술 특별전) - Marketing phase tasks
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (5, 2, 'SNS 홍보 콘텐츠 제작', '인스타그램, 페이스북 홍보 이미지 및 영상 제작', 'marketing', 'in_progress', 'high', '김마케팅', '2024-12-03', '[{"text":"홍보 이미지 10종 제작","checked":true},{"text":"숏폼 영상 3종 제작","checked":true},{"text":"카피라이팅 작성","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (5, 2, '언론 보도자료 배포', '주요 언론사 보도자료 발송 및 사전 취재 유치', 'marketing', 'in_progress', 'high', '박홍보', '2024-12-02', '[{"text":"보도자료 작성 완료","checked":true},{"text":"언론사 30곳 발송","checked":false},{"text":"인터뷰 일정 조율","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (5, 2, '전시 포스터 인쇄', '전시 홍보 포스터 1,000부 인쇄 및 배포', 'marketing', 'completed', 'medium', '이디자인', '2024-11-28');

-- Project 6 (조선 백자 상설전) - Execution phase tasks
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (6, 2, '전시 작품 배치', '89점의 백자 작품 전시 배치 및 조명 설정', 'execution', 'in_progress', 'high', '박큐레이터', '2024-12-05', '[{"text":"작품 위치 선정","checked":true},{"text":"진열장 청소","checked":true},{"text":"조명 각도 조정","checked":false},{"text":"작품 라벨 부착","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (6, 2, '도슨트 교육', '상설전 도슨트 교육 프로그램 진행', 'execution', 'completed', 'medium', '최교육', '2024-11-25');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (6, 2, '안전 점검', '전시실 안전 점검 및 보안 시스템 테스트', 'execution', 'pending', 'high', '강안전', '2024-12-10', '[{"text":"소화기 점검","checked":false},{"text":"CCTV 작동 확인","checked":false},{"text":"비상구 표지 점검","checked":false}]');

-- Project 7 (디지털 아트 순회전) - Preparation phase tasks
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (7, 2, '멀티미디어 장비 설치', 'LED 스크린 및 프로젝터 설치', 'preparation', 'in_progress', 'high', '이기술', '2024-12-15', '[{"text":"장비 반입","checked":true},{"text":"전기 배선 작업","checked":true},{"text":"설치 및 테스트","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (7, 2, 'NFT 작품 계약', 'NFT 아티스트 10명과 전시 계약 체결', 'preparation', 'in_progress', 'high', '정계약', '2024-12-20');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (7, 2, '관람객 가이드 제작', '디지털 아트 관람 가이드북 및 QR코드 제작', 'preparation', 'pending', 'medium', '김콘텐츠', '2025-01-10', '[{"text":"가이드북 디자인","checked":false},{"text":"QR코드 생성","checked":false},{"text":"인쇄","checked":false}]');

-- Project 8 (어린이 체험 기획전) - Planning phase tasks
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (8, 2, '전시 기획안 작성', '어린이 체험 프로그램 기획안 작성 및 승인', 'planning', 'in_progress', 'high', '최기획', '2024-12-10', '[{"text":"컨셉 설정","checked":true},{"text":"체험 프로그램 목록","checked":true},{"text":"예산안 작성","checked":false},{"text":"승인 요청","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (8, 2, '교육 프로그램 개발', '어린이 대상 교육 프로그램 커리큘럼 개발', 'planning', 'pending', 'high', '박교육', '2024-12-20');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (8, 2, '체험 공간 설계', '안전한 어린이 체험 공간 설계 및 승인', 'planning', 'pending', 'medium', '안설계', '2025-01-05', '[{"text":"평면도 작성","checked":false},{"text":"안전 검토","checked":false},{"text":"인테리어 업체 선정","checked":false}]');

-- Project 10 (현대 조각 야외전) - Marketing phase, D-5 urgent
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (10, 2, '야외 전시 최종 점검', '조각 작품 고정 상태 및 안전성 최종 점검', 'marketing', 'in_progress', 'urgent', '송안전', '2024-12-04', '[{"text":"작품 고정 확인","checked":true},{"text":"조명 테스트","checked":false},{"text":"날씨 대비 준비","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (10, 2, '오프닝 리셉션 준비', '오프닝 행사 준비 및 VIP 초대', 'marketing', 'in_progress', 'urgent', '김이벤트', '2024-12-04');

-- Project 11 (한복의 美 특별전) - Execution phase
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (11, 2, '한복 보존 처리', '전시 한복의 손상 부위 보존 처리', 'execution', 'in_progress', 'high', '정보존', '2024-12-08', '[{"text":"손상 부위 촬영","checked":true},{"text":"보존 계획 수립","checked":true},{"text":"처리 작업","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (11, 2, '한복 체험 프로그램', '관람객 대상 한복 입어보기 프로그램 운영', 'execution', 'completed', 'medium', '최체험', '2024-11-20');

-- Project 12 (불교 미술 순회전) - Planning phase
INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date, checklist) 
VALUES (12, 2, '해외 박물관 협력', '중국, 일본 박물관과 작품 대여 협의', 'planning', 'in_progress', 'high', '민국제', '2024-12-15', '[{"text":"협력 요청서 발송","checked":true},{"text":"화상 회의 일정 조율","checked":false},{"text":"계약서 검토","checked":false}]');

INSERT INTO tasks (project_id, user_id, title, description, phase, status, priority, assignee, due_date) 
VALUES (12, 2, '전시 공간 확보', '대전시실 사용 일정 조율 및 확정', 'planning', 'pending', 'high', '이공간', '2024-12-25');

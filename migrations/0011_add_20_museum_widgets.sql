-- 0011_add_20_museum_widgets.sql
-- 박물관 운영 특화 위젯 20개 추가

-- 박물관 운영 특화 위젯 (8개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('ticket-sales', '입장권 판매 현황', '실시간 입장권 판매/취소/환불 통계', '박물관 운영', 'fa-ticket-alt', 6, 4),
  ('visitor-flow', '관람객 동선 분석', '전시실별 체류시간 및 이동 경로 히트맵', '박물관 운영', 'fa-route', 8, 6),
  ('docent-schedule', '도슨트 일정', '도슨트/가이드 투어 일정 및 예약 현황', '박물관 운영', 'fa-user-tie', 6, 5),
  ('exhibition-reviews', '전시 리뷰 모니터', '실시간 관람객 리뷰 및 평점 집계', '박물관 운영', 'fa-star', 6, 5),
  ('collection-alerts', '소장품 상태 알림', '보존 처리 필요/점검 필요 소장품 알림', '박물관 운영', 'fa-exclamation-triangle', 6, 4),
  ('rental-schedule', '대관 일정', '전시실/강당 대관 예약 캘린더', '박물관 운영', 'fa-building', 8, 5),
  ('member-stats', '회원 통계', '회원 가입/갱신/등급별 현황', '박물관 운영', 'fa-id-card', 6, 4),
  ('museum-pass', '박물관 패스 현황', '연간 패스 판매 및 사용 통계', '박물관 운영', 'fa-address-card', 6, 4);

-- 직원 관리 & 협업 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('staff-attendance', '직원 출퇴근 현황', '재택/출근/휴가 현황 대시보드', '직원 관리', 'fa-user-clock', 6, 4),
  ('meeting-room', '회의실 예약', '회의실 실시간 예약 현황 및 예약', '직원 관리', 'fa-door-open', 6, 4),
  ('task-board', '업무 할당 보드', '팀원별 업무 할당 및 진행률 칸반', '직원 관리', 'fa-tasks', 8, 6),
  ('knowledge-base', '지식 베이스', '자주 찾는 문서/매뉴얼 빠른 링크', '직원 관리', 'fa-book-open', 4, 4);

-- 마케팅 & 홍보 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('email-campaign', '이메일 캠페인 현황', '뉴스레터 발송/오픈율/클릭율 통계', '마케팅', 'fa-envelope-open', 6, 5),
  ('social-engagement', 'SNS 반응 분석', '게시물별 좋아요/댓글/공유 집계', '마케팅', 'fa-thumbs-up', 6, 5),
  ('media-monitor', '언론 보도 모니터', '박물관 관련 뉴스 기사 모니터링', '마케팅', 'fa-newspaper', 6, 6),
  ('booking-status', '방문 예약 현황', '온라인 사전 예약 현황 및 통계', '마케팅', 'fa-calendar-check', 6, 4);

-- 시설 & 안전 관리 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('security-system', '보안 시스템 상태', 'CCTV/출입통제/화재경보 상태 모니터', '시설 관리', 'fa-shield-alt', 6, 5),
  ('facility-checklist', '시설 점검 체크리스트', '일일/주간/월간 시설 점검 체크리스트', '시설 관리', 'fa-clipboard-check', 6, 5),
  ('energy-usage', '에너지 사용량', '전기/수도/가스 실시간 사용량 모니터', '시설 관리', 'fa-plug', 6, 4),
  ('parking-status', '주차장 현황', '실시간 주차 가능 대수 및 만차 알림', '시설 관리', 'fa-parking', 4, 3);

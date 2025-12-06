-- MuseFlow 87 Widget System - Complete Edition
-- Add premium column and insert all 87 widgets

-- Add new column to existing widgets table (price column already exists)
ALTER TABLE widgets ADD COLUMN premium BOOLEAN DEFAULT 0;

-- 87개 Widget 데이터 삽입

-- 📊 고급 분석 & 인사이트 (17개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('visitor-dwell-time', '관람객 체류 시간 분석', '전시실별 평균 체류 시간과 인기 전시물 패턴 분석', 'advanced-analytics', 'clock', 1, '₩7,900'),
('predictive-visitors', '예측 관람객 수', 'AI 기반 방문자 예측 및 최적 인력 배치 제안', 'advanced-analytics', 'brain', 1, '₩9,900'),
('exhibition-effectiveness', '전시 효과성 대시보드', '관람객 피드백, QR 스캔율, 오디오 가이드 사용률 종합', 'advanced-analytics', 'bar-chart-3', 1, '₩7,900'),
('heatmap-tracking', '관람객 동선 히트맵', '전시실별 관람객 이동 패턴 시각화', 'advanced-analytics', 'map', 1, '₩8,900'),
('engagement-metrics', '콘텐츠 참여도 분석', '전시물별 상호작용 시간 및 빈도 측정', 'advanced-analytics', 'activity', 1, '₩7,900'),
('demographic-insights', '방문자 인구통계', '연령·성별·지역별 방문자 데이터', 'advanced-analytics', 'pie-chart', 1, '₩6,900'),
('conversion-funnel', '티켓 구매 전환율', '온라인→오프라인 전환 분석', 'advanced-analytics', 'trending-up', 1, '₩9,900'),
('sentiment-analysis', '소셜 미디어 감성 분석', 'SNS 언급 및 감정 분석', 'advanced-analytics', 'message-circle', 1, '₩11,900'),
('benchmark-comparison', '경쟁 뮤지엄 벤치마크', '타 기관 대비 성과 비교', 'advanced-analytics', 'bar-chart-2', 1, '₩8,900'),
('predictive-maintenance', '시설 예측 유지보수', 'AI 기반 설비 고장 예측', 'advanced-analytics', 'alert-triangle', 1, '₩10,900'),
('roi-calculator', '전시 ROI 계산기', '투자 대비 수익률 분석', 'advanced-analytics', 'calculator', 1, '₩7,900'),
('anomaly-detection', '이상 행동 탐지', '보안·안전 위험 실시간 알림', 'advanced-analytics', 'shield-alert', 1, '₩12,900'),
('cohort-analysis', '재방문 코호트 분석', '방문자 그룹별 재방문율 추적', 'advanced-analytics', 'users-2', 1, '₩8,900'),
('energy-monitoring', '에너지 사용 모니터링', '실시간 전력·수도 사용량', 'advanced-analytics', 'zap', 0, NULL),
('accessibility-metrics', '접근성 지표 대시보드', '장애인 편의시설 이용률', 'advanced-analytics', 'accessibility', 0, NULL),
('queue-analytics', '대기열 분석', '입장 대기 시간 최적화', 'advanced-analytics', 'clock-3', 1, '₩6,900'),
('weather-impact', '날씨 영향 분석', '날씨와 방문객 수 상관관계', 'advanced-analytics', 'cloud-rain', 0, NULL);

-- 🏛️ 뮤지엄 전문 기능 (20개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('artifact-loan-status', '소장품 대출 현황', '외부 기관 대출 작품의 위치와 상태 추적', 'museum-professional', 'package', 0, NULL),
('conservation-workflow', '보존 처리 워크플로우', '작품 보존 프로세스와 담당자 배정', 'museum-professional', 'wrench', 0, NULL),
('digitization-tracker', '디지털화 진행 현황', '소장품 3D 스캔 진척도', 'museum-professional', 'scan', 0, NULL),
('provenance-research', '소장품 출처 조사', '작품 이력 문서화 도구', 'museum-professional', 'search', 1, '₩9,900'),
('condition-reporting', '상태 보고서 생성', '작품 손상도 자동 기록', 'museum-professional', 'file-text', 0, NULL),
('deaccession-workflow', '소장품 폐기 워크플로우', '처분 승인 프로세스 관리', 'museum-professional', 'archive', 0, NULL),
('exhibition-calendar', '전시 캘린더', '전시 일정 통합 관리', 'museum-professional', 'calendar', 0, NULL),
('artwork-insurance', '작품 보험 관리', '보험 만료일 알림', 'museum-professional', 'shield', 1, '₩7,900'),
('catalog-generator', '카탈로그 자동 생성', '전시 도록 PDF 자동화', 'museum-professional', 'book-open', 1, '₩11,900'),
('rights-management', '저작권 관리', '이미지 사용 권한 추적', 'museum-professional', 'copyright', 1, '₩8,900'),
('loan-agreement', '대출 계약서 템플릿', '표준 계약서 자동 생성', 'museum-professional', 'file-signature', 0, NULL),
('curator-notes', '큐레이터 노트', '전시 기획 메모 공유', 'museum-professional', 'sticky-note', 0, NULL),
('collection-inventory', '소장품 재고 조사', '연례 재고조사 체크리스트', 'museum-professional', 'clipboard-list', 0, NULL),
('donor-tracking', '기증자 관리', '기증품 이력 추적', 'museum-professional', 'gift', 1, '₩6,900'),
('exhibition-budget', '전시 예산 관리', '항목별 예산 집행 현황', 'museum-professional', 'dollar-sign', 0, NULL),
('security-log', '보안 일지', '작품 이동 기록', 'museum-professional', 'lock', 0, NULL),
('digital-archive', '디지털 아카이브', '고해상도 이미지 저장소 및 검색', 'museum-professional', 'database', 0, NULL),
('exhibition-planning', '전시 기획 보드', '아이디어 수집부터 실행까지 전 과정 관리', 'museum-professional', 'layout-template', 0, NULL),
('high-value-loans', '고가 소장품 대출 알림', '보험가액 1억원 이상 작품의 대출 일정', 'museum-professional', 'bell-ring', 1, '₩5,900'),
('digitization-progress', '디지털화 진행률', '3D 스캔 및 사진 촬영 완료율', 'museum-professional', 'camera', 0, NULL);

-- 👥 관람객 경험 (15개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('audio-guide-stats', '오디오 가이드 사용 통계', '대여 빈도와 인기 콘텐츠 트래킹', 'visitor-experience', 'headphones', 0, NULL),
('live-satisfaction', '실시간 만족도 조사', '전시 관람 후 즉석 설문 수집', 'visitor-experience', 'smile', 0, NULL),
('virtual-tour', '가상 투어', '온라인 전시 관람', 'visitor-experience', 'monitor', 1, '₩14,900'),
('ar-guide', 'AR 가이드', '증강현실 전시 해설', 'visitor-experience', 'smartphone', 1, '₩19,900'),
('kids-zone', '어린이 체험존', '교육 게임 콘텐츠', 'visitor-experience', 'gamepad-2', 0, NULL),
('membership-rewards', '멤버십 리워드', '방문 포인트 적립', 'visitor-experience', 'award', 0, NULL),
('multilingual-chat', '다국어 챗봇', '20개 언어 지원', 'visitor-experience', 'message-square', 1, '₩12,900'),
('personalized-route', '맞춤형 관람 경로', 'AI 추천 동선', 'visitor-experience', 'route', 1, '₩8,900'),
('photo-spot-map', '포토존 맵', '인스타그램 스팟 안내', 'visitor-experience', 'camera', 0, NULL),
('exhibition-quiz', '전시 퀴즈', '관람 후 퀴즈 참여', 'visitor-experience', 'help-circle', 0, NULL),
('donation-kiosk', '기부 키오스크', '전시 후원 모금', 'visitor-experience', 'hand-heart', 0, NULL),
('wayfinding-system', '실내 내비게이션', '전시실 길찾기', 'visitor-experience', 'navigation', 1, '₩9,900'),
('social-sharing', '소셜 공유', '방문 인증 이벤트', 'visitor-experience', 'share-2', 0, NULL),
('group-booking', '단체 예약 관리', '학교·기업 단체 예약', 'visitor-experience', 'users', 0, NULL),
('lost-found', '분실물 센터', '분실물 신고·조회', 'visitor-experience', 'help-circle', 0, NULL);

-- ⚙️ 운영 & 관리 (15개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('facility-inspection', '시설 점검 체크리스트', '일일 점검 항목과 이슈 보고', 'operations', 'clipboard-check', 0, NULL),
('cctv-monitoring', 'CCTV 모니터링 현황', '카메라 작동 상태와 녹화 용량', 'operations', 'video', 1, '₩5,900'),
('staff-scheduling', '직원 근무 스케줄', '시프트 자동 배정', 'operations', 'calendar-clock', 0, NULL),
('facility-booking', '공간 대관 관리', '대관 일정 조율', 'operations', 'building', 0, NULL),
('vendor-management', '협력업체 관리', '계약 업체 연락처', 'operations', 'truck', 0, NULL),
('incident-reporting', '사고 보고서', '안전사고 기록', 'operations', 'alert-octagon', 0, NULL),
('hvac-control', '공조 시스템 제어', '온·습도 원격 조절', 'operations', 'thermometer', 1, '₩13,900'),
('lighting-schedule', '조명 스케줄', '전시 조명 타이머', 'operations', 'lightbulb', 0, NULL),
('cleaning-checklist', '청소 체크리스트', '일일 청소 점검', 'operations', 'check-square', 0, NULL),
('supply-inventory', '비품 재고 관리', '소모품 발주 알림', 'operations', 'package-2', 0, NULL),
('parking-monitor', '주차장 모니터링', '실시간 주차 현황', 'operations', 'car', 0, NULL),
('fire-alarm-test', '소방 설비 점검', '정기 점검 일정', 'operations', 'flame', 0, NULL),
('mail-tracking', '우편물 추적', '택배·서신 수령 기록', 'operations', 'mail', 0, NULL),
('key-management', '열쇠 관리', '대여·반납 이력', 'operations', 'key', 0, NULL),
('equipment-maintenance', '장비 유지보수 일지', 'A/V 장비 및 조명 정기 점검', 'operations', 'wrench', 0, NULL);

-- 🤝 협업 & 커뮤니케이션 (10개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('project-kanban', '프로젝트 칸반', '업무 진행 상태 보드', 'collaboration', 'trello', 0, NULL),
('document-library', '문서 라이브러리', '공유 파일 저장소', 'collaboration', 'folder', 0, NULL),
('meeting-notes', '회의록', '회의 내용 기록', 'collaboration', 'file-edit', 0, NULL),
('approval-workflow', '결재 워크플로우', '전자 결재 시스템', 'collaboration', 'check-circle-2', 1, '₩8,900'),
('team-chat', '팀 채팅', '부서별 채팅방', 'collaboration', 'messages-square', 0, NULL),
('brainstorming-board', '브레인스토밍 보드', '아이디어 공유 보드', 'collaboration', 'lightbulb-off', 0, NULL),
('task-assignment', '업무 배정', '담당자 지정', 'collaboration', 'user-check', 0, NULL),
('shared-calendar', '공유 캘린더', '부서별 일정 조율', 'collaboration', 'calendar-days', 0, NULL),
('announcement-board', '공지사항', '전체 공지 게시판', 'collaboration', 'megaphone', 0, NULL),
('feedback-system', '피드백 시스템', '동료 평가 및 제안', 'collaboration', 'message-circle-heart', 0, NULL);

-- 💰 재무 & 수익 분석 (10개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, premium, price) VALUES
('monthly-budget', '월별 예산 현황', '부서별 예산 대비 실제 지출 비교', 'financial', 'wallet', 0, NULL),
('budget-alert', '예산 초과 알림', '지출 80% 도달 시 자동 경고', 'financial', 'alert-circle', 0, NULL),
('financial-forecast', '재무 예측', '다음 분기 수익 예측 모델', 'financial', 'trending-up', 1, '₩8,900'),
('ticket-sales', '티켓 판매 현황', '일일 매출 통계', 'financial', 'ticket', 0, NULL),
('gift-shop-pos', '기념품점 POS', '상품 판매 관리', 'financial', 'shopping-cart', 1, '₩15,900'),
('sponsorship-tracking', '후원금 관리', '후원자 기부 내역', 'financial', 'piggy-bank', 0, NULL),
('grant-application', '지원금 신청', '정부 지원금 양식', 'financial', 'file-badge', 0, NULL),
('expense-report', '경비 보고서', '지출 증빙 제출', 'financial', 'receipt', 0, NULL),
('fundraising-campaign', '모금 캠페인', '온라인 모금 진행', 'financial', 'heart-handshake', 1, '₩9,900'),
('tax-filing', '세무 서류', '연말정산 자료', 'financial', 'file-spreadsheet', 0, NULL);

-- Verification query
-- SELECT category, COUNT(*) as count, SUM(premium) as premium_count FROM widgets GROUP BY category ORDER BY category;

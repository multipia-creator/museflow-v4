-- 0010_add_38_widgets.sql
-- 38개의 고급 위젯 추가

-- 데이터 분석 & 시각화 위젯 (5개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('heatmap-chart', '히트맵 차트', '관람객 동선 및 시간대별 밀집도 분석', '데이터 분석', 'fa-th', 8, 6),
  ('radar-chart', '레이더 차트', '박물관 6개 카테고리 종합 비교', '데이터 분석', 'fa-chart-area', 6, 5),
  ('bubble-chart', '버블 차트', '전시 성과 3차원 분석 (방문자×예산×만족도)', '데이터 분석', 'fa-circle', 8, 6),
  ('gantt-chart', '간트 차트', '전시 일정 및 프로젝트 타임라인 관리', '데이터 분석', 'fa-calendar-check', 12, 6),
  ('geo-map', '지오맵', '관람객 지역 분포 및 해외 대여 현황', '데이터 분석', 'fa-globe', 8, 6);

-- 데이터 분석 & 시각화 위젯 (추가 1개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('wordcloud', '워드 클라우드', '관람객 피드백 키워드 감정 분석', '데이터 분석', 'fa-comment-dots', 6, 4);

-- 박물관 전문 위젯 (6개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('exhibition-status', '전시 상태 보드', '전시별 상태 칸반 보드 (기획중/준비중/전시중/철거중/완료)', '박물관 전문', 'fa-image', 8, 5),
  ('collection-search', '소장품 검색', '빠른 소장품 검색 및 상세 정보 조회', '박물관 전문', 'fa-search', 6, 4),
  ('conservation-monitor', '보존 모니터', '온습도/조도 실시간 모니터링 및 경고', '박물관 전문', 'fa-temperature-half', 6, 4),
  ('loan-tracker', '대여 추적기', '소장품 대여/대출 현황 및 반납 D-day', '박물관 전문', 'fa-exchange-alt', 6, 5),
  ('exhibition-calendar', '전시 캘린더', '월간 전시 일정 캘린더 (월/주/일 뷰)', '박물관 전문', 'fa-calendar-alt', 8, 6),
  ('visitor-profile', '방문객 프로필', '연령대/성별/관심사 분석', '박물관 전문', 'fa-user-friends', 6, 5);

-- 알림 & 작업 관리 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('priority-matrix', '우선순위 매트릭스', '중요도×긴급도 4분면 작업 관리', '알림 & 작업', 'fa-th-large', 8, 6),
  ('approval-queue', '승인 대기 큐', '예산/계약/디자인 승인 대기 목록', '알림 & 작업', 'fa-check-square', 6, 5),
  ('deadline-timer', '데드라인 타이머', '마감 임박 작업 카운트다운 D-day', '알림 & 작업', 'fa-hourglass-half', 4, 3),
  ('activity-feed', '팀 활동 피드', '팀원 최근 활동 로그 실시간 업데이트', '알림 & 작업', 'fa-stream', 6, 8);

-- AI & 스마트 기능 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('ai-recommendations', 'AI 추천 엔진', '머신러닝 기반 다음 전시 주제/소장품 추천', 'AI 기능', 'fa-magic', 6, 5),
  ('smart-insights', '스마트 인사이트', '데이터 기반 자동 분석 및 전략 제안', 'AI 기능', 'fa-lightbulb', 6, 4),
  ('sentiment-analysis', '감성 분석', 'SNS 멘션 긍정/중립/부정 감정 분석', 'AI 기능', 'fa-smile', 6, 5),
  ('image-recognition', '이미지 인식', '소장품 사진 업로드 AI 자동 태깅', 'AI 기능', 'fa-camera', 6, 6);

-- 재무 & 예산 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('budget-comparison', '예산 비교', '계획 vs 실제 지출 비교 분석', '재무 관리', 'fa-balance-scale', 8, 5),
  ('revenue-analysis', '수익 분석', '입장권/굿즈/후원 수익 분석', '재무 관리', 'fa-dollar-sign', 6, 5),
  ('roi-calculator', 'ROI 계산기', '전시 투자 대비 효과 실시간 계산', '재무 관리', 'fa-calculator', 4, 4),
  ('donor-management', '후원자 관리', '주요 후원자 목록 및 기부 내역 관리', '재무 관리', 'fa-hand-holding-usd', 6, 6);

-- 통합 & 연동 위젯 (5개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('workspace-microsoft', 'Microsoft 365', 'Outlook/OneDrive/Teams 통합', '통합', 'fab fa-microsoft', 6, 5),
  ('slack-notifications', 'Slack 알림', '중요 알림 Slack 채널 연동', '통합', 'fab fa-slack', 6, 4),
  ('social-media', 'SNS 통합', 'Instagram/Facebook/Twitter 통합 관리', '통합', 'fa-share-alt', 6, 6),
  ('qr-generator', 'QR 코드 생성', '전시/소장품 QR 코드 생성기', '통합', 'fa-qrcode', 4, 4),
  ('weather-widget', '날씨', '박물관 위치 날씨 및 관람 추천 지수', '통합', 'fa-cloud-sun', 4, 3);

-- 미디어 & 콘텐츠 위젯 (5개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('image-gallery', '이미지 갤러리', '전시/행사 사진 슬라이드쇼', '미디어', 'fa-images', 8, 6),
  ('video-player', '비디오 플레이어', '홍보 영상 YouTube/Vimeo 재생', '미디어', 'fa-video', 8, 5),
  ('document-viewer', '문서 뷰어', 'PDF 보고서 빠른 보기', '미디어', 'fa-file-pdf', 6, 8),
  ('notepad', '메모 패드', '빠른 메모 작성 Markdown 지원', '미디어', 'fa-sticky-note', 4, 4),
  ('rss-feed', 'RSS 피드', '미술계 뉴스 피드', '미디어', 'fa-rss', 6, 6);

-- 시스템 & 유틸리티 위젯 (4개)
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('system-monitor', '시스템 모니터', 'CPU/메모리/스토리지 사용률 모니터링', '유틸리티', 'fa-server', 6, 4),
  ('quick-launcher', '바로가기 런처', '자주 쓰는 페이지/앱 바로가기', '유틸리티', 'fa-rocket', 6, 4),
  ('clock-timer', '시계 & 타이머', '세계시계/타이머/스톱워치', '유틸리티', 'fa-clock', 4, 3),
  ('calculator', '계산기', '빠른 계산 (과학 계산기 모드)', '유틸리티', 'fa-calculator', 4, 5);

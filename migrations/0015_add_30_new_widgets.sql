-- 0015_add_30_new_widgets.sql
-- 29개 신규 위젯 추가 (박물관 전문 기능 강화)
-- staff-attendance는 이미 employee-attendance로 존재하므로 제외

-- 🎨 고급 분석 & 인사이트 (7개 - 프리미엄)
INSERT INTO widgets (type, name, description, category, icon, version, min_width, min_height, default_width, default_height, is_premium, price, free_trial_days, is_active)
VALUES
  ('visitor-dwell-time', '관람객 체류 시간 분석', '전시실별 평균 체류 시간과 인기 전시물 패턴 분석', '전시', 'fa-clock', '1.0.0', 4, 4, 8, 6, 1, 7900, 7, 1),
  ('exhibition-effectiveness', '전시 효과성 대시보드', '관람객 피드백, QR 스캔율, 오디오 가이드 사용률 종합', '전시', 'fa-chart-line', '1.0.0', 6, 4, 10, 6, 1, 7900, 7, 1),
  ('collection-value-trends', '컬렉션 가치 추세', '소장품 감정가 변동과 시장 가치 트렌드', '수집', 'fa-gem', '1.0.0', 4, 4, 8, 5, 1, 9900, 7, 1),
  ('visitor-journey-map', '관람객 여정 맵', '입장부터 퇴장까지 동선과 주요 체류 지점 히트맵', '전시', 'fa-route', '1.0.0', 6, 4, 10, 6, 1, 9900, 7, 1),
  ('curator-performance', '큐레이터 성과 분석', '전시별 관람객 반응과 교육 프로그램 참여율', '연구', 'fa-user-tie', '1.0.0', 4, 4, 8, 5, 1, 7900, 7, 1),
  ('collection-diversity', '컬렉션 다양성 지표', '시대별/지역별/장르별 소장품 분포 분석', '수집', 'fa-palette', '1.0.0', 4, 4, 8, 5, 1, 7900, 7, 1),
  ('predictive-visitors', '예측 관람객 수', 'AI 기반 방문자 예측 및 최적 인력 배치 제안', '행정', 'fa-brain', '1.0.0', 4, 4, 8, 5, 1, 9900, 7, 1),

-- 🏛️ 박물관 전문 기능 (6개)
  ('artifact-loan-status', '소장품 대출 현황', '대출 중인 작품 목록과 반납 예정일 알림', '수집', 'fa-handshake', '1.0.0', 4, 4, 6, 5, 0, 0, 0, 1),
  ('conservation-workflow', '보존 처리 워크플로우', '처리 대기 목록과 진행 단계별 현황', '보존', 'fa-tools', '1.0.0', 4, 4, 6, 6, 0, 0, 0, 1),
  ('exhibition-rotation', '전시 교체 타임라인', '현재/예정 전시 일정과 작품 이동 계획', '전시', 'fa-calendar-alt', '1.0.0', 4, 4, 8, 5, 0, 0, 0, 1),
  ('catalog-management', '도록/카탈로그 관리', '출판물 재고 현황과 판매 통계', '출판', 'fa-book', '1.0.0', 4, 3, 6, 4, 0, 0, 0, 1),
  ('curator-notes', '큐레이터 노트', '전시 기획 메모와 작품 연구 노트', '연구', 'fa-sticky-note', '1.0.0', 4, 4, 6, 6, 1, 4900, 7, 1),
  ('vr-ar-content', 'VR/AR 콘텐츠 현황', '디지털 전시 현황과 인터랙티브 콘텐츠', '전시', 'fa-vr-cardboard', '1.0.0', 4, 3, 6, 4, 1, 5900, 7, 1),

-- 👥 관람객 경험 (5개)
  ('live-satisfaction', '실시간 만족도 조사', 'QR 피드백 수집과 긍정/부정 비율', '교육', 'fa-smile', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1),
  ('audio-guide-usage', '오디오 가이드 사용 통계', '언어별 사용률과 인기 트랙 순위', '교육', 'fa-headphones', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1),
  ('multilingual-guide', '다국어 안내 현황', '언어별 콘텐츠 현황과 번역 진행률', '교육', 'fa-language', '1.0.0', 4, 3, 6, 4, 1, 3900, 7, 1),
  ('accessibility-services', '접근성 서비스', '휠체어 대여, 점자 가이드북, 수화 통역 일정', '교육', 'fa-universal-access', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1),
  ('kids-program', '어린이 프로그램 참여', '교육 프로그램 예약과 연령별 참여율', '교육', 'fa-child', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1),

-- 💼 운영 & 관리 (5개)
  ('facility-inspection', '시설 점검 체크리스트', '일일 점검 항목과 이슈 보고', '시설', 'fa-clipboard-check', '1.0.0', 3, 4, 6, 5, 0, 0, 0, 1),
  ('energy-monitor', '전력 사용량 모니터', '실시간 전력 소비와 구역별 사용량', '시설', 'fa-bolt', '1.0.0', 4, 3, 6, 4, 1, 4900, 7, 1),
  ('cctv-monitoring', 'CCTV 모니터링 현황', '카메라 작동 상태와 녹화 용량', '시설', 'fa-video', '1.0.0', 4, 3, 6, 4, 1, 5900, 7, 1),
  ('hvac-monitor', '공조 시스템 모니터', '온도/습도 실시간 모니터링과 환경 제어', '보존', 'fa-temperature-high', '1.0.0', 4, 4, 6, 5, 1, 5900, 7, 1),
  ('emergency-checklist', '재해 대응 체크리스트', '화재/지진 대응 절차와 대피 경로', '시설', 'fa-exclamation-triangle', '1.0.0', 3, 4, 6, 5, 0, 0, 0, 1),

-- 🤝 협업 & 커뮤니케이션 (3개)
  ('team-messenger', '팀 메신저', '실시간 채팅과 부서별 채널', '행정', 'fa-comments', '1.0.0', 4, 6, 6, 8, 0, 0, 0, 1),
  ('meeting-minutes', '회의록 아카이브', '회의 기록 저장과 결정 사항 추적', '행정', 'fa-file-alt', '1.0.0', 4, 4, 6, 6, 0, 0, 0, 1),
  ('kanban-board', '프로젝트 칸반 보드', 'To-Do/In Progress/Done 업무 관리', '행정', 'fa-trello', '1.0.0', 6, 6, 8, 10, 1, 4900, 7, 1),

-- 📈 재무 & 수익 (3개)
  ('donor-dashboard', '기부자 관리 대시보드', '기부 이력 추적과 VIP 후원자 관리', '행정', 'fa-hand-holding-usd', '1.0.0', 4, 4, 8, 6, 1, 4900, 7, 1),
  ('museum-shop-sales', '굿즈 판매 현황', '상품별 매출과 재고 수준 알림', '행정', 'fa-shopping-cart', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1),
  ('membership-renewal', '멤버십 갱신 알림', '갱신 예정 회원과 자동 리마인더', '행정', 'fa-id-card', '1.0.0', 3, 3, 6, 4, 0, 0, 0, 1);

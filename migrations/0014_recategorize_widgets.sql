-- 0014_recategorize_widgets.sql
-- 기존 위젯 카테고리 재분류 (박물관 업무 중심)

-- 🎨 전시 (Exhibition) - 전시 기획, 운영, 평가
UPDATE widgets SET category = '전시' WHERE type IN (
  'stat-card-exhibition',
  'exhibition-status',
  'exhibition-review-monitor',
  'visitor-chart',
  'visitor-flow',
  'booking-status'
);

-- 📚 교육 (Education) - 교육 프로그램, 도슨트, 관람객 경험
UPDATE widgets SET category = '교육' WHERE type IN (
  'stat-card-education',
  'education-schedule',
  'docent-schedule'
);

-- 🏺 수집 (Collection) - 소장품 관리, 취득, 대출
UPDATE widgets SET category = '수집' WHERE type IN (
  'stat-card-collection',
  'collection-search',
  'collection-grid'
);

-- 🔬 보존 (Conservation) - 보존 처리, 환경 관리
UPDATE widgets SET category = '보존' WHERE type IN (
  'stat-card-conservation',
  'conservation-status'
);

-- 📖 출판 (Publishing) - 도록, 연구 출판물
UPDATE widgets SET category = '출판' WHERE type IN (
  'stat-card-publication'
);

-- 🔍 연구 (Research) - 학예 연구, 큐레이팅
UPDATE widgets SET category = '연구' WHERE type IN (
  'stat-card-research'
);

-- 💼 행정 (Administration) - 재무, 인사, 운영 관리
UPDATE widgets SET category = '행정' WHERE type IN (
  'budget-chart',
  'budget-comparison',
  'roi-calculator',
  'revenue-analysis',
  'donor-management',
  'financial-forecasting',
  'employee-attendance',
  'meeting-room-booking',
  'internal-communication',
  'document-collaboration',
  'email-campaign',
  'social-engagement',
  'media-monitor',
  'ticket-sales'
);

-- 🏢 시설 (Facilities) - 건물 관리, 안전, 에너지
UPDATE widgets SET category = '시설' WHERE type IN (
  'security-system',
  'energy-usage',
  'rental-schedule'
);

-- 📊 데이터 분석 (Analytics) - 범용 차트 및 분석 도구
UPDATE widgets SET category = '데이터 분석' WHERE type IN (
  'line-chart',
  'bar-chart',
  'donut-chart',
  'heatmap-chart',
  'radar-chart',
  'bubble-chart',
  'gantt-chart',
  'geo-map',
  'wordcloud'
);

-- 🤖 AI 기능 (AI Features) - AI/ML 기반 기능
UPDATE widgets SET category = 'AI 기능' WHERE type IN (
  'ai-search',
  'ai-recommendations',
  'smart-insights',
  'sentiment-analysis',
  'image-recognition'
);

-- 🔗 통합 (Integrations) - 외부 서비스 연동
UPDATE widgets SET category = '통합' WHERE type IN (
  'workspace-microsoft',
  'slack-notifications',
  'social-media',
  'api-integration',
  'zapier-automation',
  'google-workspace'
);

-- 📱 미디어 (Media) - 멀티미디어 콘텐츠
UPDATE widgets SET category = '미디어' WHERE type IN (
  'video-player',
  'image-gallery',
  'document-viewer',
  'rss-feed'
);

-- 🛠️ 유틸리티 (Utilities) - 범용 도구
UPDATE widgets SET category = '유틸리티' WHERE type IN (
  'notepad',
  'calendar',
  'clock',
  'weather'
);

-- 🔔 알림 & 작업 (Notifications & Tasks) - 알림 및 작업 관리
UPDATE widgets SET category = '알림 & 작업' WHERE type IN (
  'notifications',
  'tasks',
  'quick-actions',
  'recent-activities',
  'urgent-alerts',
  'deadline-tracker',
  'approval-requests'
);

-- 카테고리 메타데이터 테이블 생성
CREATE TABLE IF NOT EXISTS widget_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 데이터 삽입
INSERT OR REPLACE INTO widget_categories (code, name_ko, name_en, description, icon, color, sort_order)
VALUES
  ('exhibition', '전시', 'Exhibition', '전시 기획, 운영, 평가', 'fa-palette', '#8B5CF6', 1),
  ('education', '교육', 'Education', '교육 프로그램, 도슨트, 관람객 경험', 'fa-graduation-cap', '#10B981', 2),
  ('collection', '수집', 'Collection', '소장품 관리, 취득, 대출', 'fa-archive', '#F59E0B', 3),
  ('conservation', '보존', 'Conservation', '보존 처리, 환경 관리', 'fa-shield-alt', '#06B6D4', 4),
  ('publishing', '출판', 'Publishing', '도록, 연구 출판물', 'fa-book-open', '#EF4444', 5),
  ('research', '연구', 'Research', '학예 연구, 큐레이팅', 'fa-microscope', '#6366F1', 6),
  ('administration', '행정', 'Administration', '재무, 인사, 운영 관리', 'fa-building', '#EC4899', 7),
  ('facilities', '시설', 'Facilities', '건물 관리, 안전, 에너지', 'fa-wrench', '#84CC16', 8),
  ('analytics', '데이터 분석', 'Analytics', '범용 차트 및 분석 도구', 'fa-chart-bar', '#3B82F6', 9),
  ('ai', 'AI 기능', 'AI Features', 'AI/ML 기반 기능', 'fa-robot', '#A855F7', 10),
  ('integrations', '통합', 'Integrations', '외부 서비스 연동', 'fa-plug', '#14B8A6', 11),
  ('media', '미디어', 'Media', '멀티미디어 콘텐츠', 'fa-photo-video', '#F97316', 12),
  ('utilities', '유틸리티', 'Utilities', '범용 도구', 'fa-toolbox', '#64748B', 13),
  ('notifications', '알림 & 작업', 'Notifications & Tasks', '알림 및 작업 관리', 'fa-bell', '#EAB308', 14);

-- 통계 뷰 생성
CREATE VIEW IF NOT EXISTS widget_stats_by_category AS
SELECT 
  w.category,
  COUNT(*) as total_widgets,
  SUM(CASE WHEN w.is_premium = 0 THEN 1 ELSE 0 END) as free_widgets,
  SUM(CASE WHEN w.is_premium = 1 THEN 1 ELSE 0 END) as premium_widgets,
  AVG(w.price) as avg_price
FROM widgets w
WHERE w.is_active = 1
GROUP BY w.category
ORDER BY total_widgets DESC;

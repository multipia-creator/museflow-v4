-- ===================================================================
-- MuseFlow Widgets System Database Schema
-- Customizable Dashboard with Widget Management
-- ===================================================================

-- 1. 위젯 마스터 테이블 (전체 위젯 카탈로그)
CREATE TABLE IF NOT EXISTS widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  version TEXT DEFAULT '1.0.0',
  min_width INTEGER DEFAULT 2,
  min_height INTEGER DEFAULT 2,
  default_width INTEGER DEFAULT 4,
  default_height INTEGER DEFAULT 4,
  max_width INTEGER DEFAULT 12,
  max_height INTEGER DEFAULT 12,
  default_config TEXT,
  permissions TEXT,
  popularity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 사용자 위젯 (사용자별 위젯 인스턴스)
CREATE TABLE IF NOT EXISTS user_widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  widget_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (widget_id) REFERENCES widgets(id)
);

-- 3. 위젯 설정 및 레이아웃
CREATE TABLE IF NOT EXISTS widget_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_widget_id INTEGER UNIQUE NOT NULL,
  config TEXT,
  layout_x INTEGER NOT NULL,
  layout_y INTEGER NOT NULL,
  layout_w INTEGER NOT NULL,
  layout_h INTEGER NOT NULL,
  state TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_widget_id) REFERENCES user_widgets(id)
);

-- 4. 레이아웃 프리셋
CREATE TABLE IF NOT EXISTS layout_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  config TEXT NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 5. 위젯 데이터 캐시
CREATE TABLE IF NOT EXISTS widget_data_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_widget_id INTEGER NOT NULL,
  data TEXT NOT NULL,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_widget_id) REFERENCES user_widgets(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_deleted ON user_widgets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_widget_configs_user_widget ON widget_configs(user_widget_id);

-- 기본 위젯 데이터 삽입
INSERT OR IGNORE INTO widgets (type, name, description, category, icon, default_width, default_height) VALUES
  ('stat-card-exhibition', '전시 통계', '활성 전시 수 및 진행률', '데이터 분석', 'fa-image', 2, 3),
  ('stat-card-education', '교육 통계', '교육 프로그램 현황', '데이터 분석', 'fa-graduation-cap', 2, 3),
  ('stat-card-collection', '수집 통계', '소장품 등록 및 관리', '데이터 분석', 'fa-folder-plus', 2, 3),
  ('stat-card-conservation', '보존 통계', '보존 처리 현황', '데이터 분석', 'fa-shield-alt', 2, 3),
  ('stat-card-publication', '출판 통계', '출판물 발행 현황', '데이터 분석', 'fa-book', 2, 3),
  ('stat-card-research', '연구 통계', '연구 프로젝트 진행', '데이터 분석', 'fa-microscope', 2, 3),
  ('line-chart', '라인 차트', '시간별 추세 시각화', '데이터 분석', 'fa-chart-line', 6, 5),
  ('donut-chart', '도넛 차트', '비율 시각화', '데이터 분석', 'fa-chart-pie', 4, 5),
  ('bar-chart', '막대 차트', '항목별 비교', '데이터 분석', 'fa-chart-bar', 6, 5),
  ('timeline', '타임라인', '작업 진행 상황', '알림 & 작업', 'fa-clock', 6, 5),
  ('todo-list', '할 일 목록', '체크리스트 작업 관리', '알림 & 작업', 'fa-tasks', 6, 6),
  ('alert-list', '중요 알림', '우선순위 알림', '알림 & 작업', 'fa-bell', 6, 4),
  ('ai-search', 'AI 검색', '음성 및 텍스트 검색', '도구', 'fa-sparkles', 12, 2),
  ('workspace-google', 'Google Workspace', 'Gmail, Drive, Calendar 통합', '통합', 'fab fa-google', 6, 5),
  ('budget-chart', '예산 차트', '예산 사용 현황', '데이터 분석', 'fa-wallet', 6, 5),
  ('visitor-chart', '관람객 차트', '방문자 증가율', '데이터 분석', 'fa-users', 6, 5);

-- 레이아웃 프리셋 데이터
INSERT OR IGNORE INTO layout_presets (id, name, description, config, category) VALUES
  ('default', '기본 레이아웃', '균형 잡힌 종합 대시보드', '[]', '기본'),
  ('analytics', '분석 중심', '데이터 시각화 우선', '[]', '분석'),
  ('tasks', '작업 중심', '할 일 및 알림 우선', '[]', '작업'),
  ('curator', '큐레이터 전용', '전시 및 소장품 관리', '[]', '특화');

-- 0012_add_widget_pricing.sql
-- 위젯 무료/유료 구분 기능 추가

-- 1. widgets 테이블에 가격 관련 컬럼 추가
ALTER TABLE widgets ADD COLUMN is_premium INTEGER DEFAULT 0;
ALTER TABLE widgets ADD COLUMN price INTEGER DEFAULT 0;
ALTER TABLE widgets ADD COLUMN free_trial_days INTEGER DEFAULT 0;

-- 2. 현재 전체 무료 이벤트 설정 (모든 위젯을 무료로 설정)
UPDATE widgets SET is_premium = 0, price = 0, free_trial_days = 0;

-- 3. 프리미엄 위젯 정의 (현재는 주석 처리 - 무료 이벤트 중)
-- 추후 유료 전환 시 아래 주석을 해제하여 적용

-- AI & 스마트 기능 위젯 (프리미엄)
-- UPDATE widgets SET is_premium = 1, price = 9900, free_trial_days = 7 
-- WHERE type IN ('ai-recommendations', 'smart-insights', 'sentiment-analysis', 'image-recognition');

-- 고급 분석 위젯 (프리미엄)
-- UPDATE widgets SET is_premium = 1, price = 7900, free_trial_days = 7
-- WHERE type IN ('heatmap-chart', 'radar-chart', 'bubble-chart', 'gantt-chart', 'geo-map', 'wordcloud');

-- 통합 & 연동 위젯 (프리미엄)
-- UPDATE widgets SET is_premium = 1, price = 5900, free_trial_days = 7
-- WHERE type IN ('workspace-microsoft', 'slack-notifications', 'social-media', 'api-integration', 'zapier-automation');

-- ROI & 재무 고급 기능 (프리미엄)
-- UPDATE widgets SET is_premium = 1, price = 4900, free_trial_days = 7
-- WHERE type IN ('roi-calculator', 'budget-comparison', 'revenue-analysis', 'donor-management');

-- 4. 위젯 카탈로그 뷰 생성 (무료/유료 구분 표시)
CREATE VIEW IF NOT EXISTS widget_catalog AS
SELECT 
  w.id,
  w.type,
  w.name,
  w.description,
  w.category,
  w.icon,
  w.is_premium,
  w.price,
  w.free_trial_days,
  w.default_width,
  w.default_height,
  CASE 
    WHEN w.is_premium = 0 THEN 'FREE'
    WHEN w.free_trial_days > 0 THEN 'TRIAL_AVAILABLE'
    ELSE 'PREMIUM'
  END as pricing_tier,
  CASE
    WHEN w.is_premium = 1 AND w.free_trial_days > 0 THEN '₩' || w.price || '/월 (' || w.free_trial_days || '일 무료 체험)'
    WHEN w.is_premium = 1 THEN '₩' || w.price || '/월'
    ELSE '무료'
  END as pricing_label
FROM widgets w
WHERE w.is_active = 1
ORDER BY w.is_premium ASC, w.category, w.name;

-- 5. 무료 이벤트 메타데이터
CREATE TABLE IF NOT EXISTS pricing_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  discount_percent INTEGER DEFAULT 0,
  is_free_event INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 현재 전체 무료 이벤트 등록
INSERT INTO pricing_events (event_name, description, start_date, end_date, is_free_event, is_active)
VALUES (
  '그랜드 오픈 기념 전체 무료',
  '서비스 오픈 기념 모든 프리미엄 위젯 무료 제공',
  CURRENT_TIMESTAMP,
  NULL,  -- 종료일 미정 (무제한)
  1,
  1
);

-- 6. 사용자 위젯 구독 테이블
CREATE TABLE IF NOT EXISTS user_widget_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  widget_id INTEGER NOT NULL,
  subscription_type TEXT DEFAULT 'free',  -- 'free', 'trial', 'paid'
  trial_start_date DATETIME,
  trial_end_date DATETIME,
  subscription_start_date DATETIME,
  subscription_end_date DATETIME,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (widget_id) REFERENCES widgets(id)
);

-- 7. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_widgets_premium ON widgets(is_premium, is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions ON user_widget_subscriptions(user_id, widget_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_events_active ON pricing_events(is_active, start_date, end_date);

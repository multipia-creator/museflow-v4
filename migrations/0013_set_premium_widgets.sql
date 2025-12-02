-- 0013_set_premium_widgets.sql
-- 프리미엄 위젯 설정 (현재는 무료 이벤트로 제공)

-- AI & 스마트 기능 위젯 (프리미엄 ₩9,900/월)
UPDATE widgets SET is_premium = 1, price = 9900, free_trial_days = 7 
WHERE type IN (
  'ai-recommendations',
  'smart-insights',
  'sentiment-analysis',
  'image-recognition',
  'ai-chatbot'
);

-- 고급 분석 위젯 (프리미엄 ₩7,900/월)
UPDATE widgets SET is_premium = 1, price = 7900, free_trial_days = 7
WHERE type IN (
  'heatmap-chart',
  'radar-chart',
  'bubble-chart',
  'gantt-chart',
  'geo-map',
  'wordcloud',
  'visitor-flow-analysis',
  'exhibition-review-monitor'
);

-- 통합 & 연동 위젯 (프리미엄 ₩5,900/월)
UPDATE widgets SET is_premium = 1, price = 5900, free_trial_days = 7
WHERE type IN (
  'workspace-microsoft',
  'slack-notifications',
  'social-media',
  'api-integration',
  'zapier-automation',
  'google-workspace'
);

-- ROI & 재무 고급 기능 (프리미엄 ₩4,900/월)
UPDATE widgets SET is_premium = 1, price = 4900, free_trial_days = 7
WHERE type IN (
  'roi-calculator',
  'budget-comparison',
  'revenue-analysis',
  'donor-management',
  'financial-forecasting'
);

-- 특별 기능 위젯 (프리미엄 ₩3,900/월)
UPDATE widgets SET is_premium = 1, price = 3900, free_trial_days = 7
WHERE type IN (
  'video-analytics',
  'video-conference-scheduler',
  'document-collaboration',
  'advanced-search',
  'automated-reports'
);

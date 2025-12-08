# 위젯 미리보기 + AI 추천 시스템
**Date**: 2025-12-08  
**Features**: Hover Preview + AI-Powered Recommendations

---

## 📋 Part 1: 위젯 미리보기 (Hover Preview)

### 🎯 목표
Figma처럼 위젯에 마우스를 올리면 즉시 미리보기를 표시하여 선택 전에 내용 확인 가능

### 🎨 UI 설계

#### 미리보기 팝업 구조
```
마우스 위치 → 위젯 항목 Hover
                ↓
        ┌─────────────────────────┐
        │  Widget Name       [×]  │ ← Header
        ├─────────────────────────┤
        │  📊                     │
        │  [Preview Image]        │ ← 위젯 스크린샷/썸네일
        │  or Icon                │
        ├─────────────────────────┤
        │  Category: Analytics    │
        │  Type: Dashboard        │ ← Metadata
        │  Premium: Yes           │
        ├─────────────────────────┤
        │  "실시간 방문자 분석..."  │ ← Description
        └─────────────────────────┘
          320px × auto
```

### 🔧 기술 구현

#### 1. 위젯 데이터 확장
```javascript
const widgetData = {
  id: 'analytics-dashboard',
  name: 'Visitor Analytics Dashboard',
  category: 'Analytics',
  icon: 'bar-chart',
  premium: true,
  
  // Preview 추가 데이터
  preview: {
    thumbnail: '/static/images/widgets/analytics-dashboard-preview.png',
    description: '실시간 방문자 분석, 행동 패턴 추적, 전환율 모니터링',
    features: ['실시간 데이터', '커스터마이징', 'CSV 내보내기'],
    tags: ['analytics', 'dashboard', 'realtime']
  }
};
```

#### 2. Hover 트리거 시스템
```javascript
class WidgetPreview {
  constructor() {
    this.tooltip = null;
    this.hoverTimer = null;
    this.HOVER_DELAY = 500; // 0.5초 후 표시
  }
  
  onMouseEnter(widgetElement, widgetData) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      this.show(widgetElement, widgetData);
    }, this.HOVER_DELAY);
  }
  
  onMouseLeave() {
    clearTimeout(this.hoverTimer);
    this.hide();
  }
  
  show(targetElement, data) {
    // Create tooltip
    // Position near cursor (smart positioning)
    // Fade in animation
  }
}
```

#### 3. 스마트 포지셔닝
```javascript
function calculatePosition(targetRect, tooltipWidth, tooltipHeight) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let x = targetRect.right + 10; // 오른쪽 우선
  let y = targetRect.top;
  
  // 오른쪽 공간 부족 시 왼쪽으로
  if (x + tooltipWidth > viewportWidth) {
    x = targetRect.left - tooltipWidth - 10;
  }
  
  // 아래쪽 공간 부족 시 조정
  if (y + tooltipHeight > viewportHeight) {
    y = viewportHeight - tooltipHeight - 20;
  }
  
  return { x, y };
}
```

---

## 📋 Part 2: AI 위젯 추천 (Smart Recommendations)

### 🎯 목표
사용자의 작업 패턴을 학습하여 적절한 위젯을 자동 추천

### 🧠 AI 추천 알고리즘

#### 1. 데이터 수집 (Usage Tracking)
```javascript
const usageData = {
  // 사용 빈도
  frequency: {
    'analytics-dashboard': 15,
    'museum-metrics': 8,
    'budget-tracker': 3
  },
  
  // 함께 사용된 위젯 (Co-occurrence)
  coUsage: {
    'analytics-dashboard': ['museum-metrics', 'visitor-map'],
    'museum-metrics': ['analytics-dashboard', 'budget-tracker']
  },
  
  // 시간대별 사용 패턴
  timePattern: {
    'morning': ['analytics-dashboard'],
    'afternoon': ['budget-tracker'],
    'evening': ['museum-metrics']
  },
  
  // 카테고리 선호도
  categoryPreference: {
    'Analytics': 0.65,
    'Museum': 0.25,
    'Budget': 0.10
  }
};
```

#### 2. 추천 점수 계산
```javascript
function calculateRecommendationScore(widget, context) {
  let score = 0;
  
  // 1. 빈도 점수 (40%)
  const frequencyScore = usageData.frequency[widget.id] || 0;
  score += (frequencyScore / maxFrequency) * 0.4;
  
  // 2. 함께 사용 점수 (30%)
  const recentlyUsed = getRecentWidgets(5);
  const coUsageScore = recentlyUsed.reduce((sum, recent) => {
    const coWidgets = usageData.coUsage[recent.id] || [];
    return sum + (coWidgets.includes(widget.id) ? 1 : 0);
  }, 0);
  score += (coUsageScore / recentlyUsed.length) * 0.3;
  
  // 3. 카테고리 선호도 (20%)
  const categoryScore = usageData.categoryPreference[widget.category] || 0;
  score += categoryScore * 0.2;
  
  // 4. 시간대 패턴 (10%)
  const currentTime = getCurrentTimeSlot(); // 'morning', 'afternoon', 'evening'
  const timeWidgets = usageData.timePattern[currentTime] || [];
  const timeScore = timeWidgets.includes(widget.id) ? 1 : 0;
  score += timeScore * 0.1;
  
  return score;
}
```

#### 3. 추천 로직
```javascript
function getRecommendations(limit = 5) {
  const allWidgets = getAllWidgets();
  const recentWidgets = getRecentWidgets(5).map(w => w.id);
  
  // 최근 사용한 위젯 제외
  const candidates = allWidgets.filter(w => !recentWidgets.includes(w.id));
  
  // 점수 계산 및 정렬
  const scored = candidates.map(widget => ({
    widget,
    score: calculateRecommendationScore(widget, {})
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit).map(item => item.widget);
}
```

### 🎨 UI 표시

#### Command Palette에 추천 섹션 추가
```
┌────────────────────────────────────────┐
│ 🔍 위젯 검색...                  [×]  │
├────────────────────────────────────────┤
│ ✨ AI 추천 (5)                         │ ← NEW!
│  🤖 [Analytics Dashboard] 85% 매칭     │
│  🤖 [Museum Metrics] 72% 매칭          │
│  ...                                   │
├────────────────────────────────────────┤
│ ⭐ 즐겨찾기 (3)                        │
│  [Interactive Map] [Budget] ...        │
├────────────────────────────────────────┤
│ 🕒 최근 사용 (5)                       │
│  ...                                   │
└────────────────────────────────────────┘
```

### 📊 학습 데이터 저장

#### LocalStorage 구조
```javascript
{
  "widget_usage_data": {
    "frequency": { ... },
    "coUsage": { ... },
    "timePattern": { ... },
    "categoryPreference": { ... },
    "lastUpdated": 1733652000
  }
}
```

---

## 🚀 구현 우선순위

### Phase 1: 미리보기 (즉시 구현)
1. ✅ WidgetPreview 클래스 생성
2. ✅ Hover 이벤트 바인딩
3. ✅ 툴팁 UI 렌더링
4. ✅ 스마트 포지셔닝
5. ✅ 페이드 인/아웃 애니메이션

### Phase 2: AI 추천 (즉시 구현)
1. ✅ 사용 데이터 트래킹
2. ✅ 추천 점수 알고리즘
3. ✅ Command Palette 통합
4. ✅ LocalStorage 데이터 관리
5. ✅ 추천 이유 표시 ("함께 사용됨", "자주 사용됨" 등)

---

## 📈 예상 효과

### 미리보기 시스템
- **선택 정확도**: +60% (잘못된 위젯 선택 감소)
- **탐색 시간**: -40% (설명 읽고 확인)
- **사용자 만족도**: +50% (직관적 탐색)

### AI 추천 시스템
- **위젯 발견**: +80% (잘 안 쓰던 유용한 위젯 발견)
- **작업 속도**: +35% (다음 필요 위젯 미리 제시)
- **개인화**: +100% (사용 패턴 학습)

---

## 🎯 성공 지표

### 미리보기
- ✅ Hover 응답 시간 < 500ms
- ✅ 툴팁 렌더링 < 100ms
- ✅ 스마트 포지셔닝 100% 화면 내 표시
- ✅ 이미지 로딩 < 1초

### AI 추천
- ✅ 추천 정확도 > 70% (클릭률 기준)
- ✅ 추천 갱신 < 50ms
- ✅ 학습 데이터 크기 < 100KB
- ✅ 추천 이유 명확성 100%

---

## 🔧 기술 스택

### 미리보기
- Vanilla JS (no dependencies)
- CSS transforms (smooth positioning)
- Intersection Observer (viewport detection)
- Lazy loading (이미지 최적화)

### AI 추천
- Client-side ML (no server required)
- LocalStorage persistence
- Time-based decay (오래된 데이터 가중치 감소)
- Co-occurrence matrix (함께 사용 패턴)

---

## 📝 구현 상세

### 미리보기 데이터 구조
```javascript
const WIDGET_PREVIEWS = {
  'analytics-dashboard': {
    thumbnail: '/static/images/widgets/analytics.png',
    description: '실시간 방문자 분석 및 행동 패턴 추적',
    features: ['실시간 데이터', '커스터마이징', 'CSV 내보내기'],
    category: 'Analytics',
    premium: true
  },
  // ... 87개 위젯
};
```

### AI 추천 예시
```
사용자가 "Analytics Dashboard" 사용
    ↓
시스템 학습: "다음에 Museum Metrics 사용할 가능성 높음"
    ↓
Command Palette 열면 자동으로 상단에 표시:
"✨ AI 추천: Museum Metrics (함께 자주 사용됨)"
```

---

## 🎉 최종 목표

**MuseFlow = Figma + AI의 융합**
- Figma급 UX (미리보기, 키보드 네비게이션)
- AI 기반 개인화 (사용 패턴 학습)
- 프로페셔널 생산성 도구

**벤치마킹 목표**: Figma 100% + AI 부가가치 +30%

# AI 추천 정확도 개선 계획
**Date**: 2025-12-08  
**Target**: 70% → 85%+ 추천 정확도 향상

---

## 📊 현재 상태 분석

### ✅ 기존 알고리즘 (v1.0)
```javascript
점수 = 빈도(40%) + 함께사용(30%) + 카테고리(20%) + 시간(10%)
```

### ❌ 문제점
1. **시간 감쇠 없음**: 3개월 전 데이터와 오늘 데이터 동일 가중치
2. **컨텍스트 무시**: 현재 작업 내용 고려 안 됨
3. **다양성 부족**: 같은 위젯만 계속 추천
4. **피드백 부재**: 사용자가 추천 거부해도 학습 안 됨
5. **콜드 스타트**: 신규 사용자에게 추천 불가

---

## 🎯 개선 전략

### 1️⃣ 시간 감쇠 (Time Decay)
**목적**: 최근 데이터에 더 높은 가중치 부여

#### 지수 감쇠 함수
```javascript
function timeDecay(timestamp) {
  const now = Date.now();
  const daysPassed = (now - timestamp) / (1000 * 60 * 60 * 24);
  const halfLife = 30; // 30일 반감기
  
  return Math.pow(0.5, daysPassed / halfLife);
}

// 예시:
// 오늘 사용: decay = 1.0 (100%)
// 30일 전: decay = 0.5 (50%)
// 60일 전: decay = 0.25 (25%)
```

#### 적용
```javascript
// Before
frequency[widgetId] = count;

// After
frequency[widgetId] = events.reduce((sum, event) => {
  return sum + timeDecay(event.timestamp);
}, 0);
```

---

### 2️⃣ 컨텍스트 분석 (Context Awareness)
**목적**: 현재 작업 상황에 맞는 위젯 추천

#### 컨텍스트 요소
```javascript
const context = {
  // 1. 최근 5분 내 사용한 위젯들
  recentSession: ['analytics-dashboard', 'museum-metrics'],
  
  // 2. 현재 캔버스에 있는 위젯들
  canvasWidgets: ['visitor-map', 'budget-tracker'],
  
  // 3. 현재 시간대
  timeSlot: 'afternoon',
  
  // 4. 요일 패턴
  dayOfWeek: 'weekday' // or 'weekend'
};
```

#### 컨텍스트 점수
```javascript
function contextScore(widget, context) {
  let score = 0;
  
  // 최근 세션과의 관련성 (강력한 시그널)
  context.recentSession.forEach(recentId => {
    const coWidgets = coUsage[recentId] || [];
    if (coWidgets.includes(widget.id)) {
      score += 0.5; // 세션 내 함께 사용 = 높은 점수
    }
  });
  
  // 캔버스 위젯과의 호환성
  context.canvasWidgets.forEach(canvasId => {
    const compatible = compatibility[canvasId]?.[widget.id] || 0;
    score += compatible * 0.3;
  });
  
  return Math.min(score, 1.0); // Max 1.0
}
```

---

### 3️⃣ 추천 품질 메트릭 (Quality Metrics)
**목적**: 추천 성능 실시간 모니터링

#### 수집 지표
```javascript
const metrics = {
  // 1. Click-Through Rate (CTR)
  impressions: 100,    // 추천 표시 횟수
  clicks: 15,          // 추천 클릭 횟수
  ctr: 0.15,           // 15% CTR
  
  // 2. Position Bias
  positionClicks: {
    1: 8,  // 1위 추천: 8회 클릭
    2: 4,  // 2위 추천: 4회 클릭
    3: 2,  // 3위 추천: 2회 클릭
    4: 1,
    5: 0
  },
  
  // 3. Diversity
  uniqueRecommendations: 25,  // 25개 다른 위젯 추천
  totalRecommendations: 100,  // 총 100회 추천
  diversity: 0.25,            // 25% 다양성
  
  // 4. Coverage
  recommendedWidgets: 30,  // 30개 위젯이 추천됨
  totalWidgets: 87,        // 총 87개 위젯
  coverage: 0.34           // 34% 커버리지
};
```

---

### 4️⃣ 사용자 피드백 루프 (Feedback Loop)
**목적**: 명시적 피드백으로 추천 개선

#### UI 추가
```
AI 추천 항목에 👍 👎 버튼 추가:

🤖 [Analytics Dashboard] 85% 매칭
    함께 자주 사용됨
    [👍 도움됨] [👎 별로]
```

#### 피드백 처리
```javascript
function handleFeedback(widgetId, isPositive) {
  if (isPositive) {
    // 긍정 피드백: 가중치 증가
    feedbackBoost[widgetId] = (feedbackBoost[widgetId] || 1.0) * 1.2;
  } else {
    // 부정 피드백: 가중치 감소 + 일시적 제외
    feedbackBoost[widgetId] = (feedbackBoost[widgetId] || 1.0) * 0.5;
    temporaryExclude[widgetId] = Date.now() + (24 * 60 * 60 * 1000); // 24시간
  }
  
  saveUsageData();
}
```

---

### 5️⃣ 추천 다양성 보장 (Diversity)
**목적**: 같은 위젯만 추천하는 문제 해결

#### MMR (Maximal Marginal Relevance)
```javascript
function diversifyRecommendations(scored, limit = 5) {
  const selected = [];
  const candidates = [...scored];
  
  // 첫 번째는 최고 점수
  selected.push(candidates.shift());
  
  // 나머지는 relevance와 diversity 균형
  while (selected.length < limit && candidates.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;
    
    candidates.forEach((candidate, index) => {
      // Relevance (70%)
      const relevance = candidate.score * 0.7;
      
      // Diversity (30%)
      const diversity = selected.reduce((minSim, sel) => {
        const similarity = calculateSimilarity(candidate.widget, sel.widget);
        return Math.min(minSim, 1 - similarity);
      }, 1) * 0.3;
      
      const finalScore = relevance + diversity;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestIndex = index;
      }
    });
    
    selected.push(candidates.splice(bestIndex, 1)[0]);
  }
  
  return selected;
}
```

---

### 6️⃣ 콜드 스타트 해결 (Cold Start)
**목적**: 신규 사용자에게도 유용한 추천 제공

#### 인기도 기반 초기 추천
```javascript
function getColdStartRecommendations() {
  // 전체 사용자 통계 (서버 또는 기본값)
  const popularWidgets = [
    { id: 'analytics-dashboard', globalUsage: 1500 },
    { id: 'museum-metrics', globalUsage: 1200 },
    { id: 'visitor-map', globalUsage: 900 }
  ];
  
  return popularWidgets
    .sort((a, b) => b.globalUsage - a.globalUsage)
    .slice(0, 5);
}

// 사용
if (getTotalUsageCount() < 3) {
  // 신규 사용자: 인기 위젯 추천
  return getColdStartRecommendations();
}
```

---

## 🔢 개선된 알고리즘 (v2.0)

### 최종 점수 계산
```javascript
function calculateScoreV2(widget, context) {
  let score = 0;
  
  // 1. 빈도 점수 (시간 감쇠 적용) - 30%
  const frequencyScore = getDecayedFrequency(widget.id) / maxDecayedFrequency;
  score += frequencyScore * 0.3;
  
  // 2. 함께 사용 점수 - 25%
  const coUsageScore = getCoUsageScore(widget.id, context.recentSession);
  score += coUsageScore * 0.25;
  
  // 3. 컨텍스트 점수 (NEW!) - 20%
  const ctxScore = contextScore(widget, context);
  score += ctxScore * 0.2;
  
  // 4. 카테고리 선호도 - 15%
  const categoryScore = getCategoryPreference(widget.category);
  score += categoryScore * 0.15;
  
  // 5. 시간대 패턴 - 10%
  const timeScore = getTimePatternScore(widget.id, context.timeSlot);
  score += timeScore * 0.1;
  
  // 6. 피드백 부스트 (NEW!)
  const feedbackMultiplier = feedbackBoost[widget.id] || 1.0;
  score *= feedbackMultiplier;
  
  return score;
}
```

### 가중치 변경 요약
```
v1.0:
  빈도(40%) + 함께(30%) + 카테고리(20%) + 시간(10%)

v2.0:
  빈도(30%) + 함께(25%) + 컨텍스트(20%) + 카테고리(15%) + 시간(10%)
  × 피드백 부스트 (0.5x ~ 1.5x)
```

---

## 📊 예상 개선 효과

### 정량적 목표
| 지표 | Before (v1.0) | After (v2.0) | 개선율 |
|------|---------------|--------------|--------|
| **CTR** | 15% | **25%** | +67% |
| **정확도** | 70% | **85%** | +21% |
| **다양성** | 20% | **40%** | +100% |
| **커버리지** | 30% | **50%** | +67% |

### 정성적 효과
- ✅ **시간 감쇠**: 최근 패턴에 더 민감하게 반응
- ✅ **컨텍스트**: 현재 작업에 딱 맞는 위젯 추천
- ✅ **피드백**: 사용자 선호도 빠르게 학습
- ✅ **다양성**: 새로운 위젯 발견 기회 증가
- ✅ **콜드 스타트**: 신규 사용자도 즉시 혜택

---

## 🚀 구현 우선순위

### Phase 1: 핵심 알고리즘 (즉시)
1. ✅ 시간 감쇠 함수 추가
2. ✅ 컨텍스트 분석 시스템
3. ✅ v2.0 점수 계산 통합

### Phase 2: 피드백 시스템 (즉시)
1. ✅ 👍👎 버튼 UI 추가
2. ✅ 피드백 데이터 저장
3. ✅ 부스트/페널티 로직

### Phase 3: 다양성 & 품질 (즉시)
1. ✅ MMR 알고리즘 적용
2. ✅ 품질 메트릭 수집
3. ✅ 콜드 스타트 처리

---

## 🔧 기술 구현

### LocalStorage 확장 데이터
```javascript
{
  "widget_usage_data_v2": {
    // 기존 데이터
    "frequency": { ... },
    "coUsage": { ... },
    
    // 새로운 데이터
    "events": [
      { widgetId: 'analytics', timestamp: 1733652000, sessionId: 'abc123' }
    ],
    "feedbackBoost": {
      'analytics-dashboard': 1.2,  // 긍정 피드백
      'old-widget': 0.5            // 부정 피드백
    },
    "temporaryExclude": {
      'bad-widget': 1733738400000  // 제외 종료 시간
    },
    "metrics": {
      "ctr": 0.25,
      "diversity": 0.40,
      "coverage": 0.50
    }
  }
}
```

---

## 📈 성공 지표

### A/B 테스트 시나리오
```
그룹 A (v1.0): 기존 알고리즘
그룹 B (v2.0): 개선 알고리즘

측정:
- 추천 클릭률 (CTR)
- 세션당 위젯 추가 수
- 사용자 만족도 (피드백)
- 추천 다양성 지수
```

### 목표
- ✅ CTR: 15% → 25% (+67%)
- ✅ 정확도: 70% → 85% (+21%)
- ✅ 다양성: 20% → 40% (+100%)
- ✅ 사용자 피드백: 80% 긍정

---

## 🎯 최종 목표

**"사용자가 찾기 전에 AI가 먼저 제안하는 시스템"**

- 🤖 **예측 정확도 85%+**
- 🎯 **CTR 25%+**
- 🌈 **다양성 40%+**
- ⚡ **응답 속도 <50ms**

**결과**: 세계 최고 수준의 AI 기반 위젯 추천 시스템 🏆

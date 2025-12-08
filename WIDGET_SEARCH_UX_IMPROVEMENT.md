# 위젯 검색 UX 개선 계획
**Date**: 2025-12-08  
**Target**: 87개 위젯 빠른 접근 최적화

---

## 📊 현재 상태 분석

### ❌ 문제점
1. **검색만 존재**: 타이핑 필수, 위젯 이름 기억 필요
2. **최근 사용 없음**: 자주 쓰는 위젯 재검색 필요
3. **즐겨찾기 없음**: 개인화 불가능
4. **카테고리 탐색 느림**: 87개 중 원하는 위젯 찾기 어려움
5. **Cmd+K 단축키**: 존재하지만 기능 제한적

### 📈 Figma 벤치마킹
| 기능 | Figma | 현재 MuseFlow | 목표 |
|------|-------|--------------|------|
| 빠른 검색 | ✅ Cmd+K Command Palette | 🟡 기본 검색만 | ✅ |
| 최근 사용 | ✅ Recent Components | ❌ | ✅ |
| 즐겨찾기 | ✅ Favorites | ❌ | ✅ |
| 키보드 네비 | ✅ Arrow keys | ❌ | ✅ |
| 미리보기 | ✅ Hover preview | ❌ | 🟡 Phase 2 |

---

## 🎯 개선 목표

### Priority 1: 즉시 구현
1. **최근 사용 위젯** (Recent 3-5개)
   - LocalStorage에 사용 이력 저장
   - 패널 상단에 고정 표시
   - 원클릭 재사용

2. **즐겨찾기 시스템** (Favorites)
   - 별 아이콘으로 즐겨찾기 추가/제거
   - 최근 사용 위에 고정 표시
   - LocalStorage 영구 저장

3. **Cmd+K 강화** (Command Palette)
   - 전체 화면 오버레이 검색
   - 퍼지 검색 (오타 허용)
   - 키보드 네비게이션 (↑↓ Enter)
   - Esc로 닫기

4. **카테고리 빠른 필터**
   - 상단에 탭 형태로 배치
   - 원클릭 필터링
   - 활성 카테고리 시각적 표시

---

## 🎨 UI 설계

### 새로운 위젯 패널 구조
```
┌─────────────────────────────┐
│ 🔍 Cmd+K로 빠른 검색         │ ← Command Palette 트리거
├─────────────────────────────┤
│ ⭐ Favorites (3)            │ ← 즐겨찾기 (접기/펼치기)
│  [Widget A] [Widget B] ...  │
├─────────────────────────────┤
│ 🕒 Recent (5)               │ ← 최근 사용
│  [Widget X] [Widget Y] ...  │
├─────────────────────────────┤
│ 🏷️ Categories               │
│  [All] [Analytics] [Museum] │ ← 탭 형태 필터
├─────────────────────────────┤
│ 📦 All Widgets (87)         │
│  [Widget 1]                 │
│  [Widget 2]                 │
│  ...                        │
└─────────────────────────────┘
```

### Command Palette (Cmd+K)
```
┌─────────────────────────────────────────┐
│                                         │
│  🔍 위젯 검색...                        │ ← 자동 포커스
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  📊 Visitor Analytics Dashboard         │ ← 실시간 필터링
│  📈 Museum Performance Metrics          │
│  🎨 Interactive Exhibition Map          │
│  ...                                    │
│                                         │
│  ↑↓ 이동 | Enter 선택 | Esc 닫기        │ ← 키보드 힌트
└─────────────────────────────────────────┘
```

---

## 🔧 기술 구현

### 1. LocalStorage 데이터 구조
```javascript
// Recent widgets (max 5)
{
  "widget_recent": [
    {"id": "analytics-dashboard", "name": "Visitor Analytics", "lastUsed": 1733652000},
    {"id": "museum-metrics", "name": "Museum Metrics", "lastUsed": 1733651900}
  ]
}

// Favorites (unlimited)
{
  "widget_favorites": [
    {"id": "interactive-map", "name": "Interactive Map", "category": "Museum"},
    {"id": "budget-tracker", "name": "Budget Tracker", "category": "Analytics"}
  ]
}
```

### 2. Command Palette 구현
```javascript
class CommandPalette {
  constructor() {
    this.overlay = null;
    this.input = null;
    this.results = null;
    this.selectedIndex = 0;
    this.widgets = []; // 87개 위젯 데이터
  }
  
  open() {
    // Create overlay
    // Auto-focus input
    // Load all widgets
  }
  
  search(query) {
    // Fuzzy search implementation
    // Filter by name + category + tags
    // Sort by relevance + recent usage
  }
  
  navigate(direction) {
    // Arrow up/down
    // Update selectedIndex
    // Scroll into view
  }
  
  select() {
    // Add widget to canvas
    // Close palette
    // Update recent list
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    commandPalette.open();
  }
});
```

### 3. 즐겨찾기 토글
```javascript
function toggleFavorite(widgetId) {
  const favorites = JSON.parse(localStorage.getItem('widget_favorites') || '[]');
  const index = favorites.findIndex(w => w.id === widgetId);
  
  if (index === -1) {
    // Add to favorites
    favorites.push({id: widgetId, ...widgetData});
    showToast('⭐ Favorites에 추가됨');
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
    showToast('Favorites에서 제거됨');
  }
  
  localStorage.setItem('widget_favorites', JSON.stringify(favorites));
  renderFavorites();
}
```

---

## 📊 예상 효과

### 정량적 개선
- **위젯 접근 속도**: 3-5초 → **0.5초** (-90%)
- **검색 입력 횟수**: 평균 8자 → **0자** (최근/즐겨찾기 사용 시)
- **클릭 수**: 5-7번 → **1-2번** (-70%)

### 정성적 개선
- ✅ **전문가 느낌**: Figma/Notion 수준의 UX
- ✅ **개인화**: 즐겨찾기로 작업 흐름 최적화
- ✅ **학습 불필요**: 직관적 키보드 단축키
- ✅ **생산성 향상**: 자주 쓰는 위젯 즉시 접근

---

## 🚀 구현 우선순위

### Phase 1 (즉시 구현) ⭐
1. LocalStorage 기반 Recent/Favorites
2. Command Palette (Cmd+K)
3. 키보드 네비게이션
4. 즐겨찾기 토글 버튼

### Phase 2 (선택 사항)
1. 위젯 미리보기 (Hover)
2. 드래그 앤 드롭 정렬
3. 위젯 사용 통계
4. AI 기반 위젯 추천

---

## 🎯 성공 지표

- ✅ Cmd+K 응답 시간 < 100ms
- ✅ 검색 결과 필터링 < 50ms
- ✅ Recent 위젯 저장 100% 신뢰성
- ✅ 키보드만으로 모든 작업 가능
- ✅ Figma UX 일관성 90% 이상

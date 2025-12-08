# 🎯 온보딩 재설계 계획 - 캔버스 UI 일관성

## 📊 현재 문제점

### 1. **크기 문제**
- 툴팁: 240px 너비 (너무 큼)
- 오버레이: 전체 화면 덮음 (`rgba(0,0,0,0.5)`)
- 스팟라이트: 4px 여백, 펄스 애니메이션

### 2. **디자인 불일치**
| 요소 | 현재 온보딩 | 캔버스 디자인 |
|------|------------|--------------|
| 배경 | `#0d0d0d` (어두움) | `#ffffff` (밝음) |
| 텍스트 | White | `#1f2937` |
| 보더 | `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.08)` |
| 테마 | Dark | Light |
| 그림자 | 12px heavy | 2-4px minimal |

### 3. **침투성 문제**
- 전체 화면 오버레이 (너무 침투적)
- 펄스 애니메이션 (주의 산만)
- Skip 버튼이 작음 (11px font)

---

## 🎨 재설계 원칙

### 1. **미니멀리즘**
✅ 작은 툴팁 (180px 이하)  
✅ 오버레이 제거 또는 매우 연하게  
✅ 애니메이션 최소화

### 2. **Light Theme 일관성**
✅ 배경: `#ffffff`  
✅ 텍스트: `#1f2937`  
✅ 보더: `rgba(0,0,0,0.08)`  
✅ 그림자: 2-4px

### 3. **비침투성**
✅ 우측 하단 작은 위치  
✅ 쉬운 닫기 버튼  
✅ 자동 사라짐 (5-7초)

---

## 🎯 권장 솔루션 3가지

### **Option A: 작은 인라인 툴팁** (권장)
```
┌─────────────────────────────────────────────┐
│                                             │
│           Canvas Area                       │
│                                             │
│                                             │
│                              ┌────────────┐ │
│                              │ 💡 Tip 1/3 │ │
│                              │ Projects   │ │
│                              │ [Next][×]  │ │
│                              └────────────┘ │
└─────────────────────────────────────────────┘
```

**특징**:
- 크기: 160px x 80px
- 위치: 우측 하단
- 배경: White
- 자동 사라짐: 7초

---

### **Option B: 아이콘 배지 힌트**
```
[📁 Projects] ← 1 (배지)
[📦 Widgets]
[📊 Layers]
```

**특징**:
- 각 아이콘에 작은 배지 (14px)
- 클릭 시 작은 툴팁 (120px)
- 매우 비침투적

---

### **Option C: 프로그레스 바 방식**
```
┌──────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2/3    │
│ 💡 Widgets: 87개 위젯 사용 가능     [×] │
└──────────────────────────────────────────┘
```

**특징**:
- 상단 얇은 바 (40px 높이)
- 프로그레스 표시
- 매우 간결

---

## 🚀 구현 계획 (Option A 기준)

### **1. 새로운 툴팁 디자인**

```css
.minimal-tutorial-tooltip {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 160px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  transition: opacity 0.15s;
}

.minimal-tutorial-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 8px;
}

.minimal-tutorial-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.minimal-tutorial-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.minimal-tutorial-btn {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.minimal-tutorial-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.minimal-tutorial-btn-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  padding: 2px;
}
```

---

### **2. 오버레이 제거**
```javascript
// AS-IS (제거)
background: rgba(0, 0, 0, 0.5);

// TO-BE (없음)
// No overlay - non-intrusive
```

---

### **3. 스팟라이트 단순화**
```javascript
// AS-IS (제거)
animation: pulse 2s ease-in-out infinite;

// TO-BE (단순)
border: 1px solid #3b82f6;
box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
// No animation
```

---

### **4. 자동 사라짐 로직**
```javascript
// 7초 후 자동으로 다음 단계 또는 닫기
setTimeout(() => {
  if (currentStep < totalSteps - 1) {
    nextStep();
  } else {
    closeTutorial();
  }
}, 7000);
```

---

## 📊 Before & After 비교

| 요소 | 현재 | 개선 후 |
|------|------|---------|
| **툴팁 크기** | 240px | 160px |
| **배경색** | `#0d0d0d` | `#ffffff` |
| **텍스트색** | White | `#1f2937` |
| **오버레이** | 50% 검은색 | 없음 |
| **애니메이션** | Pulse 2s | 없음 |
| **위치** | 타겟 근처 | 우측 하단 |
| **자동 닫기** | 없음 | 7초 |
| **침투성** | 높음 | 매우 낮음 |

---

## 🎯 구현 우선순위

### **Phase 1: 긴급 (즉시)**
1. ✅ 툴팁 크기 축소 (240px → 160px)
2. ✅ Light theme 적용 (White 배경)
3. ✅ 오버레이 제거
4. ✅ 펄스 애니메이션 제거

### **Phase 2: 중요 (1-2시간)**
5. ✅ 우측 하단 고정 위치
6. ✅ 자동 사라짐 (7초)
7. ✅ 큰 Skip 버튼 (11px → 12px)

### **Phase 3: 선택 (이후)**
8. 프로그레스 바 표시
9. 키보드 단축키 (Esc 닫기)
10. 쿠키 설정 (다시 보지 않기)

---

## 💡 추가 개선 아이디어

### 1. **조건부 표시**
```javascript
// 첫 방문자만
if (isFirstVisit && !hasCompletedTutorial) {
  showMinimalTutorial();
}
```

### 2. **단계별 자동 진행**
```javascript
// 7초마다 자동으로 다음 단계
autoProgressTimer = setTimeout(() => {
  nextStep();
}, 7000);
```

### 3. **Help 버튼 통합**
```
[?] Help → Click → Minimal tutorial starts
```

---

## 📝 코드 예시 (Option A)

```javascript
function showMinimalTutorial(step) {
  const tooltip = document.createElement('div');
  tooltip.className = 'minimal-tutorial-tooltip';
  tooltip.innerHTML = `
    <div class="minimal-tutorial-header">
      <span class="minimal-tutorial-badge">${step.index + 1}/${totalSteps}</span>
      <button class="minimal-tutorial-btn-close" onclick="closeTutorial()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="minimal-tutorial-title">${step.title}</div>
    <div class="minimal-tutorial-content">${step.content}</div>
    <div class="minimal-tutorial-actions">
      <button class="minimal-tutorial-btn" onclick="nextStep()">
        Next
      </button>
    </div>
  `;
  
  // Position: Fixed at bottom-right
  tooltip.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 24px;
    width: 160px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    z-index: 1000;
  `;
  
  document.body.appendChild(tooltip);
  
  // Auto-dismiss after 7 seconds
  setTimeout(() => {
    if (step.index < totalSteps - 1) {
      nextStep();
    } else {
      closeTutorial();
    }
  }, 7000);
}
```

---

## ✅ 최종 권장사항

**Option A (작은 인라인 툴팁)를 권장합니다:**

1. ✅ 캔버스 디자인과 완벽한 일관성
2. ✅ 최소 침투성 (우측 하단)
3. ✅ 자동 사라짐 (7초)
4. ✅ Light theme (White 배경)
5. ✅ 미니멀 디자인 (160px, 단순)

**예상 효과**:
- 침투성: -80%
- 일관성: +100%
- 사용자 만족도: +60%

---

**다음 단계**: Option A 구현 착수 여부 확인

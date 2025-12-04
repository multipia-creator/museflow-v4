# 🎨 Canvas V4 레이아웃 개선 계획

## 📊 현재 문제점 분석

### 1. **AI Conversation 영역이 과도하게 큼**
**현재 구조** (3열 레이아웃):
```
┌────────────────────────────────────────────────┐
│ History  │  AI Conversation  │  Preview/Results │
│  300px   │      1fr (가변)    │     400px       │
│  (15%)   │      (50%)        │     (20%)       │
└────────────────────────────────────────────────┘
```

**문제점**:
- ❌ AI Conversation이 화면의 50% 차지
- ❌ 생성 결과(Results)가 400px로 제한됨
- ❌ 가장 중요한 생성 결과가 가장 작음
- ❌ 이미지/텍스트 내용을 충분히 볼 수 없음

### 2. **여백이 과도함**
```css
padding: 1.5rem;  /* 24px - 너무 큼 */
gap: 1rem;        /* 16px - 줄일 수 있음 */
margin: 1rem;     /* 16px - 불필요 */
```

**문제점**:
- ❌ 전체 여백이 화면의 ~20% 차지
- ❌ 정보 밀도가 낮아 스크롤 필요
- ❌ 전문가 작업 환경에 부적합

### 3. **무한 캔버스 부재**
**현재**:
- ❌ 고정된 그리드 레이아웃
- ❌ 드래그 앤 드롭만 가능
- ❌ 자유로운 배치 불가
- ❌ 복사, 이동, 확대/축소 없음

### 4. **꼬리말/저작권 없음**
- ❌ 법적 보호 부재
- ❌ 브랜딩 기회 상실

---

## 🎯 개선안: 전문가 중심 레이아웃

### **새 레이아웃 구조**

#### Option A: **2열 + 무한 캔버스** (권장 ⭐⭐⭐⭐⭐)
```
┌─────────────────────────────────────────────────────┐
│ Sidebar │  Infinite Canvas (Results)                │
│  280px  │           1fr (80%+)                       │
│         │  ┌──────────────────────────────────┐     │
│ History │  │  🖼️ Image 1   📄 Text 1         │     │
│ Quick   │  │                                   │     │
│ Actions │  │  🖼️ Image 2   📄 Text 2         │     │
│         │  │                                   │     │
│ AI Chat │  │  🖼️ Image 3   📄 Text 3         │     │
│ (접힘)  │  │  - 드래그 이동                    │     │
│         │  │  - 확대/축소                      │     │
│         │  │  - 복사/삭제                      │     │
│         │  └──────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
│                     Footer (저작권)                   │
└─────────────────────────────────────────────────────┘
```

**특징**:
- ✅ Sidebar 280px (20%)
- ✅ 무한 캔버스 80%+
- ✅ AI Chat 접을 수 있음 (버튼으로 토글)
- ✅ 생성 결과가 주인공
- ✅ 자유로운 배치

#### Option B: **탭 + 무한 캔버스** (대안)
```
┌─────────────────────────────────────────────────────┐
│ Top Bar: [History] [AI Chat] [Canvas] [Widgets]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│           Infinite Canvas (Full Screen)             │
│                                                      │
│  🖼️ Image    📄 Text    🎨 Widget    🔧 Tool       │
│                                                      │
└─────────────────────────────────────────────────────┘
│                     Footer (저작권)                   │
└─────────────────────────────────────────────────────┘
```

**특징**:
- ✅ 탭 전환으로 공간 활용
- ✅ Canvas 전체 화면
- ✅ 단순하고 직관적

---

## 🖼️ 무한 캔버스 시스템 설계

### **핵심 기능**

#### 1. **Panning (이동)**
```javascript
// 마우스 드래그로 캔버스 이동
let isPanning = false;
let startX, startY, translateX = 0, translateY = 0;

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.metaKey) { // 중간 버튼 또는 Cmd+드래그
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isPanning) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
    }
});
```

#### 2. **Zooming (확대/축소)**
```javascript
// 마우스 휠로 확대/축소
let zoom = 1;
const MIN_ZOOM = 0.25;  // 25%
const MAX_ZOOM = 3;     // 300%

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
});
```

#### 3. **Item 배치 및 이동**
```javascript
// 캔버스 아이템 (이미지, 텍스트, 위젯)
class CanvasItem {
    constructor(type, content, x, y) {
        this.id = `item_${Date.now()}_${Math.random()}`;
        this.type = type;  // 'image', 'text', 'widget'
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = 300;
        this.height = 200;
        this.rotation = 0;
        this.zIndex = 0;
    }
    
    render() {
        return `
            <div class="canvas-item" 
                 id="${this.id}"
                 style="
                     position: absolute;
                     left: ${this.x}px;
                     top: ${this.y}px;
                     width: ${this.width}px;
                     height: ${this.height}px;
                     transform: rotate(${this.rotation}deg);
                     z-index: ${this.zIndex};
                 "
                 draggable="true">
                ${this.renderContent()}
                <div class="item-actions">
                    <button onclick="duplicateItem('${this.id}')">복사</button>
                    <button onclick="deleteItem('${this.id}')">삭제</button>
                    <button onclick="bringToFront('${this.id}')">앞으로</button>
                </div>
            </div>
        `;
    }
}
```

#### 4. **그리드 및 스냅**
```javascript
// 그리드에 스냅
const GRID_SIZE = 20;

function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

item.addEventListener('dragend', (e) => {
    item.x = snapToGrid(e.clientX);
    item.y = snapToGrid(e.clientY);
});
```

---

## 📏 여백 최적화

### **Before vs After**

#### Before (현재)
```css
/* 과도한 여백 */
.input-area { padding: 1.5rem; }          /* 24px */
.widget-card { padding: 1rem; }           /* 16px */
.message { padding: 1rem; gap: 1rem; }    /* 16px */
.preview-panel { padding: 1.5rem; }       /* 24px */

/* 총 여백: ~100px (화면의 20%) */
```

#### After (개선)
```css
/* 최적화된 여백 */
.input-area { padding: 0.75rem; }         /* 12px */
.widget-card { padding: 0.625rem; }       /* 10px */
.message { padding: 0.75rem; gap: 0.5rem; } /* 12px, 8px */
.preview-panel { padding: 1rem; }         /* 16px */

/* 총 여백: ~50px (화면의 10%) - 50% 감소 */
```

### **정보 밀도 향상**

#### 폰트 크기
```css
/* Before */
font-size: 1rem;       /* 16px */
line-height: 1.5;      /* 24px */

/* After */
font-size: 0.875rem;   /* 14px - 전문가용 */
line-height: 1.4;      /* 19.6px */
```

#### 컴포넌트 크기
```css
/* Before */
.widget-card { min-height: 180px; }
.message { min-height: 80px; }

/* After */
.widget-card { min-height: 140px; }  /* 22% 감소 */
.message { min-height: 60px; }       /* 25% 감소 */
```

---

## 📝 꼬리말 및 저작권

### **Footer 디자인**

```html
<footer class="canvas-footer">
    <div class="footer-content">
        <div class="footer-left">
            <div class="footer-logo">
                <i data-lucide="sparkles"></i>
                <span>MuseFlow AI</span>
            </div>
            <p class="footer-description">
                학예사를 위한 AI 업무 자동화 플랫폼
            </p>
        </div>
        
        <div class="footer-center">
            <div class="footer-links">
                <a href="/about">소개</a>
                <a href="/privacy">개인정보처리방침</a>
                <a href="/terms">이용약관</a>
                <a href="/contact">문의</a>
            </div>
        </div>
        
        <div class="footer-right">
            <p class="footer-copyright">
                © 2025 MuseFlow. All rights reserved.
            </p>
            <p class="footer-version">
                Version 4.0.0
            </p>
        </div>
    </div>
</footer>
```

### **Footer 스타일**
```css
.canvas-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: #e5e5e5;
    padding: 1rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    font-size: 0.75rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1800px;
    margin: 0 auto;
}

.footer-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: var(--museflow-primary);
}
```

---

## 📋 구현 계획

### **Phase 1: 레이아웃 재구성** (2-3시간)
**목표**: 2열 + 사이드바 구조

#### 1.1 사이드바 축소
```css
/* Before */
.left-column { width: 300px; }
.center-column { flex: 1; }
.right-column { width: 400px; }

/* After */
.sidebar {
    width: 280px;
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px - 40px); /* 헤더, 푸터 제외 */
}

.main-canvas {
    margin-left: 280px;
    width: calc(100% - 280px);
    height: calc(100vh - 64px - 40px);
}
```

#### 1.2 AI Chat 접기/펼치기
```javascript
<button class="toggle-chat" onclick="toggleAIChat()">
    <i data-lucide="message-square"></i>
    AI Chat
</button>

function toggleAIChat() {
    const chatPanel = document.getElementById('aiChatPanel');
    chatPanel.classList.toggle('collapsed');
    
    // 접으면 공간 활용
    if (chatPanel.classList.contains('collapsed')) {
        chatPanel.style.height = '48px'; // 헤더만
    } else {
        chatPanel.style.height = '400px';
    }
}
```

### **Phase 2: 무한 캔버스** (4-5시간)
**목표**: 자유로운 배치 및 이동

#### 2.1 캔버스 구조
```html
<div class="infinite-canvas" id="mainCanvas">
    <div class="canvas-grid"></div>
    <div class="canvas-items" id="canvasItems">
        <!-- 동적으로 추가되는 아이템들 -->
    </div>
    <div class="canvas-controls">
        <button onclick="resetView()">Reset</button>
        <span class="zoom-level">100%</span>
        <button onclick="zoomIn()">+</button>
        <button onclick="zoomOut()">-</button>
    </div>
</div>
```

#### 2.2 Panning & Zooming
- 마우스 중간 버튼 드래그
- Cmd/Ctrl + 드래그
- 마우스 휠 확대/축소
- 터치 제스처 지원

#### 2.3 아이템 관리
```javascript
const canvasItems = [];

function addItemToCanvas(type, content) {
    const item = new CanvasItem(type, content, mouseX, mouseY);
    canvasItems.push(item);
    renderCanvas();
}

function duplicateItem(itemId) {
    const original = canvasItems.find(i => i.id === itemId);
    const copy = new CanvasItem(
        original.type,
        original.content,
        original.x + 20,
        original.y + 20
    );
    canvasItems.push(copy);
    renderCanvas();
}

function deleteItem(itemId) {
    const index = canvasItems.findIndex(i => i.id === itemId);
    canvasItems.splice(index, 1);
    renderCanvas();
}
```

### **Phase 3: 여백 최적화** (1-2시간)
**목표**: 정보 밀도 50% 향상

#### 3.1 전역 여백 축소
```css
/* 모든 padding/margin 25% 축소 */
:root {
    --spacing-xs: 0.25rem;  /* 4px */
    --spacing-sm: 0.5rem;   /* 8px */
    --spacing-md: 0.75rem;  /* 12px */
    --spacing-lg: 1rem;     /* 16px */
}
```

#### 3.2 폰트 최적화
```css
/* 전문가용 작은 폰트 */
body { font-size: 14px; }
.widget-card { font-size: 13px; }
.message-text { font-size: 14px; }
```

#### 3.3 컴포넌트 밀도
```css
.widget-card { 
    padding: 10px; 
    min-height: 140px;
}
.message { 
    padding: 12px; 
    gap: 8px;
}
```

### **Phase 4: Footer 추가** (30분)
**목표**: 저작권 및 브랜딩

#### 4.1 Footer HTML/CSS
- 3열 구조
- 고정 위치 (40px 높이)
- 다크 테마
- 링크 및 버전 정보

---

## 🎯 예상 효과

### **레이아웃 개선**
| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| AI Chat 영역 | 50% | 20% (접힘) | -60% |
| Canvas 영역 | 20% | 75% | +275% |
| 여백 | 20% | 10% | -50% |
| 정보 밀도 | 100% | 150% | +50% |

### **무한 캔버스**
- ✅ 자유로운 배치 (드래그)
- ✅ 확대/축소 (25% ~ 300%)
- ✅ 복사/삭제/정렬
- ✅ 그리드 스냅
- ✅ 무한 스크롤

### **작업 효율성**
- 📊 한 화면에 2배 이상 정보 표시
- 🖼️ 이미지 크게 볼 수 있음
- 📝 텍스트 전체 표시
- 🎨 창의적 배치 가능
- ⚡ 빠른 작업 흐름

---

## 📊 구현 우선순위

### **Priority 1: 필수** (3-4시간)
1. ✅ 2열 레이아웃 전환
2. ✅ AI Chat 접기/펼치기
3. ✅ 여백 25% 축소
4. ✅ Footer 추가

### **Priority 2: 중요** (4-5시간)
5. ✅ 무한 캔버스 구조
6. ✅ Panning & Zooming
7. ✅ 아이템 드래그 이동
8. ✅ 복사/삭제 기능

### **Priority 3: 고급** (2-3시간)
9. ⏭️ 그리드 시스템
10. ⏭️ 키보드 단축키
11. ⏭️ 저장/불러오기
12. ⏭️ Export (PNG, PDF)

---

## 🚀 즉시 시작 (Quick Start)

### **Option A: 레이아웃만 먼저** (1시간)
```
1. 3열 → 2열 변경
2. AI Chat 접기 버튼
3. 여백 축소
4. Footer 추가
→ 즉시 개선 효과
```

### **Option B: 무한 캔버스 우선** (4시간)
```
1. 캔버스 구조 생성
2. Panning & Zooming
3. 아이템 추가/이동
4. 기본 조작 완성
→ 혁신적 UX
```

### **Option C: 전체 진행** (8-10시간)
```
Phase 1 → Phase 2 → Phase 3 → Phase 4
→ 완벽한 전문가 도구
```

---

## 💡 최종 추천

### **권장 순서**:
```
1️⃣ 레이아웃 재구성 (2-3h)
   - 2열 구조
   - AI Chat 접기
   - 여백 최적화
   - Footer

2️⃣ 무한 캔버스 (4-5h)
   - Panning & Zooming
   - 아이템 관리
   - 복사/삭제

3️⃣ 고급 기능 (2-3h)
   - 그리드
   - 단축키
   - Export
```

**총 예상 시간**: 8-11시간  
**핵심 가치**: 작업 효율성 2배 이상 향상

---

## 📝 참고 기술

### **무한 캔버스 라이브러리**
- **Fabric.js**: 강력한 캔버스 조작
- **Paper.js**: 벡터 그래픽
- **Konva.js**: 고성능 2D
- **Custom**: 완전 제어 (권장)

### **Pan & Zoom**
```javascript
// transform CSS 사용 (권장)
canvas.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;

// 또는 Canvas API
ctx.translate(x, y);
ctx.scale(zoom, zoom);
```

---

**작성일**: 2025-12-04  
**작성자**: MuseFlow Development Team  
**목표**: 학예사 업무 역량 강화를 위한 전문가 중심 레이아웃

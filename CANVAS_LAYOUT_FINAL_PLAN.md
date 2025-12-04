# Canvas V4 최종 레이아웃 계획 (교수님 제안)

## 🎯 핵심 아이디어

> **"AI Conversation과 생성결과를 교체하고, AI 채팅창은 무한 캔버스 아래 배치"**

### 기존 문제 vs 제안된 해결책

**기존 (문제):**
```
┌─────────┬──────────────┬─────────┐
│ History │  AI Chat     │ Results │
│         │  (중앙!)     │ (우측)  │
│         │  너무 큼     │ 작음    │
└─────────┴──────────────┴─────────┘
```

**제안 (해결):**
```
┌─────────┬─────────────────────────┐
│ History │  Infinite Canvas        │
│         │  (생성 결과 - 중앙!)    │
│         │  이미지, 텍스트, 차트   │
│         │  드래그, 확대/축소      │
├─────────┴─────────────────────────┤
│  AI Chat (하단)                   │
│  입력창 + 최근 3개 메시지만       │
└───────────────────────────────────┘
```

---

## ✅ 왜 이 방식이 더 좋은가?

### 1. **시각적 우선순위 완벽**
- ✅ **생성 결과가 중앙**: 가장 중요한 내용이 시선의 중심
- ✅ **AI Chat 하단**: 필요할 때만 보는 보조 영역
- ✅ **자연스러운 흐름**: 위(결과 확인) → 아래(AI 명령)

### 2. **공간 활용 극대화**
- ✅ **무한 캔버스**: 전체 중앙 영역 (70%+)
- ✅ **AI Chat 압축**: 하단 고정 (150px), 펼치면 400px
- ✅ **History 유지**: 좌측 (280px)

### 3. **작업 흐름 최적화**
```
1. 무한 캔버스에서 생성 결과 확인 (중앙 대형)
2. 드래그/복사/이동으로 작업 구성
3. 필요시 하단 AI Chat에 추가 명령
4. 새 결과 생성 → 캔버스에 자동 추가
5. 반복
```

### 4. **모바일/태블릿 호환성**
- ✅ **상단 캔버스**: 터치 드래그 최적
- ✅ **하단 채팅**: 키보드 입력 자연스러움
- ✅ **접을 수 있음**: 화면 공간 확보

---

## 📐 최종 레이아웃 상세 설계

### Desktop (1920x1080 기준)
```
┌─────────────────────────────────────────────────────────┐
│  Navbar (64px) - Dark Theme                             │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ History  │  Infinite Canvas (생성 결과 영역)            │
│ 280px    │  1fr (70%+ 화면)                             │
│          │                                              │
│ ┌─────┐  │  ┌─────────┐  ┌──────────┐  ┌──────┐      │
│ │최근1│  │  │생성이미지│  │텍스트카드│  │차트 │      │
│ │최근2│  │  │ 300x200 │  │ 400x300  │  │200x │      │
│ │최근3│  │  └─────────┘  └──────────┘  │200  │      │
│ └─────┘  │       ↑드래그     ↑복사       └──────┘      │
│          │                                              │
│ Projects │  ┌───────┐  ┌────────┐                      │
│          │  │Widget │  │Report  │  Grid (20px)         │
│          │  │A      │  │B       │  Zoom: 100%          │
│          │  └───────┘  └────────┘  [⊞] [🔍+] [🔍-]    │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│  AI Chat (하단, 접을 수 있음)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💬 최근 메시지 (3개만)                          │   │
│  │ ┌───────────────────────────────────────────┐   │   │
│  │ │ You: 전시 기획안 작성해줘                 │   │   │
│  │ │ AI: ✅ 완료! 캔버스에 추가되었습니다.     │   │   │
│  │ └───────────────────────────────────────────┘   │   │
│  │ ┌───────────────────────────────────────────┐   │   │
│  │ │ 메시지 입력...                [🎤] [📎] [▶]│   │   │
│  │ └───────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│  150px (접힘), 400px (펼침)            [▲ 펼치기]      │
└─────────────────────────────────────────────────────────┘
│  Footer (40px) - Dark Theme                             │
└─────────────────────────────────────────────────────────┘
```

### 비율 상세
- **History (Left)**: 280px (고정)
- **Infinite Canvas (Center)**: calc(100% - 280px) (가변)
- **AI Chat (Bottom)**: 
  - 접힘: 150px (입력창 + 최근 1개 메시지)
  - 펼침: 400px (입력창 + 최근 5-10개 메시지)

---

## 🛠️ 구현 계획 (4단계)

### Phase 1: 레이아웃 재구성 (2-3시간) ⭐ 최우선
**목표**: AI Chat을 하단으로 이동, 무한 캔버스를 중앙으로

#### 1.1 HTML 구조 변경
```html
<div class="canvas-container">
    <!-- Left Sidebar -->
    <aside class="left-sidebar">
        <div class="history-section">...</div>
        <div class="projects-section">...</div>
    </aside>
    
    <!-- Main Canvas Area -->
    <main class="main-canvas-area">
        <!-- Infinite Canvas -->
        <div class="infinite-canvas-wrapper">
            <div class="canvas-controls">
                <button class="zoom-in">🔍+</button>
                <span class="zoom-level">100%</span>
                <button class="zoom-out">🔍-</button>
                <button class="grid-toggle">⊞</button>
            </div>
            
            <div class="infinite-canvas" id="infiniteCanvas">
                <div class="canvas-grid"></div>
                <div class="canvas-items" id="canvasItems">
                    <!-- 생성된 아이템들 -->
                </div>
            </div>
        </div>
        
        <!-- AI Chat at Bottom -->
        <div class="ai-chat-bottom" id="aiChatBottom">
            <div class="chat-toggle">
                <button onclick="toggleChatExpand()">
                    <i class="expand-icon">▲</i>
                    <span>AI Chat</span>
                </button>
            </div>
            
            <div class="chat-messages-mini" id="chatMessagesMini">
                <!-- 최근 3개 메시지만 -->
            </div>
            
            <div class="chat-input-area">
                <input type="text" placeholder="AI 명령 입력...">
                <button class="voice-btn">🎤</button>
                <button class="attach-btn">📎</button>
                <button class="send-btn">▶</button>
            </div>
        </div>
    </main>
</div>
```

#### 1.2 CSS 레이아웃
```css
/* 전체 컨테이너 */
.canvas-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    grid-template-rows: 1fr;
    height: calc(100vh - 64px - 40px); /* navbar + footer */
    gap: 0;
}

/* Left Sidebar */
.left-sidebar {
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

/* Main Canvas Area */
.main-canvas-area {
    display: flex;
    flex-direction: column;
    background: #F9FAFB;
    position: relative;
}

/* Infinite Canvas (상단) */
.infinite-canvas-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.infinite-canvas {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: grab;
    overflow: hidden;
}

.infinite-canvas.panning {
    cursor: grabbing;
}

/* Canvas Grid */
.canvas-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    background-image: 
        linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
}

/* AI Chat Bottom */
.ai-chat-bottom {
    background: #FFFFFF;
    border-top: 2px solid #8B5CF6;
    display: flex;
    flex-direction: column;
    transition: height 0.3s ease;
    height: 150px; /* 기본: 접힘 */
}

.ai-chat-bottom.expanded {
    height: 400px; /* 펼침 */
}

/* Chat Toggle Button */
.chat-toggle {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #E5E7EB;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    color: white;
}

.chat-toggle:hover {
    background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
}

.expand-icon {
    transition: transform 0.3s;
}

.ai-chat-bottom.expanded .expand-icon {
    transform: rotate(180deg);
}

/* Chat Messages Mini */
.chat-messages-mini {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Chat Input Area */
.chat-input-area {
    padding: 0.75rem;
    border-top: 1px solid #E5E7EB;
    display: flex;
    gap: 0.5rem;
    background: #F9FAFB;
}

.chat-input-area input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 14px;
}

.chat-input-area button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: #F3F4F6;
    transition: all 0.2s;
}

.chat-input-area button:hover {
    background: #E5E7EB;
    transform: scale(1.05);
}

.chat-input-area .send-btn {
    background: #8B5CF6;
    color: white;
}

.chat-input-area .send-btn:hover {
    background: #7C3AED;
}
```

---

### Phase 2: 무한 캔버스 기능 (3-4시간)
**목표**: Panning, Zooming, Grid System

#### 2.1 JavaScript 핵심 기능
```javascript
class InfiniteCanvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.items = [];
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        this.init();
    }
    
    init() {
        // Panning
        this.canvas.addEventListener('mousedown', this.startPan.bind(this));
        this.canvas.addEventListener('mousemove', this.pan.bind(this));
        this.canvas.addEventListener('mouseup', this.endPan.bind(this));
        
        // Zooming
        this.canvas.addEventListener('wheel', this.handleZoom.bind(this));
        
        // Item management
        this.loadItems();
    }
    
    // Panning (이동)
    startPan(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.isDragging = true;
            this.dragStartX = e.clientX - this.panX;
            this.dragStartY = e.clientY - this.panY;
            this.canvas.classList.add('panning');
        }
    }
    
    pan(e) {
        if (this.isDragging) {
            this.panX = e.clientX - this.dragStartX;
            this.panY = e.clientY - this.dragStartY;
            this.updateTransform();
        }
    }
    
    endPan() {
        this.isDragging = false;
        this.canvas.classList.remove('panning');
    }
    
    // Zooming (확대/축소)
    handleZoom(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.25, Math.min(3.0, this.zoom * delta));
        
        // 마우스 위치 기준 줌
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
        this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
        this.zoom = newZoom;
        
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    updateTransform() {
        const itemsContainer = this.canvas.querySelector('.canvas-items');
        itemsContainer.style.transform = 
            `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
    
    updateZoomDisplay() {
        document.querySelector('.zoom-level').textContent = 
            `${Math.round(this.zoom * 100)}%`;
    }
    
    // 아이템 추가
    addItem(type, content, x, y) {
        const item = new CanvasItem(type, content, x, y);
        this.items.push(item);
        this.renderItem(item);
        this.saveItems();
    }
    
    // 아이템 렌더링
    renderItem(item) {
        const element = document.createElement('div');
        element.className = 'canvas-item';
        element.dataset.id = item.id;
        element.style.left = item.x + 'px';
        element.style.top = item.y + 'px';
        element.style.width = item.width + 'px';
        element.style.height = item.height + 'px';
        element.innerHTML = this.getItemTemplate(item);
        
        // Drag handler
        this.makeItemDraggable(element);
        
        document.querySelector('.canvas-items').appendChild(element);
    }
    
    // 아이템 드래그 가능하게
    makeItemDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        element.querySelector('.canvas-item-header').addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt(element.style.left);
            initialY = parseInt(element.style.top);
            element.style.zIndex = Date.now();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = (e.clientX - startX) / this.zoom;
                const dy = (e.clientY - startY) / this.zoom;
                element.style.left = (initialX + dx) + 'px';
                element.style.top = (initialY + dy) + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.saveItems();
            }
        });
    }
    
    // 저장/불러오기
    saveItems() {
        localStorage.setItem('canvas-items', JSON.stringify(this.items));
    }
    
    loadItems() {
        const saved = localStorage.getItem('canvas-items');
        if (saved) {
            this.items = JSON.parse(saved);
            this.items.forEach(item => this.renderItem(item));
        }
    }
}

// 초기화
const infiniteCanvas = new InfiniteCanvas(
    document.getElementById('infiniteCanvas')
);
```

#### 2.2 Canvas Item 템플릿
```javascript
function getItemTemplate(item) {
    switch (item.type) {
        case 'image':
            return `
                <div class="canvas-item-header">
                    <span class="canvas-item-title">생성 이미지</span>
                    <div class="canvas-item-actions">
                        <button onclick="duplicateItem('${item.id}')">📋</button>
                        <button onclick="deleteItem('${item.id}')">🗑️</button>
                    </div>
                </div>
                <div class="canvas-item-content">
                    <img src="${item.content}" alt="Generated">
                </div>
                <div class="canvas-item-resize"></div>
            `;
        
        case 'text':
            return `
                <div class="canvas-item-header">
                    <span class="canvas-item-title">텍스트 카드</span>
                    <div class="canvas-item-actions">
                        <button onclick="duplicateItem('${item.id}')">📋</button>
                        <button onclick="deleteItem('${item.id}')">🗑️</button>
                    </div>
                </div>
                <div class="canvas-item-content text-content">
                    ${item.content}
                </div>
                <div class="canvas-item-resize"></div>
            `;
        
        // ... 다른 타입들
    }
}
```

---

### Phase 3: AI Chat 하단 연동 (2시간)
**목표**: AI 응답을 캔버스에 자동 추가

#### 3.1 AI 응답 처리
```javascript
// AI 응답 받았을 때
function handleAIResponse(response) {
    // 1. 하단 채팅창에 메시지 추가
    addChatMessage('ai', response.message);
    
    // 2. 생성된 콘텐츠를 캔버스에 추가
    if (response.content) {
        const x = 100 + (infiniteCanvas.items.length * 50);
        const y = 100 + (infiniteCanvas.items.length * 30);
        
        infiniteCanvas.addItem(
            response.contentType, // 'image', 'text', 'chart', etc.
            response.content,
            x,
            y
        );
        
        // 3. 캔버스를 해당 아이템으로 이동 (자동 포커스)
        infiniteCanvas.panTo(x, y);
    }
}

// 채팅 메시지 추가 (최근 3개만 유지)
function addChatMessage(type, text) {
    const messagesContainer = document.getElementById('chatMessagesMini');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${type}`;
    messageElement.textContent = text;
    
    messagesContainer.appendChild(messageElement);
    
    // 최근 3개만 유지
    const messages = messagesContainer.querySelectorAll('.chat-message');
    if (messages.length > 3) {
        messages[0].remove();
    }
    
    // 자동 스크롤
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
```

---

### Phase 4: 여백 최적화 + 마무리 (1-2시간)
**목표**: 여백 축소, 성능 최적화, 테스트

#### 4.1 여백 축소
```css
/* 전역 여백 축소 */
.left-sidebar {
    padding: 0.5rem; /* 1rem → 0.5rem */
}

.history-item,
.project-item {
    padding: 0.5rem; /* 0.75rem → 0.5rem */
    margin-bottom: 0.25rem; /* 0.5rem → 0.25rem */
}

.canvas-item {
    padding: 0.5rem; /* 0.75rem → 0.5rem */
}

.canvas-item-header {
    padding: 0.5rem; /* 0.75rem → 0.5rem */
    font-size: 0.875rem; /* 1rem → 0.875rem */
}

/* 폰트 크기 축소 */
body {
    font-size: 14px; /* 16px → 14px */
}
```

---

## 📊 예상 효과

### 공간 활용 비교

| 영역 | 기존 | 개선 후 | 비고 |
|------|------|---------|------|
| **무한 캔버스** | 400px (23%) | 70%+ | **3배 증가!** |
| **AI Chat** | ~50% (중앙) | 150px (하단) | **70% 축소** |
| **History** | 300px | 280px | 유지 |
| **여백** | 100% | 60% | 40% 축소 |

### 작업 효율 개선

**시선 흐름:**
```
기존: 좌측 → 중앙(Chat) → 우측(결과) ❌ 비효율
개선: 좌측 → 중앙(결과) → 하단(Chat) ✅ 효율적
```

**작업 흐름:**
```
1. 중앙 캔버스에서 생성 결과 확인 (대형)
2. 드래그/복사/이동으로 구성
3. 하단 AI Chat에 추가 명령
4. 새 결과 → 자동으로 캔버스 추가
5. 반복
```

**키 메트릭:**
- ✅ 캔버스 영역: **300% 증가**
- ✅ AI Chat: **70% 축소** (하단 고정)
- ✅ 시선 이동: **50% 감소**
- ✅ 작업 속도: **2배 향상** (예상)

---

## 🚀 실행 계획

### 즉시 시작 (추천)
```
Day 1 (6-7시간):
  Phase 1: 레이아웃 재구성 (2-3h)
    → AI Chat 하단 이동
    → 무한 캔버스 중앙 배치
    → 테스트 및 배포
  
  Phase 2: 무한 캔버스 기능 (3-4h)
    → Panning, Zooming
    → Grid System
    → 테스트 및 배포

Day 2 (3-4시간):
  Phase 3: AI Chat 연동 (2h)
    → AI 응답 → 캔버스 자동 추가
    → 채팅 메시지 최근 3개 유지
  
  Phase 4: 여백 최적화 + 마무리 (1-2h)
    → 여백 40% 축소
    → 성능 최적화
    → 최종 테스트 및 배포
```

**총 소요 시간**: 9-11시간

---

## ✅ 체크리스트

### Phase 1: 레이아웃 재구성
- [ ] HTML 구조 변경 (3-column → 2-column + bottom)
- [ ] CSS Grid 레이아웃 적용
- [ ] AI Chat 하단 이동
- [ ] 무한 캔버스 중앙 배치
- [ ] 반응형 확인
- [ ] 배포 및 테스트

### Phase 2: 무한 캔버스 기능
- [ ] Panning (마우스 드래그)
- [ ] Zooming (휠, 25-300%)
- [ ] Grid System (20px)
- [ ] Canvas Controls UI
- [ ] 성능 최적화
- [ ] 배포 및 테스트

### Phase 3: AI Chat 연동
- [ ] AI 응답 → 캔버스 자동 추가
- [ ] 채팅 메시지 최근 3개 유지
- [ ] 펼치기/접기 기능
- [ ] 입력창 단축키 (Enter)
- [ ] 테스트

### Phase 4: 마무리
- [ ] 여백 40% 축소
- [ ] 폰트 크기 조정
- [ ] 성능 최적화
- [ ] 크로스 브라우저 테스트
- [ ] 최종 배포

---

## 🎯 최종 비전

**학예사가 가장 효율적으로 작업할 수 있는 캔버스**

```
✅ 생성 결과가 화면 중앙 대형으로 표시
✅ 무한 캔버스에서 자유롭게 조직화
✅ AI Chat은 필요할 때만 하단에서 사용
✅ 드래그/복사/확대로 직관적 작업
✅ 자동 저장/불러오기로 작업 보존
```

---

**작성일**: 2025-12-04  
**버전**: FINAL  
**제안자**: 남현우 교수님  
**상태**: 실행 대기 중

---

## 🚀 즉시 시작할까요?

Phase 1 (레이아웃 재구성)부터 바로 시작하시겠습니까?

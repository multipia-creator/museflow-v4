# Canvas V4 복원 기반 신규 레이아웃 구현 전략

## 📋 교수님 제안 분석

> "기존에 만든 것을 복원하고 만들면 쉽겠지"

**핵심 아이디어**: 
- Swap 이전 버전 (`b8e7d7c` 커밋)을 기반으로 새 레이아웃 구현
- 기존 기능 100% 보존 + 새 Infinite Canvas 구조만 추가

---

## 🔍 현재 상황 분석

### **Available Canvas Versions**
```
1. canvas-v4-hybrid.html (현재, 167KB)
   - Git: e77191e (Swapped: Results Center, AI Chat Right)
   - URL: https://4e6d9c00.museflow.pages.dev/canvas-v4-hybrid
   - Status: ❌ 교수님 요구사항과 다름 (AI Chat이 여전히 대화 형식)

2. canvas-v4-hybrid.html (b8e7d7c, Swap 이전)
   - Git: b8e7d7c (Original: AI Chat Center, Results Right)
   - Status: ✅ 완전한 기능, 복원 가능

3. canvas-v3.html (130KB)
   - Old version, 참고용

4. canvas-layout-sample.html (26KB)
   - Simple layout sample
```

### **Git History - Canvas V4 Development**
```
e77191e ← [현재] Swap layout (45min 전)
b8e7d7c ← [복원 기준] Footer 추가 (완전한 기능)
0fc7bad ← Week 1 Features: Drag & Drop, Search, History
d0842e9 ← Action buttons (Copy, Figma, Notion)
2374641 ← AI model selection, Voice input
c14e9b3 ← Mobile optimization
58e67fa ← Digital Twin integration
...
```

---

## ✅ 복원 기반 구현 전략 (교수님 제안)

### **Strategy 1: Git Checkout → Modify (RECOMMENDED)**

**장점:**
- ✅ 기존 기능 100% 보존 (AI 모델 선택, 음성 입력, SSE 등)
- ✅ 작업 시간 단축 (3-4시간 → **2-3시간**)
- ✅ 버그 위험 최소화 (검증된 코드 기반)
- ✅ Git history 유지 (롤백 가능)

**작업 흐름:**
```bash
# 1. Swap 이전 버전으로 복원
git checkout b8e7d7c -- public/canvas-v4-hybrid.html

# 2. 파일명 변경 (기존 유지)
cp public/canvas-v4-hybrid.html public/canvas-v5-final.html

# 3. canvas-v5-final.html 수정
#    - Center Column: AI Chat 제거 → Infinite Canvas 영역으로 변경
#    - Center Bottom: AI Input 영역 분리 (150px)
#    - Right Column: 실시간 현황 + 위젯 (기존 유지)

# 4. CSS Grid 수정
#    grid-template-rows: 1fr 150px;
#    grid-template-areas: "left canvas right" "left input right";

# 5. JavaScript 수정
#    executeAICommand() → createCanvasCard() 연결
#    SSE 응답 → Canvas에 카드 생성 로직 추가

# 6. 테스트 & 배포
npm run build
pm2 restart museflow
curl http://localhost:3000/canvas-v5-final
```

**예상 소요 시간:**
- 복원 & 구조 수정: 1시간
- Infinite Canvas 기본: 1-1.5시간
- AI Integration: 30분
- 테스트 & 디버깅: 30분
- **Total: 2-3시간** (Phase 1만)

---

### **Strategy 2: 신규 파일 생성 (Alternative)**

**작업 흐름:**
```bash
# 1. 새 파일 생성
cp public/canvas-v4-hybrid.html public/canvas-v5-infinite.html

# 2. 처음부터 재설계
#    - 기존 코드 대부분 제거
#    - 새로운 구조로 다시 작성

# 3. 기능 재구현 필요
#    - AI 모델 선택
#    - 음성 입력
#    - SSE 스트리밍
#    - 드래그 앤 드롭
#    - ...
```

**단점:**
- ❌ 시간 많이 소요 (10-14시간)
- ❌ 기존 기능 재구현 필요
- ❌ 버그 위험 높음

---

## 🎯 추천 실행 계획 (Strategy 1)

### **Phase 1: 복원 & 기본 구조 수정 (2-3시간)**

#### **Step 1: Git Checkout (5분)**
```bash
cd /home/user/museflow-v4

# 1. 현재 버전 백업
cp public/canvas-v4-hybrid.html public/canvas-v4-hybrid.swapped.backup

# 2. Swap 이전 버전으로 복원
git checkout b8e7d7c -- public/canvas-v4-hybrid.html

# 3. 새 파일명으로 복사
cp public/canvas-v4-hybrid.html public/canvas-v5-final.html

# 4. 원본 복구 (현재 버전 유지)
cp public/canvas-v4-hybrid.swapped.backup public/canvas-v4-hybrid.html
```

#### **Step 2: HTML 구조 수정 (1시간)**
**파일**: `public/canvas-v5-final.html`

**변경 1: CSS Grid**
```css
/* Before (3-column) */
.canvas-container {
  display: grid;
  grid-template-columns: 300px 1fr 400px;  /* Left | Center | Right */
  grid-template-rows: 1fr;
}

/* After (3-column + 2-row) */
.canvas-container {
  display: grid;
  grid-template-columns: 300px 1fr 400px;  /* Left | Center | Right */
  grid-template-rows: 1fr 150px;            /* Canvas | Input */
  grid-template-areas:
    "left canvas right"
    "left input  right";
  height: calc(100vh - 64px - 48px);
  gap: 0;
  overflow: hidden;
}

.left-column {
  grid-area: left;
}

.center-canvas {
  grid-area: canvas;
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(200,200,200,0.1) 1px, transparent 1px),
              linear-gradient(rgba(200,200,200,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.center-input {
  grid-area: input;
  border-top: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.right-column {
  grid-area: right;
}
```

**변경 2: HTML 구조**
```html
<!-- Before: Center Column (AI Chat 대화형) -->
<div class="center-column">
  <div class="conversation-area">
    <div class="ai-message">...</div>
    <div class="user-message">...</div>
  </div>
  <div class="input-area">...</div>
</div>

<!-- After: Center Canvas + Input (분리) -->
<div class="center-canvas" id="infiniteCanvas">
  <!-- Canvas Viewport -->
  <div class="canvas-viewport" id="canvasViewport">
    <!-- Cards will be generated here -->
  </div>
  
  <!-- Canvas Controls -->
  <div class="canvas-controls">
    <button class="zoom-out">-</button>
    <span class="zoom-level">100%</span>
    <button class="zoom-in">+</button>
    <button class="fit">Fit</button>
  </div>
</div>

<div class="center-input">
  <div class="input-container">
    <select id="aiModelSelect">...</select>
    <input type="text" id="commandInput" placeholder="AI 명령어 입력...">
    <button id="voiceBtn">🎤</button>
    <button id="sendBtn">전송</button>
  </div>
</div>
```

#### **Step 3: Infinite Canvas 기본 구현 (1-1.5시간)**
```javascript
// Canvas State
const canvas = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.25,
  maxScale: 3.0,
  cards: []  // Generated cards
};

// Panning (드래그 이동)
let isPanning = false;
let startX, startY;

canvasViewport.addEventListener('mousedown', (e) => {
  if (e.button === 0) {  // Left click
    isPanning = true;
    startX = e.clientX - canvas.x;
    startY = e.clientY - canvas.y;
    canvasViewport.style.cursor = 'grabbing';
  }
});

document.addEventListener('mousemove', (e) => {
  if (isPanning) {
    canvas.x = e.clientX - startX;
    canvas.y = e.clientY - startY;
    updateCanvasTransform();
  }
});

document.addEventListener('mouseup', () => {
  isPanning = false;
  canvasViewport.style.cursor = 'grab';
});

// Zooming (마우스 휠)
canvasViewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(canvas.minScale, Math.min(canvas.maxScale, canvas.scale * delta));
  
  // Zoom at mouse position
  const rect = canvasViewport.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  canvas.x = mouseX - (mouseX - canvas.x) * (newScale / canvas.scale);
  canvas.y = mouseY - (mouseY - canvas.y) * (newScale / canvas.scale);
  canvas.scale = newScale;
  
  updateCanvasTransform();
});

// Update Transform
function updateCanvasTransform() {
  canvasViewport.style.transform = 
    `translate(${canvas.x}px, ${canvas.y}px) scale(${canvas.scale})`;
  document.querySelector('.zoom-level').textContent = `${Math.round(canvas.scale * 100)}%`;
}

// Zoom Buttons
document.querySelector('.zoom-in').addEventListener('click', () => {
  canvas.scale = Math.min(canvas.maxScale, canvas.scale * 1.2);
  updateCanvasTransform();
});

document.querySelector('.zoom-out').addEventListener('click', () => {
  canvas.scale = Math.max(canvas.minScale, canvas.scale / 1.2);
  updateCanvasTransform();
});

document.querySelector('.fit').addEventListener('click', () => {
  canvas.x = 0;
  canvas.y = 0;
  canvas.scale = 1;
  updateCanvasTransform();
});
```

#### **Step 4: AI Integration (30분)**
```javascript
// AI Command → Canvas Card
async function executeAICommand() {
  const command = document.getElementById('commandInput').value;
  const model = document.getElementById('aiModelSelect').value;
  
  if (!command.trim()) return;
  
  // 1. API 호출
  const response = await fetch('/api/orchestrator/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command,
      modelId: model,
      projectId: 'canvas-v5',
      projectName: 'Canvas V5 Final'
    })
  });
  
  const { sessionId, streamUrl } = await response.json();
  
  // 2. SSE 연결
  const eventSource = new EventSource(streamUrl);
  
  eventSource.addEventListener('phase-completed', (event) => {
    const result = JSON.parse(event.data);
    
    // 3. Canvas에 카드 생성
    createCanvasCard({
      type: result.type || 'text',
      content: result.result || result.output,
      position: getNextCardPosition()
    });
    
    eventSource.close();
  });
  
  // Clear input
  document.getElementById('commandInput').value = '';
}

// Create Canvas Card
function createCanvasCard({ type, content, position }) {
  const card = document.createElement('div');
  card.className = 'canvas-card';
  card.dataset.cardId = `card-${Date.now()}`;
  card.style.position = 'absolute';
  card.style.left = position.x + 'px';
  card.style.top = position.y + 'px';
  card.style.width = '300px';
  card.style.minHeight = '200px';
  
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${type}</span>
      <div class="card-actions">
        <button onclick="copyCard(this)"><i class="fas fa-copy"></i></button>
        <button onclick="exportFigma(this)"><i class="fas fa-figma"></i></button>
        <button onclick="exportNotion(this)"><i class="fas fa-notion"></i></button>
        <button onclick="deleteCard(this)"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="card-content">
      ${type === 'image' ? `<img src="${content}" alt="Generated">` : `<p>${content}</p>`}
    </div>
  `;
  
  // Make draggable
  makeCardDraggable(card);
  
  // Add to canvas
  document.getElementById('canvasViewport').appendChild(card);
  canvas.cards.push(card);
}

// Auto Position (좌측 상단부터 순서대로)
function getNextCardPosition() {
  const cols = 3;
  const cardWidth = 320;  // 300 + 20 gap
  const cardHeight = 240; // 200 + 40 gap
  const index = canvas.cards.length;
  
  return {
    x: (index % cols) * cardWidth + 50,
    y: Math.floor(index / cols) * cardHeight + 50
  };
}

// Make Card Draggable
function makeCardDraggable(card) {
  let isDragging = false;
  let offsetX, offsetY;
  
  card.querySelector('.card-header').addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - card.offsetLeft;
    offsetY = e.clientY - card.offsetTop;
    card.style.zIndex = Date.now();  // Bring to front
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      card.style.left = (e.clientX - offsetX) + 'px';
      card.style.top = (e.clientY - offsetY) + 'px';
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Send Button
document.getElementById('sendBtn').addEventListener('click', executeAICommand);

// Enter Key
document.getElementById('commandInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    executeAICommand();
  }
});
```

#### **Step 5: 테스트 & 배포 (30분)**
```bash
# 1. Build
cd /home/user/museflow-v4
npm run build

# 2. Local Test
pm2 restart museflow
curl http://localhost:3000/canvas-v5-final

# 3. Production Deploy
npx wrangler pages deploy dist --project-name museflow

# 4. Git Commit
git add public/canvas-v5-final.html
git commit -m "🎨 Canvas V5 Final: Infinite Canvas with Card-based AI Results

기반: Git b8e7d7c (Swap 이전 완전 기능 버전)

레이아웃 구조:
- Left: History + Quick Actions + To-Do (300px)
- Center Top: Infinite Canvas (1fr, Panning/Zooming/Grid)
- Center Bottom: AI Input (150px)
- Right: Real-time Status + Widgets (400px)

Phase 1 완료 (2-3h):
- CSS Grid 2-row 구조 적용
- Infinite Canvas 기본 (Pan/Zoom)
- AI 명령어 → Canvas Card 생성
- Card Drag & Drop

다음 단계:
- Phase 2: Card 고급 기능 (Resize, Copy, Export)
- Phase 3: Canvas 최적화 (Virtual DOM, Lazy Load)
- Phase 4: UX 개선 (Keyboard Shortcuts, Context Menu)
"
```

---

## 📊 Strategy 1 vs Strategy 2 비교

| 항목 | Strategy 1 (복원 기반) | Strategy 2 (신규 작성) |
|------|----------------------|----------------------|
| **소요 시간** | 2-3시간 (Phase 1) | 10-14시간 (전체) |
| **기존 기능** | ✅ 100% 보존 | ❌ 재구현 필요 |
| **버그 위험** | ✅ 낮음 (검증된 코드) | ⚠️ 높음 (새 코드) |
| **Git History** | ✅ 유지 | ⚠️ 새 시작 |
| **롤백** | ✅ 쉬움 | ❌ 어려움 |
| **학습 곡선** | ✅ 낮음 (기존 코드) | ⚠️ 높음 (신규) |
| **추천도** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 최종 추천

### **교수님 제안대로: Strategy 1 (복원 기반 구현)**

**이유:**
1. ✅ **시간 단축**: 10-14시간 → **2-3시간** (Phase 1만으로 80% 완성)
2. ✅ **기능 보존**: AI 모델 선택, 음성 입력, SSE, 드래그앤드롭 등 모두 유지
3. ✅ **안정성**: 검증된 코드 기반 (b8e7d7c 커밋, 완전 동작)
4. ✅ **점진적 개선**: Phase 1 → 2 → 3 순차 진행 가능

**즉시 실행 가능:**
```bash
# 1. 복원
git checkout b8e7d7c -- public/canvas-v4-hybrid.html
cp public/canvas-v4-hybrid.html public/canvas-v5-final.html

# 2. 수정 (2-3시간)
# - CSS Grid 2-row
# - Center: Canvas + Input 분리
# - AI → Card 생성 로직

# 3. 배포
npm run build && npx wrangler pages deploy dist --project-name museflow
```

---

## 📝 다음 단계

**교수님, 이 전략이 맞습니까?**
- ✅ Git `b8e7d7c` (Swap 이전) 버전 복원
- ✅ `canvas-v5-final.html` 새 파일 생성
- ✅ 기존 기능 100% 보존 + Infinite Canvas만 추가
- ✅ 2-3시간 Phase 1로 80% 완성

**승인 시 바로 실행:**
1. `git checkout b8e7d7c -- public/canvas-v4-hybrid.html` (5분)
2. HTML 구조 수정 (1시간)
3. Infinite Canvas 기본 (1-1.5시간)
4. AI Integration (30분)
5. 테스트 & 배포 (30분)

**Total: 2-3시간** → 오늘 완료 가능!

---

**Status**: ✅ 복원 전략 문서 완성  
**Recommendation**: Strategy 1 (Git 복원 기반)  
**Time Estimate**: 2-3시간 (Phase 1)  
**교수님 최종 승인 대기중**

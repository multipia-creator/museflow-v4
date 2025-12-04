# Canvas V4 - FINAL CORRECT Layout Design
# 교수님 최종 확인 레이아웃 설계

## 📋 요구사항 (2025-01-XX 교수님 피드백)

> "왼쪽 [히스토리 & 프로젝트(빠른 작업...등), 해야 할일]  
> 센터 중앙 [생성결과 무한캠퍼스]  
> 중앙하단 [AI 명령어 입력]  
> 명령어 입력하면, 센터 중앙에 카드로 생성됨. 이후에도 카드로 생성됨.  
> 오른쪽 [실시간 현황, AI 작업 진행중, 위젯 등 표시]"

---

## 🎯 레이아웃 구조

```
┌───────────────────────────────────────────────────────────────────────┐
│  Top Navigation (Dark Theme) - Fixed 64px                             │
├───────────┬──────────────────────────────────────────┬────────────────┤
│           │                                          │                │
│  LEFT     │           CENTER (Infinite Canvas)       │     RIGHT      │
│  300px    │               1fr (70%+)                 │    400px       │
│           │                                          │                │
│ ┌───────┐ │ ┌──────────────────────────────────────┐ │ ┌────────────┐│
│ │History│ │ │                                      │ │ │ Real-time  ││
│ │   &   │ │ │   Infinite Canvas (Panning/Zoom)    │ │ │  Status    ││
│ │Project│ │ │                                      │ │ │            ││
│ └───────┘ │ │  ┌─────────────┐  ┌─────────────┐   │ │ │ AI Work    ││
│           │ │  │ Card 1      │  │ Card 2      │   │ │ │ Progress   ││
│ ┌───────┐ │ │  │ (Image)     │  │ (Text)      │   │ │ │            ││
│ │ Quick │ │ │  │             │  │             │   │ │ │ • Phase 1  ││
│ │Actions│ │ │  └─────────────┘  └─────────────┘   │ │ │ • Phase 2  ││
│ └───────┘ │ │                                      │ │ │            ││
│           │ │  ┌─────────────┐  ┌─────────────┐   │ │ ┌────────────┐│
│ ┌───────┐ │ │  │ Card 3      │  │ Card 4      │   │ │ │ Widgets    ││
│ │To-Do  │ │ │  │ (Chart)     │  │ (Widget)    │   │ │ │            ││
│ │       │ │ │  │             │  │             │   │ │ │ [Calendar] ││
│ │       │ │ │  └─────────────┘  └─────────────┘   │ │ │ [Budget]   ││
│ └───────┘ │ │                                      │ │ │ [Tasks]    ││
│           │ │                                      │ │ │            ││
│           │ └──────────────────────────────────────┘ │ └────────────┘│
│           │                                          │                │
│           │ ┌──────────────────────────────────────┐ │                │
│           │ │  AI Command Input (Fixed Bottom)     │ │                │
│           │ │                                      │ │                │
│           │ │  [프롬프트 입력...] [🎤] [GPT-4 ▼]   │ │                │
│           │ │                              [전송 →] │ │                │
│           │ └──────────────────────────────────────┘ │                │
│           │                     150px                │                │
└───────────┴──────────────────────────────────────────┴────────────────┘
│  Footer (Dark Theme) - Fixed 48px                                     │
│  MuseFlow | Copyright © 2026, Imageroot | Made by 남현우 교수 | V4.0  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 CSS Grid 구조

```css
.canvas-container {
  display: grid;
  grid-template-columns: 300px 1fr 400px;  /* Left | Center | Right */
  grid-template-rows: 1fr 150px;            /* Canvas | Input */
  grid-template-areas:
    "left canvas right"
    "left input  right";
  height: calc(100vh - 64px - 48px);        /* 전체 높이 - 상단바 - 하단푸터 */
  gap: 0;
  overflow: hidden;
}

.left-column {
  grid-area: left;
  overflow-y: auto;
}

.center-canvas {
  grid-area: canvas;
  position: relative;
  overflow: hidden;  /* Infinite Canvas 내부에서 자체 스크롤 */
  background: linear-gradient(90deg, rgba(200,200,200,0.1) 1px, transparent 1px),
              linear-gradient(rgba(200,200,200,0.1) 1px, transparent 1px);
  background-size: 20px 20px;  /* Grid 20px */
}

.center-input {
  grid-area: input;
  border-top: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 16px;
}

.right-column {
  grid-area: right;
  overflow-y: auto;
}
```

---

## 📦 각 영역별 기능 정의

### **1. Left Column (300px)** - History & Projects
```html
<div class="left-column">
  <!-- Section 1: History & Projects -->
  <div class="section-header">
    <i class="fas fa-history"></i> History & Projects
  </div>
  <div class="history-list">
    <!-- 최근 작업 목록 -->
  </div>

  <!-- Section 2: Quick Actions -->
  <div class="section-header">
    <i class="fas fa-bolt"></i> 빠른 작업
  </div>
  <div class="quick-actions-grid">
    <button>전시 라벨</button>
    <button>예산 승인</button>
    <button>소장품 선정</button>
  </div>

  <!-- Section 3: To-Do -->
  <div class="section-header">
    <i class="fas fa-tasks"></i> 해야 할 일
  </div>
  <div class="todo-list">
    <!-- 작업 체크리스트 -->
  </div>
</div>
```

**주요 기능:**
- 최근 작업 히스토리 (최대 10개)
- 빠른 작업 버튼 (전시 라벨, 예산 승인 등)
- To-Do 리스트 (체크박스 + 우선순위)

---

### **2. Center Canvas (1fr, 70%+)** - Infinite Canvas 생성결과 영역

#### **2-1. Canvas Area (무한 캔버스)**
```html
<div class="center-canvas" id="infiniteCanvas">
  <!-- Canvas Viewport -->
  <div class="canvas-viewport" id="canvasViewport" 
       style="transform: translate(0px, 0px) scale(1);">
    
    <!-- Generated Cards (AI 응답 결과) -->
    <div class="canvas-card" data-card-id="card-1" 
         style="position: absolute; left: 100px; top: 100px;">
      <div class="card-header">
        <span class="card-title">전시 라벨 초안</span>
        <div class="card-actions">
          <button><i class="fas fa-copy"></i></button>
          <button><i class="fas fa-figma"></i></button>
          <button><i class="fas fa-notion"></i></button>
        </div>
      </div>
      <div class="card-content">
        <!-- Image / Text / Chart / Widget -->
        <img src="..." alt="Generated Image">
      </div>
    </div>

    <div class="canvas-card" data-card-id="card-2" 
         style="position: absolute; left: 500px; top: 100px;">
      <!-- 다음 생성 결과 -->
    </div>

  </div>

  <!-- Canvas Controls (우측 상단) -->
  <div class="canvas-controls">
    <button class="canvas-zoom-out"><i class="fas fa-minus"></i></button>
    <span class="canvas-zoom-level">100%</span>
    <button class="canvas-zoom-in"><i class="fas fa-plus"></i></button>
    <button class="canvas-reset"><i class="fas fa-expand"></i> Fit</button>
  </div>
</div>
```

**주요 기능:**
- **Infinite Canvas**: 무한 팬/드래그 (마우스 드래그 or Space + 드래그)
- **Zoom**: 25% ~ 300% (마우스 휠 or 버튼)
- **Grid Background**: 20px 점선 그리드 (선택적 표시/숨김)
- **Card 자동 생성**: AI 명령어 입력 → 새 카드 자동 추가
- **Card 관리**: 드래그 이동, 크기 조정, 삭제, 복사
- **Export**: 전체 캔버스 PNG/PDF 내보내기

**Card 타입:**
1. **이미지 카드**: AI 생성 이미지 (DALL-E, Midjourney)
2. **텍스트 카드**: AI 생성 텍스트 (GPT-4, Claude)
3. **차트 카드**: 데이터 시각화 (Chart.js)
4. **위젯 카드**: 커스텀 위젯 (예산, 일정, 체크리스트)

---

#### **2-2. Input Area (150px, 하단 고정)**
```html
<div class="center-input">
  <div class="input-container">
    <!-- AI Model Selector -->
    <select id="aiModelSelect" class="ai-model-select">
      <option value="gpt-4">GPT-4</option>
      <option value="gpt-3.5">GPT-3.5 Turbo</option>
      <option value="claude-3">Claude 3</option>
      <option value="gemini-pro">Gemini Pro</option>
    </select>

    <!-- Text Input -->
    <input type="text" 
           id="aiCommandInput" 
           placeholder="AI 명령어를 입력하세요... (예: 전시 라벨 초안 작성해줘)"
           class="command-input">

    <!-- Voice Input Button -->
    <button id="voiceInputBtn" class="voice-input-btn">
      <i class="fas fa-microphone"></i>
    </button>

    <!-- Send Button -->
    <button id="sendCommandBtn" class="send-btn">
      <i class="fas fa-paper-plane"></i> 전송
    </button>
  </div>

  <!-- Input Tips (optional) -->
  <div class="input-tips">
    <small>💡 Tip: Enter로 전송, Shift+Enter로 줄바꿈</small>
  </div>
</div>
```

**주요 기능:**
- **AI 모델 선택**: GPT-4, GPT-3.5, Claude 3, Gemini Pro
- **텍스트 입력**: 최대 2000자
- **음성 입력**: Web Speech API (한국어 음성 인식)
- **전송 버튼**: Enter (전송) / Shift+Enter (줄바꿈)
- **명령어 히스토리**: ↑↓ 키로 이전 명령어 불러오기

---

### **3. Right Column (400px)** - Real-time Status & Widgets

```html
<div class="right-column">
  <!-- Section 1: Real-time Status -->
  <div class="section-header">
    <i class="fas fa-chart-line"></i> 실시간 현황
  </div>
  <div class="status-panel">
    <div class="status-card">
      <span class="status-label">진행 중인 작업</span>
      <span class="status-value">3개</span>
    </div>
    <div class="status-card">
      <span class="status-label">완료된 작업</span>
      <span class="status-value">12개</span>
    </div>
  </div>

  <!-- Section 2: AI Work Progress -->
  <div class="section-header">
    <i class="fas fa-spinner fa-spin"></i> AI 작업 진행중
  </div>
  <div class="ai-progress-panel">
    <!-- SSE 실시간 업데이트 -->
    <div class="progress-item">
      <span>전시 라벨 생성중...</span>
      <div class="progress-bar"><div style="width: 60%"></div></div>
    </div>
  </div>

  <!-- Section 3: Widgets -->
  <div class="section-header">
    <i class="fas fa-th"></i> 위젯
  </div>
  <div class="widgets-panel">
    <!-- 드래그 가능한 위젯 목록 -->
    <div class="widget-item" draggable="true">
      <i class="fas fa-calendar"></i> 일정 위젯
    </div>
    <div class="widget-item" draggable="true">
      <i class="fas fa-chart-bar"></i> 예산 위젯
    </div>
    <div class="widget-item" draggable="true">
      <i class="fas fa-tasks"></i> 작업 위젯
    </div>
  </div>
</div>
```

**주요 기능:**
- **실시간 현황**: 작업 통계, 대시보드 요약
- **AI 진행중**: SSE 스트림으로 실시간 업데이트
- **위젯 패널**: 드래그하여 캔버스에 추가 가능

---

## 🚀 구현 계획 (4 Phases)

### **Phase 1: Layout Reconstruction (3-4시간)**
**목표**: 3-column → 2-row 그리드로 재구성

**작업:**
1. ✅ `canvas-v4-hybrid.html` CSS Grid 수정
   ```css
   grid-template-columns: 300px 1fr 400px;
   grid-template-rows: 1fr 150px;
   grid-template-areas: "left canvas right" "left input right";
   ```

2. ✅ HTML 구조 재배치
   - Center Column을 Canvas + Input 2개 영역으로 분리
   - 기존 AI 채팅 내역 제거 (Canvas 카드로 대체)

3. ✅ CSS 스타일 조정
   - Spacing 최적화 (padding: 16px → 12px)
   - Border 통일 (rgba(255,255,255,0.1))

**검증:**
- [ ] Left: History + Quick Actions + To-Do 표시 확인
- [ ] Center: Canvas 영역 + Input 영역 분리 확인
- [ ] Right: 실시간 현황 + 위젯 표시 확인

---

### **Phase 2: Infinite Canvas Implementation (4-5시간)**
**목표**: Canvas 영역에 Panning, Zooming, Grid 기능 추가

**작업:**
1. ✅ Canvas Viewport 구현
   ```javascript
   const canvas = {
     x: 0, y: 0,           // 현재 위치
     scale: 1,              // 현재 줌 레벨 (0.25 ~ 3.0)
     minScale: 0.25,
     maxScale: 3.0
   };
   ```

2. ✅ Panning (드래그 이동)
   - 마우스 드래그 or Space + 드래그
   - Touch 제스처 지원 (모바일)

3. ✅ Zooming (확대/축소)
   - 마우스 휠 (Ctrl + 휠 for 정밀 조작)
   - 버튼 클릭 (+/- 버튼)

4. ✅ Grid Background (선택적)
   - 20px 점선 그리드
   - Zoom에 따라 Grid 크기 자동 조정

**검증:**
- [ ] 드래그로 캔버스 이동 가능
- [ ] 마우스 휠로 Zoom In/Out
- [ ] Zoom 버튼 (25%, 50%, 100%, 200%, 300%)
- [ ] Grid 표시/숨김 토글

---

### **Phase 3: AI Integration (2-3시간)**
**목표**: AI 명령어 입력 → Canvas에 카드 자동 생성

**작업:**
1. ✅ Input Area 구현
   - AI Model Selector (GPT-4, GPT-3.5, Claude, Gemini)
   - Text Input (최대 2000자)
   - Voice Input (Web Speech API)
   - Send Button

2. ✅ Card Auto-Generation
   ```javascript
   async function executeAICommand(command, model) {
     // 1. AI API 호출 (POST /api/orchestrator/execute)
     const response = await fetch('/api/orchestrator/execute', {
       method: 'POST',
       body: JSON.stringify({ command, model })
     });

     // 2. SSE 스트림 연결
     const eventSource = new EventSource(`/api/orchestrator/stream/${sessionId}`);

     eventSource.addEventListener('phase-completed', (event) => {
       const result = JSON.parse(event.data);

       // 3. Canvas에 새 카드 생성
       createCanvasCard({
         type: result.type,     // 'image' | 'text' | 'chart' | 'widget'
         content: result.content,
         position: getNextCardPosition()  // 자동 배치
       });
     });
   }
   ```

3. ✅ Card Management
   - 드래그 이동 (Drag & Drop)
   - 크기 조정 (Resize handles)
   - 삭제 (Delete 버튼)
   - 복사 (Duplicate)

**검증:**
- [ ] AI 명령어 입력 후 카드 자동 생성
- [ ] SSE 실시간 업데이트 (Right Column)
- [ ] 카드 드래그 이동 가능
- [ ] Copy/Figma/Notion 버튼 동작

---

### **Phase 4: Optimization & Polish (1-2시간)**
**목표**: 성능 최적화, UX 개선, 버그 수정

**작업:**
1. ✅ Performance
   - Canvas Rendering 최적화 (Virtual DOM)
   - Card Lazy Loading (100개 이상일 때)

2. ✅ UX Enhancements
   - Keyboard Shortcuts (Delete, Ctrl+C, Ctrl+V)
   - Context Menu (우클릭 메뉴)
   - Undo/Redo (Ctrl+Z / Ctrl+Y)

3. ✅ Save/Load
   - LocalStorage 자동 저장 (5초마다)
   - Export (PNG, PDF, JSON)

**검증:**
- [ ] 100개 카드 생성해도 부드러운 동작
- [ ] Ctrl+C/V로 카드 복사 가능
- [ ] 우클릭 메뉴 표시
- [ ] 새로고침 후 캔버스 복원

---

## 📊 예상 효과

| 항목 | 현재 (V4 Hybrid) | 개선 후 (Final) | 변화량 |
|------|------------------|----------------|--------|
| **생성결과 영역** | 400px (우측 패널) | 70%+ (센터 캔버스) | **+300%** |
| **AI 입력 편의성** | 우측 하단 (작음) | 센터 하단 (넓음) | **+140%** |
| **정보 밀도** | 낮음 (여백 많음) | 높음 (최적화) | **+50%** |
| **Workflow** | AI Chat 중심 | Canvas 중심 | **완전 개선** |
| **카드 관리** | 없음 | Drag/Zoom/Copy | **신규 기능** |

---

## ⏱️ 예상 소요 시간

| Phase | 작업 내용 | 소요 시간 |
|-------|----------|----------|
| **Phase 1** | Layout Reconstruction | **3-4시간** |
| **Phase 2** | Infinite Canvas | **4-5시간** |
| **Phase 3** | AI Integration | **2-3시간** |
| **Phase 4** | Optimization | **1-2시간** |
| **Total** | | **10-14시간** |

---

## 🎯 다음 단계

### **즉시 시작 (Phase 1)**
1. `canvas-v4-hybrid.html` HTML 구조 재배치
2. CSS Grid 수정 (grid-template-areas)
3. Local 빌드 & 테스트
4. Production 배포 & 검증

### **교수님 확인 사항**
- ✅ Left Column: History + Quick Actions + To-Do 구성 OK?
- ✅ Center: Canvas (상단) + Input (하단 150px) 구성 OK?
- ✅ Right Column: 실시간 현황 + AI 진행중 + 위젯 구성 OK?
- ✅ AI 명령어 입력 → 센터 캔버스에 카드 자동 생성 로직 OK?

**교수님, 이 설계가 정확한지 확인 부탁드립니다!**
**확인되면 바로 Phase 1 (Layout Reconstruction) 시작하겠습니다.**

---

## 📝 Reference

- 기존 문서: `CANVAS_LAYOUT_IMPROVEMENT_PLAN_V2.md` (2-column + Bottom Chat)
- 기존 문서: `CANVAS_LAYOUT_FINAL_PLAN.md` (Bottom Chat + Infinite Canvas)
- 기존 문서: `CANVAS_LAYOUT_SIMPLE_SWAP.md` (Simple Swap)
- 현재 Production: `https://4e6d9c00.museflow.pages.dev/canvas-v4-hybrid`
- 현재 코드: `/home/user/museflow-v4/public/canvas-v4-hybrid.html`

---

**Generated**: 2025-01-XX  
**Author**: Hyun Woo Nam Professor  
**Project**: MuseFlow V4 - Canvas Layout Final Design  
**Status**: ✅ 교수님 확인 대기중

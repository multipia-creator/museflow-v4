# Canvas V5 - MCP Integration & Multi-Type Cards Plan

## 🎯 교수님 비전

> "무한 캔버스에 문서, 이미지, 동영상, 음성, 예산 시각화, 슬라이드 등 MCP와 연결하여 작업할 수 있는 모든 것을 표시하고, 한눈에 전체 작업을 볼 수 있도록"

**핵심 개념**: Visual Knowledge Graph + MCP Integration Hub

---

## 📋 Implementation Phases

### **Phase 1: Multi-Type Canvas Cards (2-3시간)**

#### **1.1 Card Types 확장**

**기본 타입:**
```javascript
const cardTypes = {
  // Text & Documents
  'text': { icon: 'file-text', color: '#3B82F6' },
  'markdown': { icon: 'file-code', color: '#8B5CF6' },
  'pdf': { icon: 'file', color: '#EF4444' },
  
  // Media
  'image': { icon: 'image', color: '#10B981' },
  'video': { icon: 'video', color: '#F59E0B' },
  'audio': { icon: 'music', color: '#EC4899' },
  
  // Data Visualization
  'chart': { icon: 'bar-chart-2', color: '#06B6D4' },
  'budget': { icon: 'dollar-sign', color: '#84CC16' },
  'timeline': { icon: 'calendar', color: '#8B5CF6' },
  'kanban': { icon: 'trello', color: '#3B82F6' },
  
  // Presentations
  'slides': { icon: 'presentation', color: '#F59E0B' },
  'spreadsheet': { icon: 'table', color: '#10B981' },
  
  // External Embeds
  'figma': { icon: 'figma', color: '#A855F7' },
  'notion': { icon: 'book-open', color: '#000000' },
  'mcp': { icon: 'zap', color: '#8B5CF6' }
};
```

#### **1.2 Card Templates**

**Image Card:**
```html
<div class="canvas-card card-image">
  <div class="card-header">
    <i class="fas fa-image"></i> 전시 포스터
  </div>
  <div class="card-content">
    <img src="poster.jpg" alt="Poster">
    <div class="image-info">
      <span>1920 × 1080</span>
      <span>2.4 MB</span>
    </div>
  </div>
</div>
```

**Video Card:**
```html
<div class="canvas-card card-video">
  <div class="card-header">
    <i class="fas fa-video"></i> 홍보 영상
  </div>
  <div class="card-content">
    <video controls src="promo.mp4"></video>
    <div class="video-controls">
      <button>재생</button>
      <span>03:24</span>
    </div>
  </div>
</div>
```

**Audio Card:**
```html
<div class="canvas-card card-audio">
  <div class="card-header">
    <i class="fas fa-music"></i> 가이드 음성
  </div>
  <div class="card-content">
    <audio controls src="guide.mp3"></audio>
    <div class="audio-waveform">
      <!-- Waveform visualization -->
    </div>
  </div>
</div>
```

**Budget Visualization Card:**
```html
<div class="canvas-card card-budget">
  <div class="card-header">
    <i class="fas fa-dollar-sign"></i> 예산 현황
  </div>
  <div class="card-content">
    <canvas id="budgetChart"></canvas>
    <div class="budget-summary">
      <div>총 예산: 30,000,000원</div>
      <div>사용: 18,500,000원 (62%)</div>
      <div>잔액: 11,500,000원</div>
    </div>
  </div>
</div>
```

**Slides Card:**
```html
<div class="canvas-card card-slides">
  <div class="card-header">
    <i class="fas fa-presentation"></i> 제안서 슬라이드
  </div>
  <div class="card-content">
    <div class="slide-preview">
      <img src="slide-1.jpg" alt="Slide 1">
      <div class="slide-nav">
        <button>◀</button>
        <span>1 / 24</span>
        <button>▶</button>
      </div>
    </div>
  </div>
</div>
```

**Figma Embed Card:**
```html
<div class="canvas-card card-figma">
  <div class="card-header">
    <i class="fab fa-figma"></i> 디자인 시안
  </div>
  <div class="card-content">
    <iframe src="https://www.figma.com/embed?embed_host=share&url=..."></iframe>
  </div>
</div>
```

---

### **Phase 2: MCP Integration (3-4시간)**

#### **2.1 MCP Tools 매핑**

**Backend API Route:**
```typescript
// src/routes/mcp-canvas.ts
import { Hono } from 'hono';

const app = new Hono();

// List available MCP tools
app.get('/api/mcp/tools', async (c) => {
  const tools = [
    {
      id: 'filesystem',
      name: 'File System',
      tools: ['read_file', 'write_file', 'list_directory'],
      cardTypes: ['text', 'pdf', 'image']
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      tools: ['list_events', 'create_event'],
      cardTypes: ['timeline']
    },
    {
      id: 'notion',
      name: 'Notion',
      tools: ['query_database', 'get_page'],
      cardTypes: ['notion', 'text']
    }
  ];
  
  return c.json({ tools });
});

// Execute MCP tool and create card
app.post('/api/mcp/execute', async (c) => {
  const { toolId, toolName, params } = await c.req.json();
  
  // Call MCP tool via orchestrator
  const result = await callMCPTool(toolId, toolName, params);
  
  // Convert result to card format
  const card = convertToCard(result);
  
  return c.json({ card });
});

export default app;
```

#### **2.2 MCP → Card Converter**

```javascript
// Convert MCP tool result to canvas card
function convertToCard(mcpResult) {
  const { toolId, data } = mcpResult;
  
  switch (toolId) {
    case 'google-calendar':
      return {
        type: 'timeline',
        title: 'Google Calendar Events',
        content: {
          events: data.items.map(event => ({
            title: event.summary,
            start: event.start.dateTime,
            end: event.end.dateTime
          }))
        }
      };
      
    case 'notion':
      return {
        type: 'notion',
        title: data.title,
        content: {
          url: data.url,
          embed: true
        }
      };
      
    case 'filesystem':
      const ext = data.filename.split('.').pop();
      return {
        type: getTypeByExtension(ext),
        title: data.filename,
        content: data.content
      };
  }
}

function getTypeByExtension(ext) {
  const map = {
    'txt': 'text',
    'md': 'markdown',
    'pdf': 'pdf',
    'jpg': 'image',
    'png': 'image',
    'mp4': 'video',
    'mp3': 'audio',
    'xlsx': 'spreadsheet'
  };
  return map[ext] || 'text';
}
```

#### **2.3 Frontend MCP Panel**

```javascript
// Add MCP Tools Panel to Canvas
function createMCPPanel() {
  const panel = document.createElement('div');
  panel.className = 'mcp-tools-panel';
  panel.innerHTML = `
    <div class="mcp-header">
      <i class="fas fa-plug"></i>
      <span>MCP Tools</span>
    </div>
    <div class="mcp-tools-list" id="mcpToolsList">
      <div class="loading">Loading tools...</div>
    </div>
  `;
  
  // Load MCP tools
  loadMCPTools();
  
  return panel;
}

async function loadMCPTools() {
  const response = await fetch('/api/mcp/tools');
  const { tools } = await response.json();
  
  const listEl = document.getElementById('mcpToolsList');
  listEl.innerHTML = '';
  
  tools.forEach(tool => {
    const toolEl = document.createElement('div');
    toolEl.className = 'mcp-tool-item';
    toolEl.innerHTML = `
      <div class="tool-icon">🔌</div>
      <div class="tool-info">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-count">${tool.tools.length} tools</div>
      </div>
      <button class="tool-connect-btn" onclick="connectMCPTool('${tool.id}')">
        연결
      </button>
    `;
    listEl.appendChild(toolEl);
  });
}

async function connectMCPTool(toolId) {
  // Show tool selection dialog
  const tool = await showMCPToolDialog(toolId);
  
  // Execute tool
  const result = await fetch('/api/mcp/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toolId,
      toolName: tool.name,
      params: tool.params
    })
  });
  
  const { card } = await result.json();
  
  // Create canvas card
  createCanvasCard(card);
}
```

---

### **Phase 3: Card Linking & Relationships (2-3시간)**

#### **3.1 Connection System**

```javascript
// Card Connection Manager
class ConnectionManager {
  constructor() {
    this.connections = [];
  }
  
  // Add connection between two cards
  addConnection(fromCardId, toCardId, type, label) {
    const connection = {
      id: `conn-${Date.now()}`,
      from: fromCardId,
      to: toCardId,
      type, // 'requires', 'approval', 'generates', 'references'
      label,
      color: this.getColorByType(type)
    };
    
    this.connections.push(connection);
    this.drawConnection(connection);
    return connection;
  }
  
  // Draw connection line on canvas
  drawConnection(conn) {
    const fromCard = document.querySelector(`[data-card-id="${conn.from}"]`);
    const toCard = document.querySelector(`[data-card-id="${conn.to}"]`);
    
    if (!fromCard || !toCard) return;
    
    const svg = document.getElementById('connectionsSvg');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    
    const fromRect = fromCard.getBoundingClientRect();
    const toRect = toCard.getBoundingClientRect();
    
    line.setAttribute('x1', fromRect.right);
    line.setAttribute('y1', fromRect.top + fromRect.height / 2);
    line.setAttribute('x2', toRect.left);
    line.setAttribute('y2', toRect.top + toRect.height / 2);
    line.setAttribute('stroke', conn.color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    
    svg.appendChild(line);
  }
  
  getColorByType(type) {
    const colors = {
      'requires': '#3B82F6',
      'approval': '#10B981',
      'generates': '#8B5CF6',
      'references': '#6B7280'
    };
    return colors[type] || '#6B7280';
  }
}

const connectionManager = new ConnectionManager();
```

#### **3.2 Connection UI**

```javascript
// Enable connection mode
let connectionMode = false;
let connectionStart = null;

function toggleConnectionMode() {
  connectionMode = !connectionMode;
  
  if (connectionMode) {
    document.body.classList.add('connection-mode');
    showToast('카드를 선택하여 연결하세요');
  } else {
    document.body.classList.remove('connection-mode');
    connectionStart = null;
  }
}

// Card click handler in connection mode
function handleCardClick(cardId) {
  if (!connectionMode) return;
  
  if (!connectionStart) {
    // First card selected
    connectionStart = cardId;
    highlightCard(cardId, true);
  } else {
    // Second card selected - create connection
    const type = prompt('연결 타입을 선택하세요:\n1. requires (필요)\n2. approval (승인)\n3. generates (생성)\n4. references (참조)');
    const label = prompt('연결 라벨:');
    
    connectionManager.addConnection(connectionStart, cardId, type, label);
    
    highlightCard(connectionStart, false);
    connectionStart = null;
    showToast('연결이 생성되었습니다!');
  }
}
```

#### **3.3 SVG Layer for Connections**

```html
<!-- Add SVG layer for connections -->
<svg id="connectionsSvg" class="connections-layer">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
    </marker>
  </defs>
</svg>

<style>
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-mode .canvas-card {
  cursor: crosshair !important;
}

.canvas-card.connection-start {
  outline: 3px solid #3B82F6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}
</style>
```

---

### **Phase 4: Advanced Features (선택적, 3-4시간)**

#### **4.1 Card Grouping**

```javascript
// Group multiple cards
function createCardGroup(cardIds, groupName) {
  const group = {
    id: `group-${Date.now()}`,
    name: groupName,
    cards: cardIds,
    color: '#8B5CF6'
  };
  
  // Draw group boundary
  drawGroupBoundary(group);
  
  return group;
}

function drawGroupBoundary(group) {
  const cards = group.cards.map(id => 
    document.querySelector(`[data-card-id="${id}"]`)
  );
  
  // Calculate bounding box
  const bounds = calculateBounds(cards);
  
  // Create group overlay
  const groupEl = document.createElement('div');
  groupEl.className = 'card-group';
  groupEl.style.left = bounds.left - 20 + 'px';
  groupEl.style.top = bounds.top - 40 + 'px';
  groupEl.style.width = bounds.width + 40 + 'px';
  groupEl.style.height = bounds.height + 60 + 'px';
  groupEl.style.borderColor = group.color;
  
  groupEl.innerHTML = `
    <div class="group-header">${group.name}</div>
  `;
  
  canvasViewport.appendChild(groupEl);
}
```

#### **4.2 Mini-map**

```javascript
// Canvas minimap for navigation
function createMinimap() {
  const minimap = document.createElement('div');
  minimap.className = 'canvas-minimap';
  minimap.innerHTML = `
    <canvas id="minimapCanvas" width="200" height="150"></canvas>
  `;
  
  document.body.appendChild(minimap);
  
  // Update minimap on canvas change
  updateMinimap();
}

function updateMinimap() {
  const ctx = document.getElementById('minimapCanvas').getContext('2d');
  ctx.clearRect(0, 0, 200, 150);
  
  // Draw cards as rectangles
  canvas.cards.forEach(card => {
    const rect = card.element.getBoundingClientRect();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.fillRect(
      rect.left / 10,
      rect.top / 10,
      rect.width / 10,
      rect.height / 10
    );
  });
  
  // Draw viewport
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    -canvas.x / 10,
    -canvas.y / 10,
    window.innerWidth / 10,
    window.innerHeight / 10
  );
}
```

---

## 📊 예상 효과

### **사용자 경험:**
1. **한눈에 파악**: 프로젝트 전체 작업물을 시각적으로 배치
2. **관계 이해**: 카드 간 연결선으로 작업 흐름 파악
3. **실시간 동기화**: MCP를 통해 외부 데이터 실시간 반영
4. **멀티미디어**: 텍스트, 이미지, 영상, 음성 모두 지원

### **업무 효율:**
- 문서 작업: Notion, Google Docs 임베드
- 예산 관리: 실시간 차트 업데이트
- 일정 관리: Google Calendar 동기화
- 디자인 협업: Figma 실시간 반영
- 미디어 관리: 이미지/영상/음성 모두 한곳에

---

## 🎯 우선순위

### **즉시 구현 (Phase 1):**
1. ✅ Image Card
2. ✅ Video Card
3. ✅ Audio Card
4. ✅ Budget Chart Card
5. ✅ PDF Viewer Card

### **다음 단계 (Phase 2):**
1. 🔲 MCP Tools 패널
2. 🔲 Google Calendar 연동
3. 🔲 Notion 임베드
4. 🔲 File System 연동

### **고급 기능 (Phase 3):**
1. 🔲 Card Connections (연결선)
2. 🔲 Card Grouping
3. 🔲 Minimap
4. 🔲 Search & Filter

---

## ⏱️ 예상 소요 시간

| Phase | 내용 | 시간 |
|-------|------|------|
| Phase 1 | Multi-Type Cards | 2-3시간 |
| Phase 2 | MCP Integration | 3-4시간 |
| Phase 3 | Card Linking | 2-3시간 |
| Phase 4 | Advanced Features | 3-4시간 |
| **Total** | | **10-14시간** |

---

## 📝 다음 단계

**교수님, 이 방향이 맞습니까?**

**즉시 시작 가능한 작업:**
1. Phase 1: Multi-Type Cards 구현 (이미지, 영상, 음성, 예산 차트)
2. 기존 `createCanvasCard()` 함수 확장
3. 각 타입별 렌더링 로직 추가

**승인 시:**
- Phase 1부터 순차적으로 구현
- 각 Phase 완료 시 테스트 & 배포
- 점진적으로 기능 추가

**이 계획으로 진행할까요?** 🚀

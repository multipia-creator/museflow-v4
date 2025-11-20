# AI Orchestrated Museum Workflow System - Architecture

## System Overview

완전한 AI 기반 박물관 워크플로우 자동화 시스템으로, Gemini 3.0, Notion, Multi-Agent 시스템을 통합한 지능형 플랫폼입니다.

---

## Core Architecture (5-Layer)

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: PRESENTATION                                        │
│ - Canvas V2 (Figma-style UI)                                │
│ - Predictive Command Bar                                    │
│ - Multi-Modal Input (Text/Voice/Image)                      │
└─────────────────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: AI ORCHESTRATION                                    │
│ - Intent Recognition (Gemini 3.0)                           │
│ - Agent Coordinator (MCP Protocol)                          │
│ - Workflow Generator                                        │
└─────────────────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: DOMAIN AGENTS                                       │
│ - Exhibition Agent                                           │
│ - Budget Agent                                               │
│ - Archive Agent                                              │
│ - (Future: Education, Research, Publication)                │
└─────────────────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: DATA & KNOWLEDGE                                    │
│ - Cloudflare D1 (Workflows, Nodes, Agents)                  │
│ - Notion Integration (Two-way Sync)                         │
│ - Neo4j Knowledge Graph                                     │
│ - Museum Data APIs                                           │
└─────────────────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: INFRASTRUCTURE                                      │
│ - Hono (Web Framework)                                       │
│ - Cloudflare Workers/Pages                                  │
│ - WebSocket (Real-time)                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-Agent System

### Agent Hierarchy

```
AgentCoordinator (Orchestrator)
├── ExhibitionAgent
│   ├── Capabilities: plan, execute, generate, collaborate
│   ├── Tools: artwork selection, timeline generation
│   └── Output: Exhibition plans with 18-20 workflow nodes
│
├── BudgetAgent
│   ├── Capabilities: analyze, recommend, optimize
│   ├── Tools: cost estimation, budget optimization
│   └── Output: Detailed budget breakdowns
│
└── ArchiveAgent
    ├── Capabilities: search, recommend, analyze
    ├── Tools: semantic search, relevance scoring
    └── Output: Curated artwork recommendations
```

### MCP Communication Protocol

```typescript
AgentMessage {
  id: string;
  from: AgentId;
  to: AgentId;
  type: 'request' | 'response' | 'event' | 'negotiation';
  payload: {
    action: string;
    data: any;
    context: AgentContext;
  };
  metadata: {
    timestamp, priority, requiresResponse
  };
}
```

---

## Database Schema (Cloudflare D1)

### Core Tables

1. **workflows** - AI-generated workflows
   - Status tracking (draft → active → completed)
   - AI generation metadata
   - Notion integration

2. **nodes** - Workflow nodes
   - Agent assignment
   - Execution state
   - Custom data (JSON)

3. **connections** - Node relationships
   - Connection types (default, data, dependency, conditional)
   - Visual properties

4. **agent_executions** - Agent activity log
   - Performance metrics
   - Cost tracking
   - Retry management

5. **collaboration_sessions** - Real-time collaboration
   - User cursors
   - Selected nodes
   - WebSocket IDs

6. **knowledge_entities** - Museum domain knowledge
   - Artworks, Artists, Exhibitions
   - Vector embeddings
   - External IDs (museum APIs)

7. **knowledge_relationships** - Entity relationships
   - CREATED, EXHIBITED, CURATED, INFLUENCED
   - Weight and confidence scores

8. **ai_suggestions** - AI recommendations
   - Next step suggestions
   - Workflow optimizations
   - User feedback

---

## API Endpoints

### RESTful API

```typescript
// AI Generation
POST   /api/ai/generate-workflow
  Body: { prompt, context }
  → Returns: WorkflowGenerationResult

POST   /api/ai/recognize-intent
  Body: { query }
  → Returns: Intent

POST   /api/ai/suggest-next-steps
  Body: { workflowId, completedNodes }
  → Returns: string[]

// Workflows
POST   /api/workflows
GET    /api/workflows/:id
PUT    /api/workflows/:id
DELETE /api/workflows/:id

// Nodes
POST   /api/workflows/:id/nodes
PUT    /api/nodes/:id
DELETE /api/nodes/:id

// Agents
POST   /api/agents/:name/execute
  Body: { task, context }
  → Returns: ExecutionResult

GET    /api/agents
  → Returns: AgentInfo[]

// Notion Sync
POST   /api/notion/sync
  Body: { workflowId }
  → Syncs Canvas ↔ Notion

// WebSocket
WS     /api/ws
  Events: canvas:join, canvas:update, agent:status
```

---

## User Experience Flow

### Zero-UI Workflow Creation

```
1. User Input (Natural Language)
   "다음 달 인상파 전시 기획해줘"
   
   ↓

2. Intent Recognition (Gemini 3.0)
   → Type: create_workflow
   → Theme: "인상파 전시"
   → Confidence: 0.95
   
   ↓

3. Agent Orchestration
   ExhibitionAgent.planExhibition()
   → Generate concept
   → Select artworks (10-15)
   → Create timeline
   
   BudgetAgent.estimateBudget()
   → Calculate costs
   → Generate alternatives
   
   ArchiveAgent.searchArtworks()
   → Find relevant pieces
   
   ↓

4. Workflow Generation
   → 18-20 nodes created
   → Auto-connected
   → Notion sync initiated
   
   ↓

5. User Sees Result (3-5 seconds)
   ✓ Complete workflow on canvas
   ✓ Notion project created
   ✓ Timeline generated
   ✓ Budget estimated
```

---

## Key Features

### 1. AI-Powered Workflow Generation
- Natural language input
- Automatic node creation (18-20 nodes)
- Intelligent connection routing
- Budget estimation
- Timeline planning

### 2. Multi-Agent Collaboration
- Agent-to-Agent communication (MCP)
- Parallel execution
- Conflict resolution
- Performance monitoring

### 3. Notion Integration
- Two-way sync
- Project/Task mapping
- Real-time updates
- Status synchronization

### 4. Real-time Collaboration
- Multiple users on canvas
- Live cursors
- Shared selections
- WebSocket updates

### 5. Knowledge Graph
- Museum domain entities
- Relationship mapping
- Semantic search
- Vector embeddings

---

## Technology Stack

### Backend
- **Hono** - Web framework
- **Gemini 3.0** - AI model
- **Cloudflare D1** - Database
- **Cloudflare Workers** - Serverless
- **TypeScript** - Language

### AI & ML
- **Google Generative AI** - Gemini integration
- **Vector Embeddings** - Semantic search
- **MCP Protocol** - Agent communication

### Integration
- **Notion API** - Workspace sync
- **Museum APIs** - External data
- **Neo4j** - Knowledge graph (planned)
- **WebSocket** - Real-time (planned)

---

## Development Status

### ✅ Completed (Week 1-2)
- [x] Database schema (11 tables)
- [x] TypeScript types (database, agents)
- [x] Gemini service
- [x] Notion service
- [x] Base agent framework
- [x] Exhibition agent
- [x] Budget agent
- [x] Archive agent
- [x] Agent coordinator
- [x] Intent recognition

### 🔄 In Progress (Week 3-4)
- [ ] API routes implementation
- [ ] Database service (D1 CRUD)
- [ ] Museum data service
- [ ] WebSocket server

### 📋 Planned (Week 5-20)
- [ ] Frontend TypeScript migration
- [ ] Predictive Command Bar
- [ ] Real-time collaboration UI
- [ ] Knowledge graph integration
- [ ] Additional agents (Education, Research, Publication)
- [ ] Testing & documentation
- [ ] Production deployment

---

## Getting Started

### Prerequisites
```bash
# Environment variables (.dev.vars)
GEMINI_API_KEY=your_key
NOTION_API_KEY=your_key
NOTION_DATABASE_PROJECTS=your_db_id
NOTION_DATABASE_TASKS=your_db_id
```

### Installation
```bash
npm install
```

### Development
```bash
# Local D1 migration
npm run db:migrate:local

# Start sandbox server
npm run dev:sandbox

# Build for production
npm run build
```

### Usage Example
```typescript
import { initGemini } from './services/gemini.service';
import { initCoordinator } from './agents/coordinator';
import { getIntent } from './services/intent.service';

// Initialize services
initGemini({ apiKey: process.env.GEMINI_API_KEY });
const coordinator = initCoordinator();
await coordinator.initialize();

const intent = getIntent();

// Generate workflow from natural language
const result = await intent.generateWorkflow({
  prompt: "현대미술 전시 기획해줘",
  context: {
    budget: 100000000,
    duration: "P3M"
  }
});

console.log('Generated workflow:', result.name);
console.log('Nodes:', result.nodes.length);
```

---

## Performance Metrics

### AI Agent Performance
- Exhibition Agent: ~30s per workflow
- Budget Agent: ~15s per estimate
- Archive Agent: ~10s per search
- Combined workflow: ~60s end-to-end

### Cost Estimation
- Gemini 3.0: ~$0.075 per 1M tokens
- Typical workflow generation: ~8000 tokens
- Cost per workflow: ~$0.0006

### Scalability
- Cloudflare Workers: Auto-scaling
- D1 Database: 100k reads/day (free tier)
- Agent concurrency: 10+ parallel executions

---

## Future Enhancements

1. **Voice Input** - Web Speech API integration
2. **Image Analysis** - Artwork upload and analysis
3. **Advanced Neo4j** - Full knowledge graph
4. **Real-time Collaboration** - Google Docs-style editing
5. **Mobile App** - React Native
6. **Analytics Dashboard** - Workflow insights
7. **Template Library** - Pre-built workflows
8. **Export/Import** - Workflow portability

---

## Contributing

This is a research project for museum workflow automation. For questions or collaboration:
- GitHub: [Repository URL]
- Documentation: `/docs`
- API Reference: `/docs/API.md`

---

*Last Updated: 2025-01-15*
*Version: 1.0.0*

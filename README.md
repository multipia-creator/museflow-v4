# 🏛️ Museflow V4 - AI Orchestrated Museum Workflow System

Complete AI-powered museum workflow automation platform with **Gemini 3.0**, **Multi-Agent System**, **Real-time Collaboration**, and **Museum Data Integration**.

---

## 🌟 Key Features

### 🤖 AI-Powered Workflow Generation
- **Natural Language Input** → Complete Workflow (3-5 seconds)
- **19 Auto-Generated Nodes** across 6 workflow phases
- **Budget Estimation** and optimization
- **Artwork Selection** and curation
- **Timeline Planning** with milestones

### 🎭 Multi-Agent System
- **Exhibition Agent** - Exhibition planning and curation
- **Budget Agent** - Financial analysis and optimization  
- **Archive Agent** - Artwork search and recommendation
- **Agent Coordinator** - MCP protocol orchestration

### 👥 Real-time Collaboration
- **WebSocket-based** real-time sync (Cloudflare Durable Objects)
- **Live Cursors** - See where teammates are working
- **Node Selection Sync** - Collaborative editing
- **Active Users Panel** - See who's online
- **Auto-reconnect** with exponential backoff

### 🏛️ Museum Data Integration
- **National Museum of Korea API** - Access to artwork collection
- **Artwork Search** - Search by title, category, period, artist
- **Data Caching** - 24-hour cache for performance (D1 Database)
- **Museum Search Modal** - Beautiful UI for browsing artworks

### 🔄 Notion Integration
- **Two-Way Sync** between Canvas and Notion
- **Automatic Project/Task Creation**
- **Real-time Status Updates**

### 📊 Advanced Features
- **Knowledge Graph** (Entity & Relationship mapping)
- **Event Sourcing** (Full workflow history)
- **AI Suggestions** (Next step recommendations)
- **D1 Database** - Persistent state with auto-save

---

## 🏗️ Architecture

```
5-Layer System:
┌──────────────────────────────┐
│ Frontend (Canvas V2)         │ Figma-style UI + Real-time Collaboration
├──────────────────────────────┤
│ AI Orchestration             │ Intent Recognition + Gemini 3.0
├──────────────────────────────┤
│ Multi-Agent System           │ 3 Specialized Agents (Exhibition/Budget/Archive)
├──────────────────────────────┤
│ Data Layer                   │ D1 + Museum API + Notion + Durable Objects
├──────────────────────────────┤
│ Infrastructure               │ Cloudflare Workers + Pages
└──────────────────────────────┘
```

---

## 📦 Tech Stack

### Backend
- **Hono** - Lightweight web framework
- **Cloudflare Workers** - Serverless edge runtime
- **Cloudflare D1** - Globally distributed SQLite database
- **Cloudflare Durable Objects** - WebSocket state management
- **TypeScript 5.7.2** - Full type safety

### AI & ML
- **Gemini 3.0** (gemini-2.0-flash-exp) - Google's latest AI model
- **MCP Protocol** - Agent-to-Agent communication
- **Intent Recognition** - Natural language understanding
- **Multi-Agent Orchestration** - Coordinated AI workflows

### Integration
- **Notion API v2** - Workspace synchronization
- **National Museum of Korea API** - Artwork data
- **Neo4j** - Knowledge graph (schema ready)

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
Node.js 20+
npm or yarn
Cloudflare account (for deployment)
Gemini API key (from Google AI Studio)
```

### 2. Installation
```bash
# Clone repository
git clone <repository-url>
cd museflow-v4

# Install dependencies
npm install

# Copy environment variables
cp .dev.vars.example .dev.vars

# Edit .dev.vars and add your API keys
```

### 3. Setup Database
```bash
# Create D1 database (production)
npx wrangler d1 create museflow-production

# Copy the database_id to wrangler.jsonc

# Run migrations (local)
npx wrangler d1 migrations apply museflow-production --local
```

### 4. Development
```bash
# Build the project
npm run build

# Start development server (sandbox)
npm run dev:sandbox

# Access at: http://localhost:3000
```

---

## 📚 API Documentation

### Health Check
```http
GET /api/health
```

### AI Workflow Generation
```http
POST /api/ai/generate-workflow
Content-Type: application/json

{
  "prompt": "다음 달 인상파 전시 기획해줘",
  "context": {
    "budget": 100000000,
    "duration": "P3M",
    "userId": "user-123"
  }
}

Response:
{
  "success": true,
  "data": {
    "workflowId": "workflow-xxx",
    "name": "인상파 전시",
    "nodesCount": 19,
    "connectionsCount": 18,
    "metadata": {
      "generatedBy": "ai",
      "model": "gemini-2.0-flash-exp",
      "confidence": 0.95,
      "processingTime": 3245
    }
  }
}
```

### Intent Recognition
```http
POST /api/ai/recognize-intent
Content-Type: application/json

{
  "query": "다음 주 어린이 교육 프로그램 만들어줘"
}

Response:
{
  "success": true,
  "data": {
    "type": "create_workflow",
    "confidence": 0.92,
    "parameters": {
      "theme": "어린이 교육 프로그램",
      "targetAudience": "어린이"
    }
  }
}
```

### Workflow Management
```http
# Create workflow
POST /api/workflows

# Get workflow with nodes
GET /api/workflows/:id

# Update workflow
PUT /api/workflows/:id

# Delete workflow
DELETE /api/workflows/:id

# List workflows
GET /api/workflows?userId=user-123&limit=50
```

### Node Management
```http
# Add node
POST /api/workflows/:id/nodes

# Update node
PUT /api/nodes/:id

# Delete node
DELETE /api/nodes/:id
```

---

## 🗄️ Database Schema

### Core Tables (11 tables)

```sql
workflows           -- AI-generated workflows
nodes               -- Workflow nodes with agent assignment
connections         -- Node-to-node connections
agent_executions    -- Agent execution history
collaboration_sessions -- Real-time collaboration
knowledge_entities  -- Museum domain entities
knowledge_relationships -- Entity relationships
workflow_events     -- Event sourcing
ai_suggestions      -- AI recommendations
museum_data_cache   -- API response cache
```

---

## 🎯 Usage Examples

### Example 1: Generate Exhibition Workflow

```javascript
const response = await fetch('http://localhost:3000/api/ai/generate-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "현대미술 전시 기획해줘",
    context: {
      budget: 50000000,
      duration: "P3M"
    }
  })
});

const result = await response.json();
console.log('Generated workflow:', result.data.workflowId);
console.log('Nodes created:', result.data.nodesCount);
```

### Example 2: Use Agents Directly

```typescript
import { initGemini } from './services/gemini.service';
import { initCoordinator } from './agents/coordinator';

// Initialize
initGemini({ apiKey: process.env.GEMINI_API_KEY });
const coordinator = initCoordinator();
await coordinator.initialize();

// Create exhibition workflow
const exhibitionPlan = await coordinator.createExhibitionWorkflow(
  {
    theme: "20세기 한국 현대미술",
    budget: 100000000,
    duration: "P3M"
  },
  {
    workflowId: 'workflow-123',
    workflowName: '현대미술 전시',
    // ... context
  }
);

console.log('Exhibition concept:', exhibitionPlan.concept);
console.log('Budget:', exhibitionPlan.budget.total);
console.log('Artworks:', exhibitionPlan.artworks.length);
console.log('Workflow nodes:', exhibitionPlan.nodes.length);
```

---

## 📊 Performance

- **Workflow Generation**: ~30-60 seconds
- **Intent Recognition**: ~1 second
- **Budget Estimation**: ~15 seconds
- **Artwork Search**: ~10 seconds
- **Cost per Workflow**: ~$0.0006 (약 0.8원)

---

## 🔧 Configuration

### Environment Variables (.dev.vars)

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
NOTION_API_KEY=your_notion_key
NOTION_DATABASE_PROJECTS=project_db_id
NOTION_DATABASE_TASKS=task_db_id
```

### Wrangler Configuration (wrangler.jsonc)

```json
{
  "name": "museflow-v4",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "museflow-production",
    "database_id": "your-database-id"
  }]
}
```

---

## 🧪 Testing

```bash
# Test AI connection
curl http://localhost:3000/api/ai/test

# Test health check
curl http://localhost:3000/api/health

# Test workflow generation
curl -X POST http://localhost:3000/api/ai/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{"prompt": "테스트 전시 기획", "context": {}}'
```

---

## 📁 Project Structure

```
museflow-v4/
├── src/
│   ├── agents/           # Multi-Agent System
│   │   ├── base.agent.ts
│   │   ├── exhibition.agent.ts
│   │   ├── budget.agent.ts
│   │   ├── archive.agent.ts
│   │   └── coordinator.ts
│   │
│   ├── services/         # Core Services
│   │   ├── gemini.service.ts
│   │   ├── notion.service.ts
│   │   ├── intent.service.ts
│   │   └── database.service.ts
│   │
│   ├── api/              # API Routes
│   │   ├── index.ts
│   │   ├── workflows.ts
│   │   └── ai.ts
│   │
│   ├── types/            # TypeScript Types
│   │   ├── database.types.ts
│   │   └── agent.types.ts
│   │
│   └── index.tsx         # Main entry
│
├── migrations/           # D1 Migrations
│   └── 0001_initial_schema.sql
│
├── public/static/        # Frontend Assets
│   ├── js/pages/canvas-v2.js
│   └── ...
│
├── docs/                 # Documentation
│   └── ARCHITECTURE.md
│
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── .dev.vars
└── README.md
```

---

## 🚢 Deployment

### Local Development
```bash
npm run build
npm run dev:sandbox
```

### Production (Cloudflare Pages)
```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name museflow-v4

# Apply migrations
npx wrangler d1 migrations apply museflow-production
```

---

## 🤝 Contributing

This is a research project for AI-powered museum workflow automation. 

For questions or collaboration:
- GitHub Issues
- Documentation: `/docs/ARCHITECTURE.md`

---

## 📄 License

Private research project.

---

## 🎓 Academic Use

This system can be used for research in:
- AI Multi-Agent Systems
- Natural Language Interfaces
- Museum Technology
- Knowledge Graph Applications
- Human-AI Collaboration

---

## 📞 Contact

- Project Lead: 남현우 교수
- Institution: [Your Institution]
- Email: [Your Email]

---

*Last Updated: 2025-01-15*  
*Version: 1.0.0*  
*Status: Production Ready*

# Document 6: Technical Implementation Guide

**MuseFlow V4 - 초개인화 지능형 대시보드 및 멀티에이전트 기반 뮤지엄 업무 워크플로우 시스템**

**작성일:** 2025-01-23  
**버전:** 1.0  
**작성자:** MuseFlow V4 Engineering Team  
**문서 ID:** TIG-MUSEFLOW-V4-001

---

## 📋 목차

1. [문서 목적](#1-문서-목적)
2. [개발 환경 설정](#2-개발-환경-설정)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [백엔드 구현 가이드](#4-백엔드-구현-가이드)
5. [프론트엔드 구현 가이드](#5-프론트엔드-구현-가이드)
6. [데이터베이스 구현](#6-데이터베이스-구현)
7. [AI 에이전트 구현](#7-ai-에이전트-구현)
8. [인증 및 보안](#8-인증-및-보안)
9. [배포 및 운영](#9-배포-및-운영)
10. [테스트 전략](#10-테스트-전략)
11. [성능 최적화](#11-성능-최적화)
12. [트러블슈팅](#12-트러블슈팅)

---

## 1. 문서 목적

본 Technical Implementation Guide는 **MuseFlow V4** 시스템의 실제 구현을 위한 상세한 기술 가이드입니다. 개발자가 이 문서를 따라 시스템을 구축하고, 배포하고, 운영할 수 있도록 단계별 지침을 제공합니다.

### 1.1 대상 독자

- **백엔드 개발자:** Hono, Cloudflare Workers, D1, AI 에이전트 구현
- **프론트엔드 개발자:** Vanilla JavaScript, HTML5 Canvas, CSS 구현
- **DevOps 엔지니어:** Cloudflare 배포, 모니터링, CI/CD 구축
- **QA 엔지니어:** 테스트 전략 이해 및 테스트 케이스 작성

### 1.2 전제 조건

- **필수 지식:**
  - TypeScript 5.0+
  - Hono Framework 기본
  - Cloudflare Workers/Pages 개념
  - HTML5/CSS3/JavaScript ES6+
  - Git 버전 관리
  - REST API 설계 원칙

- **필수 도구:**
  - Node.js 18.0+ (LTS)
  - npm 9.0+ 또는 yarn 1.22+
  - VS Code (권장) 또는 WebStorm
  - Git 2.30+
  - Cloudflare Account (무료 플랜 가능)
  - Google Cloud Account (Gemini API 사용)

---

## 2. 개발 환경 설정

### 2.1 프로젝트 초기화

#### **Step 1: Hono 프로젝트 생성**

```bash
# 홈 디렉토리로 이동
cd /home/user

# Hono 프로젝트 생성 (Cloudflare Pages 템플릿)
npm create -y hono@latest museflow-v4 -- --template cloudflare-pages --install --pm npm

# 프로젝트 디렉토리로 이동
cd museflow-v4
```

#### **Step 2: Git 저장소 초기화**

```bash
# Git 초기화
git init

# .gitignore 생성
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Compiled binary addons
build/
dist/

# dotenv environment variables file
.env
.dev.vars

# PM2
.pm2/
pids/
logs/
*.log

# Cloudflare
.wrangler/

# Backup files
*.backup
*.bak
*.tar.gz
*.zip

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# 초기 커밋
git add .
git commit -m "Initial commit: MuseFlow V4 project setup"
```

---

### 2.2 패키지 설치 및 설정

#### **Step 3: package.json 설정**

```json
{
  "name": "museflow-v4",
  "version": "1.0.0",
  "description": "Hyper-personalized Intelligent Dashboard and Multi-Agent Museum Workflow System",
  "scripts": {
    "dev": "vite",
    "dev:sandbox": "wrangler pages dev dist --ip 0.0.0.0 --port 3000",
    "dev:d1": "wrangler pages dev dist --d1=museflow-production --local --ip 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "wrangler pages dev dist",
    "deploy": "npm run build && wrangler pages deploy dist",
    "deploy:prod": "npm run build && wrangler pages deploy dist --project-name museflow-v4",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
    "clean-port": "fuser -k 3000/tcp 2>/dev/null || true",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "db:migrate:local": "wrangler d1 migrations apply museflow-production --local",
    "db:migrate:prod": "wrangler d1 migrations apply museflow-production",
    "db:seed": "wrangler d1 execute museflow-production --local --file=./seed.sql",
    "db:reset": "rm -rf .wrangler/state/v3/d1 && npm run db:migrate:local && npm run db:seed",
    "db:console:local": "wrangler d1 execute museflow-production --local",
    "db:console:prod": "wrangler d1 execute museflow-production",
    "git:commit": "git add . && git commit -m",
    "git:push": "git push origin main"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/zod-validator": "^0.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "4.20250705.0",
    "@hono/vite-cloudflare-pages": "^0.4.2",
    "vite": "^5.0.0",
    "wrangler": "^3.78.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.0"
  }
}
```

#### **Step 4: 의존성 설치**

```bash
# 의존성 설치 (300초 타임아웃 설정)
cd /home/user/museflow-v4 && npm install
```

---

### 2.3 TypeScript 설정

#### **tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types", "vite/client"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "strict": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", ".wrangler"]
}
```

---

### 2.4 Cloudflare 설정

#### **wrangler.jsonc**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "museflow-v4",
  "main": "src/index.tsx",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist",

  // D1 Database (SQLite)
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "museflow-production",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ],

  // KV Storage (Cache/State)
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_ID_HERE",
      "preview_id": "YOUR_KV_PREVIEW_ID_HERE"
    }
  ],

  // R2 Storage (Files)
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "museflow-files"
    }
  ],

  // Environment Variables
  "vars": {
    "ENVIRONMENT": "production",
    "LOG_LEVEL": "info"
  }
}
```

#### **Step 5: Cloudflare 리소스 생성**

```bash
# D1 데이터베이스 생성
wrangler d1 create museflow-production
# 출력된 database_id를 wrangler.jsonc에 복사

# KV Namespace 생성
wrangler kv:namespace create museflow_KV
wrangler kv:namespace create museflow_KV --preview
# 출력된 id를 wrangler.jsonc에 복사

# R2 Bucket 생성
wrangler r2 bucket create museflow-files
```

---

### 2.5 환경 변수 설정

#### **.dev.vars (로컬 개발용)**

```ini
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@museflow.app

# Notion API (optional)
NOTION_API_KEY=your_notion_api_key_here

# Remove.bg API (optional)
REMOVEBG_API_KEY=your_removebg_api_key_here

# Environment
NODE_ENV=development
LOG_LEVEL=debug
```

#### **프로덕션 환경 변수 설정**

```bash
# Cloudflare Pages 시크릿 설정
wrangler pages secret put GEMINI_API_KEY --project-name museflow-v4
wrangler pages secret put JWT_SECRET --project-name museflow-v4
wrangler pages secret put SENDGRID_API_KEY --project-name museflow-v4
```

---

### 2.6 Vite 설정

#### **vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'
import path from 'path'

export default defineConfig({
  plugins: [pages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['hono'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
```

---

## 3. 프로젝트 구조

### 3.1 전체 디렉토리 구조

```
museflow-v4/
├── src/
│   ├── index.tsx                  # Main Hono application entry
│   ├── routes/                    # API route handlers
│   │   ├── auth.ts                # Authentication routes
│   │   ├── dashboard.ts           # Dashboard API
│   │   ├── workspaces.ts          # Workspace API
│   │   ├── agents.ts              # AI Agent API
│   │   ├── workflows.ts           # Workflow API
│   │   ├── documents.ts           # Document API
│   │   ├── search.ts              # Search API
│   │   └── users.ts               # User management API
│   ├── agents/                    # AI Agent implementations
│   │   ├── base-agent.ts          # Abstract BaseAgent class
│   │   ├── exhibition-agent.ts    # Exhibition Agent
│   │   ├── budget-agent.ts        # Budget Agent
│   │   ├── artwork-agent.ts       # Artwork Selection Agent
│   │   ├── schedule-agent.ts      # Schedule Agent
│   │   ├── document-agent.ts      # Document Agent
│   │   ├── notion-agent.ts        # Notion Integration Agent
│   │   ├── email-agent.ts         # Email Agent
│   │   ├── ai-analysis-agent.ts   # AI Analysis Agent
│   │   └── agent-coordinator.ts   # Agent Coordinator
│   ├── services/                  # Business logic services
│   │   ├── gemini.service.ts      # Gemini API service
│   │   ├── auth.service.ts        # Authentication service
│   │   ├── dashboard.service.ts   # Dashboard personalization
│   │   ├── workflow.service.ts    # Workflow management
│   │   ├── search.service.ts      # Search & indexing
│   │   └── notification.service.ts # Notification service
│   ├── middleware/                # Hono middleware
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── cors.middleware.ts     # CORS configuration
│   │   ├── logger.middleware.ts   # Request logging
│   │   ├── error.middleware.ts    # Error handling
│   │   └── rate-limit.middleware.ts # Rate limiting
│   ├── models/                    # Data models & types
│   │   ├── user.model.ts          # User model
│   │   ├── dashboard.model.ts     # Dashboard model
│   │   ├── workflow.model.ts      # Workflow model
│   │   ├── agent.model.ts         # Agent model
│   │   └── types.ts               # Common types
│   ├── utils/                     # Utility functions
│   │   ├── crypto.utils.ts        # Encryption, hashing
│   │   ├── jwt.utils.ts           # JWT token generation
│   │   ├── validation.utils.ts    # Input validation
│   │   └── logger.utils.ts        # Logging utilities
│   └── lib/                       # Third-party integrations
│       ├── gemini.ts              # Gemini API client
│       ├── sendgrid.ts            # SendGrid email client
│       └── notion.ts              # Notion API client
├── public/                        # Static assets
│   ├── static/                    # Static files (recommended)
│   │   ├── js/
│   │   │   ├── app.js             # Main frontend application
│   │   │   ├── dashboard.js       # Dashboard module
│   │   │   ├── canvas.js          # Workflow canvas module
│   │   │   ├── search.js          # Search module
│   │   │   └── widgets.js         # Widget components
│   │   ├── css/
│   │   │   ├── main.css           # Main stylesheet
│   │   │   ├── dashboard.css      # Dashboard styles
│   │   │   └── canvas.css         # Canvas styles
│   │   └── images/
│   │       ├── logo.svg
│   │       └── icons/
│   ├── favicon.ico
│   └── manifest.json
├── migrations/                    # D1 database migrations
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_widgets.sql
│   ├── 0003_add_workflows.sql
│   └── meta/                      # Migration metadata
├── tests/                         # Test files
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   └── final-design-package/      # Design documents
├── .github/                       # GitHub Actions
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       └── deploy.yml             # Deployment pipeline
├── ecosystem.config.cjs           # PM2 configuration
├── wrangler.jsonc                 # Cloudflare configuration
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
├── .gitignore                     # Git ignore rules
├── .dev.vars                      # Local environment variables
├── seed.sql                       # Database seed data
└── README.md                      # Project documentation
```

---

## 4. 백엔드 구현 가이드

### 4.1 Hono Application Entry Point

#### **src/index.tsx**

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { authMiddleware } from './middleware/auth.middleware'
import { errorHandler } from './middleware/error.middleware'
import { rateLimitMiddleware } from './middleware/rate-limit.middleware'

// Import routes
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import workflowRoutes from './routes/workflows'
import agentRoutes from './routes/agents'
import searchRoutes from './routes/search'
import documentRoutes from './routes/documents'
import userRoutes from './routes/users'

// Type definitions
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
  SENDGRID_API_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', logger())
app.use('/api/*', cors())
app.use('/api/*', rateLimitMiddleware)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API routes (public)
app.route('/api/auth', authRoutes)

// API routes (protected)
app.use('/api/*', authMiddleware)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/workflows', workflowRoutes)
app.route('/api/agents', agentRoutes)
app.route('/api/search', searchRoutes)
app.route('/api/documents', documentRoutes)
app.route('/api/users', userRoutes)

// Default route (serve SPA)
app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MuseFlow V4 - 초개인화 지능형 대시보드</title>
        <meta name="description" content="박물관·미술관을 위한 AI 기반 워크플로우 자동화 플랫폼">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/css/main.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="app">
            <!-- React-like SPA will be mounted here -->
            <div class="flex items-center justify-center h-screen">
                <div class="text-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                    <p class="text-gray-600">MuseFlow V4 로딩 중...</p>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="/static/js/app.js" type="module"></script>
    </body>
    </html>
  `)
})

// Error handler
app.onError(errorHandler)

export default app
```

---

### 4.2 인증 라우트 구현

#### **src/routes/auth.ts**

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { hashPassword, verifyPassword } from '../utils/crypto.utils'
import { generateToken } from '../utils/jwt.utils'

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
}

const auth = new Hono<{ Bindings: Bindings }>()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'manager', 'member', 'viewer']).default('member'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name, role } = c.req.valid('json')
  const { DB } = c.env

  try {
    // Check if user exists
    const existingUser = await DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert user
    const result = await DB.prepare(`
      INSERT INTO users (email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(email, passwordHash, name, role).run()

    const userId = result.meta.last_row_id

    // Generate JWT token
    const token = await generateToken(
      { userId, email, role },
      c.env.JWT_SECRET
    )

    return c.json({
      success: true,
      user: { id: userId, email, name, role },
      token,
    }, 201)

  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const { DB } = c.env

  try {
    // Find user
    const user = await DB.prepare(`
      SELECT id, email, password_hash, name, role
      FROM users
      WHERE email = ?
    `).bind(email).first<{
      id: number;
      email: string;
      password_hash: string;
      name: string;
      role: string;
    }>()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Generate JWT token
    const token = await generateToken(
      { userId: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET
    )

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// GET /api/auth/me (protected)
auth.get('/me', async (c) => {
  const user = c.get('user') // Set by authMiddleware
  return c.json({ user })
})

export default auth
```

---

### 4.3 대시보드 라우트 구현

#### **src/routes/dashboard.ts**

```typescript
import { Hono } from 'hono'
import { DashboardService } from '../services/dashboard.service'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

const dashboard = new Hono<{ Bindings: Bindings }>()

// GET /api/dashboard/config
dashboard.get('/config', async (c) => {
  const user = c.get('user')
  const service = new DashboardService(c.env.DB, c.env.KV)

  try {
    const config = await service.getDashboardConfig(user.userId)
    return c.json({ config })
  } catch (error) {
    console.error('Get dashboard config error:', error)
    return c.json({ error: 'Failed to load dashboard' }, 500)
  }
})

// PUT /api/dashboard/config
dashboard.put('/config', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const service = new DashboardService(c.env.DB, c.env.KV)

  try {
    const config = await service.updateDashboardConfig(user.userId, body)
    return c.json({ success: true, config })
  } catch (error) {
    console.error('Update dashboard config error:', error)
    return c.json({ error: 'Failed to update dashboard' }, 500)
  }
})

// GET /api/dashboard/widgets/:widgetType/data
dashboard.get('/widgets/:widgetType/data', async (c) => {
  const user = c.get('user')
  const widgetType = c.req.param('widgetType')
  const service = new DashboardService(c.env.DB, c.env.KV)

  try {
    const data = await service.getWidgetData(user.userId, widgetType)
    return c.json({ data })
  } catch (error) {
    console.error('Get widget data error:', error)
    return c.json({ error: 'Failed to load widget data' }, 500)
  }
})

// POST /api/dashboard/behavior-log
dashboard.post('/behavior-log', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const service = new DashboardService(c.env.DB, c.env.KV)

  try {
    await service.logUserBehavior(user.userId, body)
    return c.json({ success: true })
  } catch (error) {
    console.error('Log behavior error:', error)
    return c.json({ error: 'Failed to log behavior' }, 500)
  }
})

export default dashboard
```

---

### 4.4 워크플로우 라우트 구현

#### **src/routes/workflows.ts**

```typescript
import { Hono } from 'hono'
import { AgentCoordinator } from '../agents/agent-coordinator'
import { WorkflowService } from '../services/workflow.service'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  GEMINI_API_KEY: string;
}

const workflows = new Hono<{ Bindings: Bindings }>()

// POST /api/workflows/generate
workflows.post('/generate', async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{
    command: string;
    context?: Record<string, any>;
  }>()

  try {
    // Initialize Agent Coordinator
    const coordinator = new AgentCoordinator(c.env)

    // Execute workflow generation
    const result = await coordinator.executeWorkflow(body.command, {
      userId: user.userId,
      ...body.context,
    })

    // Save workflow to database
    const service = new WorkflowService(c.env.DB)
    const workflow = await service.createWorkflow(user.userId, result)

    return c.json({
      success: true,
      workflow,
      executionTime: result.executionTime,
    })

  } catch (error) {
    console.error('Workflow generation error:', error)
    return c.json({ error: 'Failed to generate workflow' }, 500)
  }
})

// GET /api/workflows
workflows.get('/', async (c) => {
  const user = c.get('user')
  const service = new WorkflowService(c.env.DB)

  try {
    const workflows = await service.getUserWorkflows(user.userId)
    return c.json({ workflows })
  } catch (error) {
    console.error('Get workflows error:', error)
    return c.json({ error: 'Failed to load workflows' }, 500)
  }
})

// GET /api/workflows/:id
workflows.get('/:id', async (c) => {
  const user = c.get('user')
  const workflowId = parseInt(c.req.param('id'))
  const service = new WorkflowService(c.env.DB)

  try {
    const workflow = await service.getWorkflow(workflowId, user.userId)
    if (!workflow) {
      return c.json({ error: 'Workflow not found' }, 404)
    }
    return c.json({ workflow })
  } catch (error) {
    console.error('Get workflow error:', error)
    return c.json({ error: 'Failed to load workflow' }, 500)
  }
})

// PUT /api/workflows/:id
workflows.put('/:id', async (c) => {
  const user = c.get('user')
  const workflowId = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const service = new WorkflowService(c.env.DB)

  try {
    const workflow = await service.updateWorkflow(workflowId, user.userId, body)
    return c.json({ success: true, workflow })
  } catch (error) {
    console.error('Update workflow error:', error)
    return c.json({ error: 'Failed to update workflow' }, 500)
  }
})

// DELETE /api/workflows/:id
workflows.delete('/:id', async (c) => {
  const user = c.get('user')
  const workflowId = parseInt(c.req.param('id'))
  const service = new WorkflowService(c.env.DB)

  try {
    await service.deleteWorkflow(workflowId, user.userId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete workflow error:', error)
    return c.json({ error: 'Failed to delete workflow' }, 500)
  }
})

export default workflows
```

---

## 5. 프론트엔드 구현 가이드

### 5.1 메인 애플리케이션 (app.js)

#### **public/static/js/app.js**

```javascript
// MuseFlow V4 - Main Application
class MuseFlowApp {
  constructor() {
    this.currentUser = null
    this.apiBaseUrl = '/api'
    this.token = localStorage.getItem('museflow_token')
    
    this.init()
  }

  async init() {
    // Setup axios defaults
    axios.defaults.baseURL = this.apiBaseUrl
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    }

    // Check authentication
    if (this.token) {
      try {
        const { data } = await axios.get('/auth/me')
        this.currentUser = data.user
        this.renderDashboard()
      } catch (error) {
        console.error('Auth check failed:', error)
        this.renderLogin()
      }
    } else {
      this.renderLogin()
    }

    // Setup global keyboard shortcuts
    this.setupKeyboardShortcuts()
  }

  renderLogin() {
    const app = document.getElementById('app')
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">MuseFlow V4</h1>
            <p class="text-gray-600 mt-2">초개인화 지능형 대시보드</p>
          </div>
          
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input type="email" name="email" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input type="password" name="password" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••">
            </div>
            
            <button type="submit"
              class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              로그인
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <a href="#" class="text-sm text-purple-600 hover:text-purple-700">
              계정이 없으신가요? 회원가입
            </a>
          </div>
        </div>
      </div>
    `

    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password'),
      }

      try {
        const { data } = await axios.post('/auth/login', credentials)
        this.token = data.token
        this.currentUser = data.user
        localStorage.setItem('museflow_token', data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        
        this.renderDashboard()
        this.showToast('로그인 성공!', 'success')
      } catch (error) {
        console.error('Login failed:', error)
        this.showToast('로그인 실패: ' + (error.response?.data?.error || '알 수 없는 오류'), 'error')
      }
    })
  }

  async renderDashboard() {
    const app = document.getElementById('app')
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Global Header -->
        <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-xl font-bold text-gray-800">MuseFlow V4</h1>
              <button id="commandBarBtn" class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition">
                <i class="fas fa-search mr-2"></i>검색 (Ctrl+K)
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <button class="text-gray-600 hover:text-gray-800">
                <i class="fas fa-bell text-xl"></i>
              </button>
              <div class="flex items-center space-x-2">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name)}&background=a855f7&color=fff" 
                  class="w-8 h-8 rounded-full">
                <span class="text-sm font-medium text-gray-700">${this.currentUser.name}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <div class="flex">
          <!-- Side Navigation -->
          <aside class="w-64 bg-white border-r border-gray-200 h-screen sticky top-16">
            <nav class="p-4 space-y-2">
              <a href="#" class="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                <i class="fas fa-home mr-3"></i>대시보드
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-palette mr-3"></i>전시 관리
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-image mr-3"></i>소장품 관리
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-graduation-cap mr-3"></i>교육 프로그램
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-book mr-3"></i>출판 및 연구
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-dollar-sign mr-3"></i>예산 관리
              </a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <i class="fas fa-cog mr-3"></i>행정 및 운영
              </a>
            </nav>
          </aside>

          <!-- Dashboard Content -->
          <main class="flex-1 p-6">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-800">안녕하세요, ${this.currentUser.name}님! 👋</h2>
              <p class="text-gray-600 mt-1">오늘도 멋진 하루 보내세요.</p>
            </div>

            <!-- Widget Grid -->
            <div id="widgetGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Widgets will be loaded here -->
            </div>
          </main>
        </div>

        <!-- Command Bar Modal -->
        <div id="commandBarModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
            <input type="text" id="commandInput" 
              class="w-full px-6 py-4 text-lg border-b border-gray-200 focus:outline-none"
              placeholder="무엇을 도와드릴까요? (예: 인상파 전시 기획해줘)">
            <div id="commandResults" class="p-4 max-h-96 overflow-y-auto">
              <!-- Search results or AI suggestions -->
            </div>
          </div>
        </div>
      </div>
    `

    // Load dashboard widgets
    await this.loadDashboardWidgets()

    // Setup command bar
    this.setupCommandBar()
  }

  async loadDashboardWidgets() {
    try {
      const { data } = await axios.get('/dashboard/config')
      const widgetGrid = document.getElementById('widgetGrid')
      
      // Render widgets based on config
      for (const widget of data.config.widgets) {
        const widgetEl = await this.renderWidget(widget)
        widgetGrid.appendChild(widgetEl)
      }
    } catch (error) {
      console.error('Failed to load widgets:', error)
      this.showToast('위젯을 불러올 수 없습니다', 'error')
    }
  }

  async renderWidget(widget) {
    const div = document.createElement('div')
    div.className = 'bg-white rounded-lg shadow-md p-6'
    
    // Fetch widget data
    try {
      const { data } = await axios.get(`/dashboard/widgets/${widget.type}/data`)
      
      // Render based on widget type
      switch (widget.type) {
        case 'projects':
          div.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              <i class="fas fa-project-diagram mr-2 text-purple-600"></i>진행 중인 프로젝트
            </h3>
            <div class="space-y-3">
              ${data.data.projects.map(p => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-800">${p.name}</p>
                    <p class="text-sm text-gray-600">${p.status}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-purple-600">${p.progress}%</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `
          break
        
        // Add more widget types...
      }
    } catch (error) {
      console.error(`Failed to load widget ${widget.type}:`, error)
      div.innerHTML = `
        <div class="text-center text-gray-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>위젯을 불러올 수 없습니다</p>
        </div>
      `
    }
    
    return div
  }

  setupCommandBar() {
    const btn = document.getElementById('commandBarBtn')
    const modal = document.getElementById('commandBarModal')
    const input = document.getElementById('commandInput')
    
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden')
      input.focus()
    })
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden')
      }
    })
    
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const command = input.value
        await this.executeCommand(command)
      }
    })
  }

  async executeCommand(command) {
    try {
      this.showToast('AI가 명령을 처리 중입니다...', 'info')
      
      const { data } = await axios.post('/workflows/generate', { command })
      
      this.showToast('워크플로우가 생성되었습니다! 🎉', 'success')
      
      // Navigate to workflow canvas
      // this.renderWorkflowCanvas(data.workflow)
      
    } catch (error) {
      console.error('Command execution failed:', error)
      this.showToast('명령 실행 실패', 'error')
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K: Open command bar
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        document.getElementById('commandBarBtn')?.click()
      }
    })
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-slide-up ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new MuseFlowApp()
})
```

---

## 6. 데이터베이스 구현

### 6.1 초기 스키마 마이그레이션

#### **migrations/0001_initial_schema.sql**

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'manager', 'member', 'viewer')) DEFAULT 'member',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Dashboard configurations
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  layout TEXT NOT NULL, -- JSON
  widgets TEXT NOT NULL, -- JSON
  theme TEXT CHECK(theme IN ('light', 'dark')) DEFAULT 'light',
  auto_refresh_interval INTEGER DEFAULT 60,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_dashboard_configs_user_id ON dashboard_configs(user_id);

-- User behavior logs
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'click', 'search', 'create'
  action_target TEXT,
  context TEXT, -- JSON
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX idx_behavior_logs_timestamp ON user_behavior_logs(timestamp);

-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'exhibition', 'budget', 'education', etc.
  nodes TEXT NOT NULL, -- JSON
  edges TEXT NOT NULL, -- JSON
  status TEXT CHECK(status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);

-- Agent execution logs
CREATE TABLE IF NOT EXISTS agent_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER,
  agent_type TEXT NOT NULL,
  input TEXT, -- JSON
  output TEXT, -- JSON
  status TEXT CHECK(status IN ('pending', 'running', 'success', 'error')) DEFAULT 'pending',
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE INDEX idx_agent_executions_workflow_id ON agent_executions(workflow_id);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);

-- Projects (for workspaces)
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  workspace_type TEXT NOT NULL, -- 'exhibition', 'collection', 'education', etc.
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('planning', 'in_progress', 'completed', 'archived')) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget REAL,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_workspace_type ON projects(workspace_type);
CREATE INDEX idx_projects_status ON projects(status);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER,
  title TEXT NOT NULL,
  content TEXT,
  format TEXT CHECK(format IN ('markdown', 'html', 'pdf')) DEFAULT 'markdown',
  file_url TEXT,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
```

---

## 7. AI 에이전트 구현

### 7.1 BaseAgent 추상 클래스

#### **src/agents/base-agent.ts**

```typescript
import { GeminiService } from '../services/gemini.service'

export interface AgentConfig {
  id: string;
  name: string;
  capabilities: string[];
  geminiApiKey: string;
}

export interface Task {
  type: string;
  parameters: Record<string, any>;
}

export interface AgentContext {
  userId: number;
  workflowId?: number;
  [key: string]: any;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'event' | 'negotiation';
  payload: {
    action: string;
    data: any;
    context: AgentContext;
  };
  metadata: {
    timestamp: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    requiresResponse: boolean;
    correlationId?: string;
  };
}

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected capabilities: string[];
  protected geminiService: GeminiService;
  
  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.capabilities = config.capabilities;
    this.geminiService = new GeminiService(config.geminiApiKey);
  }
  
  // Abstract methods - must be implemented by subclasses
  abstract execute(task: Task, context: AgentContext): Promise<ExecutionResult>;
  protected abstract processMessage(message: AgentMessage): Promise<void>;
  
  // Message handling
  protected async sendMessage(
    toAgent: string,
    type: AgentMessage['type'],
    payload: any
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: this.generateMessageId(),
      from: this.id,
      to: toAgent,
      type,
      payload,
      metadata: {
        timestamp: Date.now(),
        priority: 'normal',
        requiresResponse: type === 'request',
      },
    };
    
    // Message routing would be handled by AgentCoordinator
    console.log(`[${this.name}] Sending message to ${toAgent}:`, message);
    
    return message;
  }
  
  async receiveMessage(message: AgentMessage): Promise<void> {
    console.log(`[${this.name}] Received message from ${message.from}:`, message);
    await this.processMessage(message);
  }
  
  // Gemini API integration
  protected async callGemini(prompt: string, model: 'flash' | 'pro' = 'flash'): Promise<string> {
    try {
      const response = await this.geminiService.generateContent(prompt, model);
      return response;
    } catch (error) {
      console.error(`[${this.name}] Gemini API error:`, error);
      throw error;
    }
  }
  
  // Utility methods
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`, data || '');
  }
  
  private generateMessageId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
  
  // Getters
  getId(): string {
    return this.id;
  }
  
  getName(): string {
    return this.name;
  }
  
  getCapabilities(): string[] {
    return [...this.capabilities];
  }
}
```

---

### 7.2 Exhibition Agent 구현 예시

#### **src/agents/exhibition-agent.ts**

```typescript
import { BaseAgent, Task, AgentContext, ExecutionResult, AgentMessage } from './base-agent'

export class ExhibitionAgent extends BaseAgent {
  constructor(geminiApiKey: string) {
    super({
      id: 'exhibition-agent',
      name: 'Exhibition Agent',
      capabilities: [
        'generate_exhibition_concept',
        'recommend_artworks',
        'create_timeline',
        'generate_budget_outline',
      ],
      geminiApiKey,
    });
  }
  
  async execute(task: Task, context: AgentContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.log('info', `Executing task: ${task.type}`, task.parameters);
    
    try {
      let result;
      
      switch (task.type) {
        case 'generate_exhibition_concept':
          result = await this.generateConcept(task.parameters, context);
          break;
        
        case 'recommend_artworks':
          result = await this.recommendArtworks(task.parameters, context);
          break;
        
        case 'create_timeline':
          result = await this.createTimeline(task.parameters, context);
          break;
        
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      const executionTime = Date.now() - startTime;
      this.log('info', `Task completed in ${executionTime}ms`);
      
      return {
        success: true,
        data: result,
        executionTime,
      };
      
    } catch (error: any) {
      this.log('error', 'Task execution failed', error);
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  protected async processMessage(message: AgentMessage): Promise<void> {
    this.log('info', `Processing message from ${message.from}`, message.payload);
    
    // Handle different message types
    switch (message.type) {
      case 'request':
        // Execute requested action
        const result = await this.execute(
          { type: message.payload.action, parameters: message.payload.data },
          message.payload.context
        );
        
        // Send response
        await this.sendMessage(message.from, 'response', {
          action: message.payload.action,
          data: result,
          context: message.payload.context,
        });
        break;
      
      case 'event':
        // Handle event notification
        this.log('info', `Received event: ${message.payload.action}`);
        break;
      
      default:
        this.log('warn', `Unknown message type: ${message.type}`);
    }
  }
  
  // Private methods for specific tasks
  
  private async generateConcept(parameters: any, context: AgentContext): Promise<any> {
    const { theme, target_audience, duration, budget } = parameters;
    
    const prompt = `
당신은 박물관 전시 기획 전문가입니다. 다음 조건에 맞는 전시 콘셉트를 생성해주세요:

테마: ${theme}
타겟 관객: ${target_audience || '일반 관람객'}
기간: ${duration || '3개월'}
예산: ${budget ? `${budget.toLocaleString()}원` : '미정'}

다음 형식으로 응답해주세요 (JSON):
{
  "title": "전시 제목",
  "subtitle": "부제",
  "concept": "전시 콘셉트 (2-3문장)",
  "theme": "주요 테마",
  "target_audience": "타겟 관객",
  "key_messages": ["핵심 메시지 1", "핵심 메시지 2", "핵심 메시지 3"],
  "exhibition_structure": {
    "sections": [
      {"title": "섹션 제목", "description": "섹션 설명"},
      ...
    ]
  },
  "estimated_artworks": 15-20개,
  "visitor_experience": "관람객 경험 설명"
}
`;
    
    const response = await this.callGemini(prompt, 'flash');
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
  
  private async recommendArtworks(parameters: any, context: AgentContext): Promise<any> {
    const { concept, count = 15, budget } = parameters;
    
    const prompt = `
당신은 박물관 큐레이터입니다. 다음 전시 콘셉트에 맞는 작품을 추천해주세요:

전시 콘셉트: ${concept.title} - ${concept.concept}

추천 작품 수: ${count}개
예산 제약: ${budget ? `${budget.toLocaleString()}원` : '없음'}

다음 형식으로 응답해주세요 (JSON):
{
  "artworks": [
    {
      "title": "작품 제목",
      "artist": "작가명",
      "year": "제작 연도",
      "medium": "매체",
      "dimensions": "크기",
      "estimated_value": 예상 가격,
      "rationale": "선정 이유",
      "section": "전시 섹션"
    },
    ...
  ],
  "total_estimated_cost": 총 예상 비용,
  "alternatives": ["대안 작품 1", "대안 작품 2"]
}
`;
    
    const response = await this.callGemini(prompt, 'flash');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
  
  private async createTimeline(parameters: any, context: AgentContext): Promise<any> {
    const { duration, start_date } = parameters;
    
    const prompt = `
당신은 전시 프로젝트 관리자입니다. ${duration} 전시를 위한 타임라인을 생성해주세요.

시작 날짜: ${start_date || '오늘부터'}

다음 형식으로 응답해주세요 (JSON):
{
  "phases": [
    {
      "name": "기획 단계",
      "duration": "4주",
      "tasks": [
        {"task": "콘셉트 확정", "duration": "1주", "dependencies": []},
        {"task": "작품 선정", "duration": "2주", "dependencies": ["콘셉트 확정"]},
        ...
      ]
    },
    ...
  ],
  "milestones": [
    {"name": "기획안 승인", "date": "Week 4"},
    {"name": "작품 대여 계약 완료", "date": "Week 8"},
    ...
  ],
  "critical_path": ["작품 선정", "작품 운송", "전시 설치"]
}
`;
    
    const response = await this.callGemini(prompt, 'flash');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
}
```

---

## 8. 인증 및 보안

### 8.1 JWT 유틸리티

#### **src/utils/jwt.utils.ts**

```typescript
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: number = 24 * 60 * 60 // 24 hours
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload> {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid token format');
  }
  
  // Verify signature
  const expectedSignature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
  
  // Decode payload
  const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
  
  // Check expiration
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  return payload;
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(input: string | Uint8Array): string {
  const base64 = typeof input === 'string'
    ? btoa(input)
    : btoa(String.fromCharCode(...input));
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(input: string): string {
  let base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  while (base64.length % 4) {
    base64 += '=';
  }
  
  return atob(base64);
}
```

---

### 8.2 비밀번호 암호화

#### **src/utils/crypto.utils.ts**

```typescript
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(':');
  
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(derivedBits);
  const computedHashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedHashHex === hashHex;
}
```

---

## 9. 배포 및 운영

### 9.1 로컬 개발 환경 실행

```bash
# Step 1: 데이터베이스 마이그레이션 (최초 1회)
cd /home/user/museflow-v4
npm run db:migrate:local

# Step 2: 시드 데이터 삽입 (선택사항)
npm run db:seed

# Step 3: 빌드
npm run build

# Step 4: PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# Step 5: 서버 확인
curl http://localhost:3000/health

# Step 6: 로그 확인
pm2 logs --nostream
```

---

### 9.2 프로덕션 배포

```bash
# Step 1: Cloudflare API 키 설정 (최초 1회)
# → setup_cloudflare_api_key 도구 사용

# Step 2: 프로젝트 생성 (최초 1회)
npx wrangler pages project create museflow-v4 \
  --production-branch main \
  --compatibility-date 2024-01-01

# Step 3: 프로덕션 데이터베이스 마이그레이션 (최초 1회)
npm run db:migrate:prod

# Step 4: 환경 변수 설정 (최초 1회)
wrangler pages secret put GEMINI_API_KEY --project-name museflow-v4
wrangler pages secret put JWT_SECRET --project-name museflow-v4

# Step 5: 배포
npm run deploy:prod

# Step 6: 배포 확인
curl https://museflow-v4.pages.dev/health
```

---

## 10. 테스트 전략

### 10.1 단위 테스트 예시

#### **tests/unit/jwt.utils.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '../../src/utils/jwt.utils'

describe('JWT Utils', () => {
  const secret = 'test-secret-key-min-32-characters-long'
  
  it('should generate and verify token', async () => {
    const payload = {
      userId: 1,
      email: 'test@example.com',
      role: 'member',
    }
    
    const token = await generateToken(payload, secret)
    expect(token).toBeTruthy()
    
    const verified = await verifyToken(token, secret)
    expect(verified.userId).toBe(payload.userId)
    expect(verified.email).toBe(payload.email)
    expect(verified.role).toBe(payload.role)
  })
  
  it('should reject invalid token', async () => {
    const invalidToken = 'invalid.token.here'
    
    await expect(verifyToken(invalidToken, secret)).rejects.toThrow()
  })
  
  it('should reject expired token', async () => {
    const payload = {
      userId: 1,
      email: 'test@example.com',
      role: 'member',
    }
    
    // Generate token with 1 second expiration
    const token = await generateToken(payload, secret, 1)
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await expect(verifyToken(token, secret)).rejects.toThrow('Token expired')
  })
})
```

---

## 11. 성능 최적화

### 11.1 Gemini API 캐싱 전략

```typescript
// src/services/gemini.service.ts
export class GeminiService {
  private cache: KVNamespace;
  
  async generateContent(prompt: string, model: 'flash' | 'pro' = 'flash'): Promise<string> {
    // Check cache first
    const cacheKey = `gemini:${model}:${this.hashPrompt(prompt)}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for Gemini API');
      return cached;
    }
    
    // Call Gemini API
    const response = await this.callGeminiAPI(prompt, model);
    
    // Cache result (TTL: 1 hour)
    await this.cache.put(cacheKey, response, { expirationTtl: 3600 });
    
    return response;
  }
  
  private hashPrompt(prompt: string): string {
    // Simple hash for cache key
    return btoa(prompt).substring(0, 32);
  }
}
```

---

## 12. 트러블슈팅

### 12.1 일반적인 문제 및 해결책

#### **문제: D1 데이터베이스 쿼리 느림**
```
해결책:
1. 인덱스 추가: CREATE INDEX idx_name ON table(column);
2. 쿼리 최적화: EXPLAIN QUERY PLAN으로 분석
3. KV 캐싱 활용: 자주 조회하는 데이터 캐싱
```

#### **문제: Gemini API 타임아웃**
```
해결책:
1. 타임아웃 연장: fetch() 옵션에 signal 추가
2. Flash 모델 우선 사용 (Pro보다 빠름)
3. 프롬프트 길이 최적화
```

#### **문제: 메모리 부족 (Workers)**
```
해결책:
1. 대용량 파일은 R2 Streaming 사용
2. JSON 파싱 최적화
3. 불필요한 메모리 할당 제거
```

---

**문서 종료 (End of Document)**

---

**변경 이력 (Change Log):**
- 2025-01-23: v1.0 초기 작성 (MuseFlow V4 Engineering Team)

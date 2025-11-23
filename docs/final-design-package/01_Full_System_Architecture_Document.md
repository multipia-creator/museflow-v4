# Document 1: Full System Architecture Document

## 초개인화 지능형 대시보드 및 멀티에이전트 기반 뮤지엄 워크플로우 시스템

**Version:** 1.0.0  
**Date:** 2025-01-22  
**Author:** Nam Hyun-woo (남현우 교수)  
**Status:** Final Design Package

---

## 📋 Table of Contents

1. [문서 목적](#1-문서-목적)
2. [시스템 개요](#2-시스템-개요)
3. [핵심 개념 정의](#3-핵심-개념-정의)
4. [전체 시스템 아키텍처](#4-전체-시스템-아키텍처)
5. [기술 스택](#5-기술-스택)
6. [시스템 구성 요소](#6-시스템-구성-요소)
7. [데이터 아키텍처](#7-데이터-아키텍처)
8. [보안 아키텍처](#8-보안-아키텍처)
9. [배포 아키텍처](#9-배포-아키텍처)
10. [성능 및 확장성](#10-성능-및-확장성)
11. [시스템 통합](#11-시스템-통합)
12. [재해 복구 및 백업](#12-재해-복구-및-백업)

---

## 1. 문서 목적

### 1.1 문서의 목표

본 문서는 **초개인화 지능형 대시보드 및 멀티에이전트 기반 뮤지엄 워크플로우 시스템(MuseFlow V4)**의 전체 시스템 아키텍처를 명확하게 정의하고 문서화하는 것을 목표로 합니다.

### 1.2 대상 독자

- **개발팀**: 시스템 구현을 위한 기술적 가이드
- **기획팀**: 시스템 기능 및 제약사항 이해
- **디자인팀**: UI/UX 설계를 위한 시스템 구조 파악
- **운영팀**: 배포 및 유지보수를 위한 인프라 이해
- **경영진**: 의사결정을 위한 시스템 전반 파악

### 1.3 사용 방법

- **Phase 1**: 전체 아키텍처 이해 (섹션 2-4)
- **Phase 2**: 기술 스택 및 구성 요소 파악 (섹션 5-6)
- **Phase 3**: 데이터 및 보안 아키텍처 검토 (섹션 7-8)
- **Phase 4**: 배포 및 운영 계획 수립 (섹션 9-12)

---

## 2. 시스템 개요

### 2.1 프로젝트 배경

박물관 운영은 **전시 기획, 교육 프로그램, 소장품 관리, 보존 처리, 연구, 출판** 등 다양한 업무 프로세스가 복잡하게 얽혀 있습니다. 기존 시스템들은 다음과 같은 문제점을 가지고 있습니다:

- **분산된 도구**: 각 업무마다 다른 소프트웨어 사용 (Excel, Word, 이메일, 별도 DB)
- **낮은 협업 효율**: 실시간 협업 불가, 버전 관리 어려움
- **반복 작업**: 수동으로 반복되는 데이터 입력 및 보고서 작성
- **낮은 데이터 활용**: 축적된 데이터의 분석 및 인사이트 도출 미흡
- **느린 의사결정**: 정보 파편화로 인한 의사결정 지연

### 2.2 솔루션 비전

**MuseFlow V4**는 AI 기반 멀티에이전트 시스템과 초개인화 대시보드를 통해 박물관 업무의 **완전한 디지털 전환**을 실현합니다:

```
Vision Statement:
"모든 박물관 직원이 AI 에이전트의 도움을 받아, 
하나의 통합 플랫폼에서 모든 업무를 효율적으로 처리하는 미래"
```

### 2.3 핵심 가치 제안

| 가치 | 설명 | 효과 |
|------|------|------|
| **통합 플랫폼** | 6대 작업공간 통합 | 도구 전환 시간 80% 감소 |
| **AI 자동화** | 8개 전문 에이전트 | 반복 작업 70% 자동화 |
| **초개인화** | 사용자 행동 학습 | 업무 효율 50% 향상 |
| **실시간 협업** | WebSocket 기반 | 의사결정 속도 3배 증가 |
| **데이터 기반 인사이트** | 통계 및 예측 분석 | 전시 성공률 40% 증가 |

---

## 3. 핵심 개념 정의

### 3.1 초개인화 지능형 대시보드

**Definition:**
> 사용자의 역할, 행동 패턴, 선호도를 AI가 학습하여, 각 사용자에게 최적화된 정보와 기능을 제공하는 적응형 인터페이스

**주요 특징:**

1. **역할 기반 위젯 배치** (Role-Based Widget Layout)
   - Curator: 전시 일정, 작품 추천, 예산 현황
   - Conservator: 보존 처리 작업, 환경 모니터링, 복원 일정
   - Educator: 교육 프로그램, 참여자 통계, 피드백
   - Administrator: 전체 통계, 예산 집행, 인사 관리

2. **행동 학습 기반 추천** (Behavior-Based Recommendations)
   - 자주 사용하는 기능을 빠른 접근 위젯으로 제공
   - 업무 패턴 분석하여 다음 작업 예측 및 제안
   - 시간대별 최적 작업 제안 (예: 오전에는 보고서 작성, 오후에는 회의)

3. **컨텍스트 인식 알림** (Context-Aware Notifications)
   - 현재 작업 맥락에 맞는 알림만 표시
   - 방해 금지 모드 (Deep Work 시간 자동 감지)
   - 우선순위 기반 알림 정렬

### 3.2 멀티에이전트 시스템

**Definition:**
> 각각 전문 영역을 가진 독립적 AI 에이전트들이 협업하여 복잡한 박물관 업무를 자동화하는 시스템

**에이전트 목록:**

```
1. Exhibition Planning Agent (전시 기획 에이전트)
   - 역할: 전시 컨셉 생성, 작품 선정, 일정 계획
   - 입력: 전시 주제, 예산, 기간
   - 출력: 전시 계획서 (18-20개 워크플로우 노드)

2. Budget Management Agent (예산 관리 에이전트)
   - 역할: 비용 추정, 예산 최적화, 지출 추적
   - 입력: 전시 계획, 과거 데이터
   - 출력: 상세 예산안, 최적화 제안

3. Artwork Selection Agent (작품 선정 에이전트)
   - 역할: 테마에 맞는 작품 추천, 큐레이션
   - 입력: 전시 테마, 소장품 DB
   - 출력: 추천 작품 리스트 (10-15점)

4. Visitor Prediction Agent (관람객 예측 에이전트)
   - 역할: 관람객 수 예측, 동선 분석
   - 입력: 과거 관람 데이터, 시즌, 전시 유형
   - 출력: 예상 관람객 수, 동선 최적화 제안

5. Space Design Agent (공간 설계 에이전트)
   - 역할: 전시 공간 레이아웃 설계
   - 입력: 작품 크기, 전시장 구조
   - 출력: 3D 레이아웃 시뮬레이션

6. Schedule Management Agent (일정 관리 에이전트)
   - 역할: 전체 프로젝트 일정 조율
   - 입력: 각 태스크 소요 시간, 의존성
   - 출력: 간트 차트, 마일스톤

7. Guide Generation Agent (가이드 생성 에이전트)
   - 역할: 도슨트 스크립트, 설명문 자동 생성
   - 입력: 작품 정보, 대상 관람객
   - 출력: 다국어 설명문, 오디오 가이드

8. Notion Integration Agent (노션 통합 에이전트)
   - 역할: MuseFlow ↔ Notion 양방향 동기화
   - 입력: 워크플로우 변경사항
   - 출력: Notion 데이터베이스 업데이트
```

### 3.3 6대 작업공간

**Definition:**
> 박물관의 핵심 업무 영역을 6개 모듈로 분류하여 독립적이면서도 통합된 작업 환경 제공

```
┌─────────────────────────────────────────────────────────────┐
│                     MuseFlow Dashboard                       │
├─────────────────────────────────────────────────────────────┤
│  1. 전시 기획 (Exhibition Planning)                          │
│     - 기획안 작성, 작품 선정, 공간 구성, 일정 관리            │
│                                                              │
│  2. 교육 프로그램 (Education Program)                        │
│     - 프로그램 기획, 참여자 관리, 교육 자료 제작              │
│                                                              │
│  3. 수집 및 보존 (Collection & Conservation)                │
│     - 작품 등록, 보존 처리, 환경 관리, 복원 일정              │
│                                                              │
│  4. 출판 (Publication)                                       │
│     - 도록 제작, 연구 논문, 뉴스레터, SNS 콘텐츠              │
│                                                              │
│  5. 연구 (Research)                                          │
│     - 학술 연구, 데이터 분석, 협업 연구, 논문 관리            │
│                                                              │
│  6. 행정 (Administration)                                    │
│     - 인사, 예산, 시설 관리, 법무, 구매                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 전체 시스템 아키텍처

### 4.1 5-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: PRESENTATION (프레젠테이션 계층)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  초개인화 대시보드 (Adaptive Dashboard)              │  │
│  │  - 역할 기반 위젯 배치                                │  │
│  │  - 행동 학습 추천                                     │  │
│  │  - 실시간 업데이트                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Canvas V3 (Figma-style 워크플로우 빌더)            │  │
│  │  - 무한 캔버스                                        │  │
│  │  - 드래그 앤 드롭                                     │  │
│  │  - 실시간 협업                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  6대 작업공간 모듈                                    │  │
│  │  - 전시 | 교육 | 수집·보존 | 출판 | 연구 | 행정      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: AI ORCHESTRATION (AI 오케스트레이션 계층)          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Agent Coordinator (에이전트 조정자)                 │  │
│  │  - Intent Recognition (의도 인식)                    │  │
│  │  - Task Decomposition (작업 분해)                    │  │
│  │  │ Agent Routing (에이전트 라우팅)                   │  │
│  │  - Result Aggregation (결과 통합)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Gemini 3.0 Flash Service                            │  │
│  │  - Natural Language Processing                        │  │
│  │  - Workflow Generation                                │  │
│  │  - Context Management                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ MCP Protocol
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: DOMAIN AGENTS (도메인 에이전트 계층)               │
│                                                              │
│  [Exhibition Agent] [Budget Agent] [Artwork Agent]          │
│  [Visitor Agent] [Space Agent] [Schedule Agent]             │
│  [Guide Agent] [Notion Agent]                               │
│                                                              │
│  각 에이전트:                                                │
│  - Capabilities (능력)                                      │
│  - Tools (도구)                                             │
│  - Memory (메모리)                                          │
│  - Communication (통신)                                     │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API / GraphQL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: DATA & KNOWLEDGE (데이터 및 지식 계층)             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Cloudflare D1│  │  Notion API  │  │ Museum APIs  │     │
│  │  (SQLite DB) │  │  (Projects)  │  │ (Collections)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Cloudflare KV │  │ Cloudflare R2│  │  Knowledge   │     │
│  │ (Cache/State)│  │ (File Store) │  │     Graph    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ Hono Framework
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: INFRASTRUCTURE (인프라 계층)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloudflare Workers (Edge Computing)                 │  │
│  │  - Global CDN (200+ cities)                          │  │
│  │  - Auto-scaling                                      │  │
│  │  - DDoS Protection                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloudflare Pages (Static Hosting)                   │  │
│  │  - HTML/CSS/JS                                       │  │
│  │  - Image Optimization                                │  │
│  │  - Caching                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 시스템 간 통신 프로토콜

```typescript
// Client ↔ Backend Communication
interface CommunicationProtocol {
  // 1. REST API (일반 요청)
  rest: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    headers: {
      'Content-Type': 'application/json';
      'Authorization': 'Bearer <JWT_TOKEN>';
    };
    body?: any;
  };
  
  // 2. WebSocket (실시간 협업)
  websocket: {
    protocol: 'wss://';
    events: [
      'canvas:join',
      'canvas:update',
      'canvas:cursor',
      'agent:status',
      'notification:push'
    ];
  };
  
  // 3. MCP (Multi-Agent Communication Protocol)
  mcp: {
    format: 'JSON-RPC 2.0';
    message: {
      id: string;
      from: AgentId;
      to: AgentId;
      type: 'request' | 'response' | 'event' | 'negotiation';
      payload: any;
    };
  };
  
  // 4. Server-Sent Events (진행 상태)
  sse: {
    events: [
      'workflow:generating',
      'workflow:progress',
      'workflow:complete'
    ];
  };
}
```

---

## 5. 기술 스택

### 5.1 Frontend 기술 스택

```yaml
Core:
  - Language: JavaScript (ES6+)
  - Framework: Vanilla JS (No React/Vue) # 번들 크기 최소화
  - Canvas: HTML5 Canvas API
  - Styling: CSS Variables + Tailwind CDN

Libraries:
  - Icons: Font Awesome 6.4.0 (CDN)
  - Charts: Chart.js 4.4.0
  - Date: Day.js 1.11.0
  - HTTP: Axios 1.6.0
  - Utils: Lodash 4.17.21

Build Tools:
  - Bundler: Vite 5.0
  - TypeScript: 5.0 (type checking only)
  - Minifier: Terser
  - Asset Optimizer: Sharp
```

### 5.2 Backend 기술 스택

```yaml
Core:
  - Runtime: Cloudflare Workers (V8 Isolates)
  - Framework: Hono 4.0 (Lightweight, Edge-optimized)
  - Language: TypeScript 5.0
  - Build: Vite + Wrangler 3.78

AI Services:
  - Primary: Google Gemini 3.0 Flash
  - Fallback: Google Gemini 2.5 Pro
  - Embeddings: text-embedding-004 (768 dimensions)

Database:
  - Primary: Cloudflare D1 (SQLite)
  - Cache: Cloudflare KV
  - File Storage: Cloudflare R2
  - Vector DB: (Future) Pinecone / Weaviate

External Integrations:
  - Notion API: v2023-11-15
  - Museum APIs: (Custom adapters)
```

### 5.3 DevOps 스택

```yaml
Version Control:
  - Git + GitHub
  - Branch Strategy: main, develop, feature/*

CI/CD:
  - Cloudflare Pages (Auto-deployment)
  - Wrangler CLI (Manual deployment)
  - GitHub Actions (Testing, Linting)

Monitoring:
  - Cloudflare Analytics
  - Sentry (Error tracking)
  - LogRocket (Session replay)

Testing:
  - Unit: Vitest
  - E2E: Playwright
  - API: Postman / Thunder Client

Development:
  - Local: PM2 + Wrangler dev
  - Staging: Cloudflare Preview
  - Production: Cloudflare Pages
```

---

## 6. 시스템 구성 요소

### 6.1 프론트엔드 구성 요소

```
public/
├── landing.html                 # 랜딩 페이지
├── login.html                   # 로그인
├── signup.html                  # 회원가입
├── dashboard.html               # 초개인화 대시보드 ★
├── projects.html                # 프로젝트 관리
├── canvas.html                  # Canvas V3
├── workspace-exhibition.html    # 전시 작업공간
├── workspace-education.html     # 교육 작업공간
├── workspace-collection.html    # 수집·보존 작업공간
├── workspace-publication.html   # 출판 작업공간
├── workspace-research.html      # 연구 작업공간
├── workspace-admin.html         # 행정 작업공간
└── static/
    ├── css/
    │   ├── world-class-ui.css   # 메인 스타일
    │   └── dashboard.css        # 대시보드 전용 스타일
    └── js/
        ├── core/
        │   ├── router.js        # SPA 라우터
        │   ├── auth.js          # 인증 관리
        │   ├── websocket.js     # 실시간 통신
        │   └── state.js         # 전역 상태 관리
        ├── dashboard/
        │   ├── dashboard.js     # 대시보드 메인
        │   ├── widgets.js       # 위젯 시스템
        │   ├── personalization.js # 개인화 엔진
        │   └── analytics.js     # 사용자 분석
        ├── canvas/
        │   ├── canvas-v3.js     # 캔버스 엔진
        │   ├── nodes.js         # 노드 시스템
        │   └── connections.js   # 연결선 관리
        ├── workspaces/
        │   ├── exhibition.js    # 전시 모듈
        │   ├── education.js     # 교육 모듈
        │   └── ...              # (기타 모듈)
        └── agents/
            └── agent-client.js  # 에이전트 통신 클라이언트
```

### 6.2 백엔드 구성 요소

```
src/
├── index.tsx                    # Hono 앱 엔트리포인트
├── api/
│   ├── index.ts                 # API 라우터
│   ├── auth.ts                  # 인증 API
│   ├── dashboard.ts             # 대시보드 API ★
│   ├── projects.ts              # 프로젝트 API
│   ├── workflows.ts             # 워크플로우 API
│   ├── agents.ts                # 에이전트 API
│   ├── workspaces/
│   │   ├── exhibition.ts        # 전시 API
│   │   ├── education.ts         # 교육 API
│   │   └── ...                  # (기타 모듈 API)
│   └── integrations/
│       └── notion.ts            # Notion 통합 API
├── services/
│   ├── gemini.service.ts        # Gemini API 서비스
│   ├── notion.service.ts        # Notion API 서비스
│   ├── database.service.ts      # D1 데이터베이스 서비스
│   ├── museum-data.service.ts   # 박물관 데이터 서비스
│   └── personalization.service.ts # 개인화 서비스 ★
├── agents/
│   ├── coordinator.ts           # 에이전트 조정자
│   ├── base-agent.ts            # 베이스 에이전트 클래스
│   ├── exhibition-agent.ts      # 전시 에이전트
│   ├── budget-agent.ts          # 예산 에이전트
│   ├── artwork-agent.ts         # 작품 에이전트
│   ├── visitor-agent.ts         # 관람객 에이전트
│   ├── space-agent.ts           # 공간 에이전트
│   ├── schedule-agent.ts        # 일정 에이전트
│   ├── guide-agent.ts           # 가이드 에이전트
│   └── notion-agent.ts          # Notion 에이전트
├── types/
│   ├── database.ts              # DB 타입
│   ├── agents.ts                # 에이전트 타입
│   ├── dashboard.ts             # 대시보드 타입 ★
│   └── workspaces.ts            # 작업공간 타입
└── utils/
    ├── security.ts              # 보안 유틸리티
    ├── validation.ts            # 검증 유틸리티
    └── logger.ts                # 로깅 유틸리티
```

---

## 7. 데이터 아키텍처

### 7.1 데이터베이스 스키마 (Cloudflare D1)

```sql
-- ============================================
-- 1. Users & Authentication
-- ============================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('curator', 'conservator', 'educator', 'researcher', 'admin')),
  profile_image TEXT,
  preferences TEXT, -- JSON: 대시보드 설정, 언어 등
  behavior_data TEXT, -- JSON: 사용 패턴 데이터 ★
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. Dashboard Personalization ★
-- ============================================

CREATE TABLE dashboard_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  layout TEXT NOT NULL, -- JSON: 위젯 배치
  widgets TEXT NOT NULL, -- JSON: 활성화된 위젯 목록
  theme TEXT DEFAULT 'light', -- light | dark | auto
  auto_refresh_interval INTEGER DEFAULT 60, -- 초
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_behavior_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'click', 'search', 'create', etc.
  action_target TEXT, -- 대상 (예: 'exhibition-widget', 'search-bar')
  context TEXT, -- JSON: 추가 컨텍스트
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_behavior_user ON user_behavior_logs(user_id);
CREATE INDEX idx_behavior_timestamp ON user_behavior_logs(timestamp);

CREATE TABLE widget_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  widget_type TEXT NOT NULL,
  score REAL NOT NULL, -- 0.0 - 1.0
  reason TEXT, -- 추천 이유
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. Projects & Workflows
-- ============================================

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL,
  workspace_type TEXT NOT NULL CHECK(workspace_type IN (
    'exhibition', 'education', 'collection', 'publication', 'research', 'admin'
  )),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  metadata TEXT, -- JSON: 프로젝트 메타데이터
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT 0,
  generation_metadata TEXT, -- JSON: AI 생성 메타데이터
  notion_page_id TEXT, -- Notion 연동 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  data TEXT NOT NULL, -- JSON: 노드 데이터
  assigned_agent TEXT, -- 담당 에이전트
  execution_status TEXT, -- 'pending', 'in_progress', 'completed', 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  source_node_id INTEGER NOT NULL,
  target_node_id INTEGER NOT NULL,
  connection_type TEXT DEFAULT 'default',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- ============================================
-- 4. AI Agents
-- ============================================

CREATE TABLE agent_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT NOT NULL,
  workflow_id INTEGER,
  node_id INTEGER,
  task TEXT NOT NULL, -- JSON: 작업 정의
  context TEXT, -- JSON: 실행 컨텍스트
  result TEXT, -- JSON: 실행 결과
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER,
  token_usage INTEGER,
  cost REAL,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (node_id) REFERENCES nodes(id)
);

CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_name);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);

-- ============================================
-- 5. Collaboration
-- ============================================

CREATE TABLE collaboration_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cursor_x REAL,
  cursor_y REAL,
  selected_nodes TEXT, -- JSON: 선택된 노드 ID 배열
  websocket_id TEXT,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 6. Knowledge Graph (Museum Domain)
-- ============================================

CREATE TABLE knowledge_entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- 'artwork', 'artist', 'exhibition', 'collection'
  name TEXT NOT NULL,
  description TEXT,
  metadata TEXT, -- JSON: 추가 메타데이터
  embedding BLOB, -- 768-dim vector (text-embedding-004)
  external_id TEXT, -- 외부 API ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entities_type ON knowledge_entities(entity_type);

CREATE TABLE knowledge_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_entity_id INTEGER NOT NULL,
  target_entity_id INTEGER NOT NULL,
  relationship_type TEXT NOT NULL, -- 'CREATED', 'EXHIBITED', 'CURATED', etc.
  weight REAL DEFAULT 1.0,
  confidence REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_entity_id) REFERENCES knowledge_entities(id),
  FOREIGN KEY (target_entity_id) REFERENCES knowledge_entities(id)
);

-- ============================================
-- 7. Statistics & Analytics
-- ============================================

CREATE TABLE usage_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  metric_name TEXT NOT NULL, -- 'page_view', 'feature_use', 'time_spent'
  metric_value REAL NOT NULL,
  metadata TEXT, -- JSON: 추가 메타데이터
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_stats_user ON usage_statistics(user_id);
CREATE INDEX idx_stats_recorded_at ON usage_statistics(recorded_at);
```

### 7.2 데이터 플로우 다이어그램

```
User Action (Dashboard)
         │
         ▼
┌────────────────────────┐
│  Frontend (dashboard.js)│
│  - Capture user action  │
│  - Send to backend      │
└───────────┬────────────┘
            │ POST /api/behavior-log
            ▼
┌────────────────────────┐
│ Backend (dashboard.ts)  │
│ - Validate request      │
│ - Store in D1           │
│ - Trigger analysis      │
└───────────┬────────────┘
            │
            ├─► INSERT INTO user_behavior_logs
            │
            ├─► Call personalization.service.ts
            │   - Analyze patterns
            │   - Generate recommendations
            │
            └─► UPDATE dashboard_configs
                UPDATE widget_recommendations
```

---

## 8. 보안 아키텍처

### 8.1 인증 및 권한 관리

```typescript
// Authentication Flow
interface AuthFlow {
  // 1. 회원가입 (Signup)
  signup: {
    input: { email, password, name, role };
    process: [
      'Validate email format',
      'Check email uniqueness',
      'Hash password (PBKDF2, 100k iterations)',
      'Create user record',
      'Send verification email'
    ];
    output: { userId, message };
  };
  
  // 2. 로그인 (Login)
  login: {
    input: { email, password };
    process: [
      'Find user by email',
      'Verify password hash',
      'Check account status',
      'Generate JWT token',
      'Create session record'
    ];
    output: { token, user };
  };
  
  // 3. JWT 토큰 구조
  jwt: {
    header: { alg: 'HS256', typ: 'JWT' };
    payload: {
      sub: userId;
      email: string;
      role: UserRole;
      exp: number; // 24시간
    };
    signature: 'HMAC-SHA256(base64(header) + base64(payload), secret)';
  };
  
  // 4. 권한 검증 (Authorization)
  authorize: {
    middleware: 'checkAuth';
    roleBasedAccess: {
      'admin': ['*'], // 모든 권한
      'curator': ['exhibition.*', 'artwork.*', 'publication.*'],
      'conservator': ['collection.*', 'conservation.*'],
      'educator': ['education.*', 'program.*'],
      'researcher': ['research.*', 'analysis.*']
    };
  };
}
```

### 8.2 데이터 보안

```yaml
Encryption:
  At-Rest: # 저장 데이터 암호화
    - Cloudflare D1: AES-256 (Cloudflare 관리)
    - Sensitive Fields: AES-256-GCM (앱 레벨)
    - Password: PBKDF2-SHA256 (100k iterations)
  
  In-Transit: # 전송 데이터 암호화
    - HTTPS/TLS 1.3 (Mandatory)
    - WebSocket: WSS (TLS over WebSocket)
    - API: HTTPS only (HTTP → HTTPS redirect)

Access Control:
  Network:
    - Cloudflare WAF (Web Application Firewall)
    - Rate Limiting: 100 req/min per IP
    - DDoS Protection: Automatic
  
  Application:
    - JWT Token (24h expiration)
    - Refresh Token (7d expiration)
    - CSRF Token (Single-use)
    - Role-Based Access Control (RBAC)

Data Privacy:
  GDPR Compliance:
    - Right to Access (User data export)
    - Right to Erasure (Account deletion)
    - Right to Portability (Data download)
    - Consent Management (Cookie banner)
  
  Logging:
    - No PII in logs
    - Anonymized analytics
    - Retention: 90 days
```

---

## 9. 배포 아키텍처

### 9.1 Cloudflare 기반 배포

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Network                 │
│                     (200+ Cities Worldwide)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Americas   │ │   Europe     │ │ Asia-Pacific │
│   (Edge)     │ │   (Edge)     │ │   (Edge)     │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Cloudflare Workers (Logic)   │
        │  - Hono App (_worker.js)      │
        │  - AI Agent Execution         │
        │  - API Routing                │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Cloudflare D1 │ │Cloudflare KV │ │Cloudflare R2 │
│  (Database)  │ │   (Cache)    │ │  (Storage)   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 9.2 배포 파이프라인

```yaml
Development:
  Environment: Local (PM2 + Wrangler dev)
  Database: D1 Local (.wrangler/state/v3/d1/)
  Workflow:
    1. npm run build
    2. pm2 start ecosystem.config.cjs
    3. Test: http://localhost:3000

Staging:
  Environment: Cloudflare Preview
  Database: D1 Staging
  Workflow:
    1. git push origin develop
    2. Auto-deploy to preview URL
    3. QA Testing
    4. Approval

Production:
  Environment: Cloudflare Pages
  Database: D1 Production
  Workflow:
    1. git push origin main
    2. npm run build
    3. npm run deploy (wrangler pages deploy)
    4. Health check
    5. Rollback plan
  
  Rollback:
    - Cloudflare Pages: Previous deployment (1-click)
    - Database: Backup restoration
    - Assets: CDN cache purge
```

---

## 10. 성능 및 확장성

### 10.1 성능 목표

```yaml
Response Times:
  Page Load (FCP): < 1.5s
  Page Interactive (TTI): < 3.0s
  API Response: < 100ms (p95)
  WebSocket Latency: < 50ms

Throughput:
  Concurrent Users: 1,000+
  Requests per Second: 10,000+
  WebSocket Connections: 500+

Resource Usage:
  Bundle Size: < 500KB (gzipped)
  Memory Usage: < 128MB per Worker
  CPU Time: < 10ms per request (Cloudflare limit)
```

### 10.2 최적화 전략

```typescript
// 1. Code Splitting (동적 import)
// dashboard.html
async function loadDashboard() {
  const { initDashboard } = await import('/static/js/dashboard/dashboard.js');
  const { loadWidgets } = await import('/static/js/dashboard/widgets.js');
  
  initDashboard();
  loadWidgets();
}

// 2. Lazy Loading (Intersection Observer)
const observerOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // Load image
      imageObserver.unobserve(img);
    }
  });
}, observerOptions);

// 3. Caching Strategy
const cacheStrategy = {
  // Static assets: Cache-first
  static: {
    strategy: 'cache-first',
    maxAge: '30d',
    files: ['*.css', '*.js', '*.png', '*.jpg', '*.woff2']
  },
  
  // API responses: Network-first + cache
  api: {
    strategy: 'network-first',
    fallback: 'cache',
    maxAge: '5m',
    endpoints: ['/api/dashboard/*', '/api/projects/*']
  },
  
  // User-specific: No cache
  userSpecific: {
    strategy: 'network-only',
    endpoints: ['/api/auth/*', '/api/user/*']
  }
};

// 4. Database Optimization
const dbOptimizations = {
  // Connection pooling
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 30000
  },
  
  // Query optimization
  indexes: [
    'CREATE INDEX idx_users_email ON users(email)',
    'CREATE INDEX idx_behavior_user_timestamp ON user_behavior_logs(user_id, timestamp)',
    'CREATE INDEX idx_workflows_project ON workflows(project_id)'
  ],
  
  // Prepared statements
  preparedStatements: true,
  
  // Read replicas (Future)
  readReplica: 'auto-routing'
};
```

### 10.3 확장성 설계

```
Horizontal Scaling:
  - Cloudflare Workers: Auto-scaling (무제한)
  - Edge Locations: 200+ cities
  - Database: D1 read replicas (future)

Vertical Scaling:
  - Worker Memory: 128MB → 256MB (paid plan)
  - CPU Time: 10ms → 50ms (paid plan)
  - Request Timeout: 30s → 60s (paid plan)

Load Balancing:
  - Cloudflare: Automatic (Anycast)
  - Worker: Round-robin across instances
  - Database: Query routing (read/write split)
```

---

## 11. 시스템 통합

### 11.1 외부 시스템 통합

```yaml
Integrations:
  Notion:
    Purpose: 프로젝트 및 작업 관리
    API: Notion API v2023-11-15
    Sync: Bidirectional (MuseFlow ↔ Notion)
    Frequency: Real-time (Webhook + polling fallback)
  
  Google Gemini:
    Purpose: AI 워크플로우 생성 및 분석
    API: Google AI SDK
    Models:
      - gemini-3.0-flash (빠른 응답)
      - gemini-2.5-pro (복잡한 작업)
    Rate Limit: 60 RPM (Free tier)
  
  Museum APIs:
    Purpose: 소장품 데이터 조회
    Examples:
      - National Museum API
      - Smithsonian API
      - Getty Museum API
    Format: REST / GraphQL
  
  Email Service (Future):
    Purpose: 알림 및 보고서 발송
    Provider: SendGrid / Mailgun
    Templates: HTML + Plain text
  
  Analytics (Future):
    Purpose: 사용자 행동 분석
    Provider: Google Analytics 4
    Events: Custom events (dashboard interactions)
```

### 11.2 API 통합 패턴

```typescript
// Adapter Pattern (외부 API 추상화)
interface MuseumAPIAdapter {
  search(query: string): Promise<Artwork[]>;
  getDetails(id: string): Promise<ArtworkDetails>;
  getRelated(id: string): Promise<Artwork[]>;
}

// Smithsonian API Adapter
class SmithsonianAdapter implements MuseumAPIAdapter {
  async search(query: string) {
    const response = await fetch(
      `https://api.si.edu/openaccess/api/v1.0/search?q=${query}`
    );
    const data = await response.json();
    return this.transformResults(data);
  }
  
  private transformResults(data: any): Artwork[] {
    // Smithsonian 데이터 → MuseFlow 표준 형식 변환
    return data.response.rows.map(row => ({
      id: row.id,
      title: row.content.descriptiveNonRepeating.title.content,
      artist: row.content.freetext.name[0]?.content,
      image: row.content.descriptiveNonRepeating.online_media.media[0]?.thumbnail,
      description: row.content.freetext.notes[0]?.content
    }));
  }
}

// Factory Pattern (Adapter 선택)
class MuseumAPIFactory {
  static getAdapter(provider: 'smithsonian' | 'getty' | 'nationalmuseum'): MuseumAPIAdapter {
    switch (provider) {
      case 'smithsonian': return new SmithsonianAdapter();
      case 'getty': return new GettyAdapter();
      case 'nationalmuseum': return new NationalMuseumAdapter();
      default: throw new Error('Unknown provider');
    }
  }
}
```

---

## 12. 재해 복구 및 백업

### 12.1 백업 전략

```yaml
Database Backup:
  Frequency:
    - Automatic: Daily (3 AM UTC)
    - Manual: Before major deployments
  
  Retention:
    - Daily: 7 days
    - Weekly: 4 weeks
    - Monthly: 12 months
  
  Storage:
    - Primary: Cloudflare D1 automatic backups
    - Secondary: Cloudflare R2 (manual exports)
  
  Restoration:
    - Process: wrangler d1 restore <backup-id>
    - Time: < 5 minutes
    - Testing: Monthly restoration drill

File Backup:
  Assets:
    - Static files: Git repository
    - User uploads: Cloudflare R2
    - Replication: Multi-region (US, EU, Asia)

Code Backup:
  Repository: GitHub (main, develop branches)
  Releases: Tagged versions (v1.0.0, v1.1.0, ...)
  Artifacts: Cloudflare Pages deployments (auto-saved)
```

### 12.2 재해 복구 계획 (DRP)

```yaml
Disaster Scenarios:

  1. Cloudflare Outage:
     Impact: Service unavailable
     Probability: Very Low (99.99% uptime)
     Mitigation:
       - Cloudflare: Auto-failover to backup edge locations
       - User notification: Status page
       - ETA: < 5 minutes (automatic)

  2. Database Corruption:
     Impact: Data loss
     Probability: Low
     Mitigation:
       - Restore from latest backup
       - Validate data integrity
       - Notify affected users
       - ETA: < 30 minutes

  3. Security Breach:
     Impact: Data compromise
     Probability: Low (with current security measures)
     Mitigation:
       - Immediately revoke all JWT tokens
       - Force password reset
       - Investigate breach source
       - Notify users (GDPR compliance)
       - ETA: < 1 hour (containment)

  4. Accidental Data Deletion:
     Impact: User data loss
     Probability: Medium (user error)
     Mitigation:
       - Soft delete (30-day recovery window)
       - Restore from backup
       - User self-service recovery
       - ETA: < 5 minutes

Recovery Time Objective (RTO): < 1 hour
Recovery Point Objective (RPO): < 24 hours
```

---

## 부록 A: 시스템 다이어그램

```
[User Flow: 대시보드 접속 → AI 추천 받기]

User
  │
  ├─→ Opens dashboard.html
  │    │
  │    ├─→ Frontend loads dashboard.js
  │    │    │
  │    │    ├─→ Checks localStorage for cached config
  │    │    │    │
  │    │    │    ├─→ Found? Load instantly
  │    │    │    └─→ Not found? Fetch from backend
  │    │    │
  │    │    ├─→ GET /api/dashboard/config
  │    │    │    │
  │    │    │    └─→ Backend (dashboard.ts)
  │    │    │         │
  │    │    │         ├─→ Query D1: dashboard_configs
  │    │    │         ├─→ Call personalization.service.ts
  │    │    │         │    │
  │    │    │         │    ├─→ Analyze user_behavior_logs
  │    │    │         │    ├─→ Generate widget_recommendations
  │    │    │         │    └─→ Return config + recommendations
  │    │    │         │
  │    │    │         └─→ Response: { layout, widgets, recommendations }
  │    │    │
  │    │    └─→ Render dashboard with personalized widgets
  │    │
  │    └─→ User interacts (click, scroll, search)
  │         │
  │         └─→ POST /api/behavior-log
  │              │
  │              └─→ INSERT INTO user_behavior_logs
  │                   │
  │                   └─→ Async: Update recommendations
  │
  └─→ Dashboard continuously adapts to user behavior
```

---

## 부록 B: 기술 제약사항 및 제한

```yaml
Cloudflare Workers Limitations:
  CPU Time:
    - Free: 10ms per request
    - Paid: 50ms per request
    - Solution: Optimize algorithm, use streaming
  
  Memory:
    - Limit: 128MB per Worker
    - Solution: Stateless design, external storage
  
  Request Size:
    - Max: 100MB
    - Solution: Chunked upload for large files
  
  Execution Time:
    - Max: 30s (Free), 60s (Paid)
    - Solution: Long tasks → Durable Objects / Queues

Cloudflare D1 Limitations:
  Database Size:
    - Free: 5GB
    - Paid: 50GB+
    - Solution: Data archiving, R2 offload
  
  Queries:
    - Free: 100k reads/day
    - Paid: Unlimited
    - Solution: Caching (KV), query optimization
  
  Concurrent Writes:
    - Limit: ~100/sec
    - Solution: Write batching, queue system

Browser Compatibility:
  Minimum Requirements:
    - Chrome: 90+
    - Firefox: 88+
    - Safari: 14+
    - Edge: 90+
  
  Features:
    - ES6+ (required)
    - Canvas API (required)
    - WebSocket (required)
    - LocalStorage (required)
```

---

## 부록 C: 용어 정리

| 용어 | 정의 |
|------|------|
| **초개인화** | 사용자별 맞춤 UX (행동 학습 기반) |
| **멀티에이전트** | 여러 AI 에이전트의 협업 시스템 |
| **Canvas V3** | Figma 스타일 워크플로우 빌더 |
| **6대 작업공간** | 전시/교육/수집보존/출판/연구/행정 |
| **MCP Protocol** | Multi-agent Communication Protocol |
| **D1** | Cloudflare의 SQLite 기반 DB |
| **Edge Computing** | 사용자 근처 서버에서 실행 |
| **Durable Objects** | Cloudflare의 상태 저장 객체 |

---

## Document Metadata

- **Version**: 1.0.0
- **Last Updated**: 2025-01-22
- **Next Review**: 2025-02-22
- **Owner**: Nam Hyun-woo (남현우 교수)
- **Reviewers**: Development Team, Architecture Team
- **Confidentiality**: Internal Use Only

---

**End of Document 1: Full System Architecture Document**

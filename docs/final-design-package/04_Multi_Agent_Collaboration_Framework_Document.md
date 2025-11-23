# Document 4: Multi-Agent Collaboration Framework

## 멀티에이전트 협업 프레임워크 설계서

**Version:** 1.0.0  
**Date:** 2025-01-22  
**Author:** Nam Hyun-woo (남현우 교수)  
**Status:** Final Design Package

---

## 📋 Table of Contents

1. [문서 목적](#1-문서-목적)
2. [에이전트 시스템 개요](#2-에이전트-시스템-개요)
3. [에이전트 아키텍처](#3-에이전트-아키텍처)
4. [8개 전문 에이전트 명세](#4-8개-전문-에이전트-명세)
5. [에이전트 통신 프로토콜 (MCP)](#5-에이전트-통신-프로토콜-mcp)
6. [Agent Coordinator (조정자)](#6-agent-coordinator-조정자)
7. [에이전트 협업 시나리오](#7-에이전트-협업-시나리오)
8. [성능 및 비용 최적화](#8-성능-및-비용-최적화)
9. [에이전트 모니터링 및 디버깅](#9-에이전트-모니터링-및-디버깅)
10. [확장 및 유지보수](#10-확장-및-유지보수)

---

## 1. 문서 목적

### 1.1 문서의 목표

본 문서는 **MuseFlow V4의 멀티에이전트 시스템**의 구조, 통신 메커니즘, 협업 패턴을 상세히 기술하여, 개발팀이 **지능형 자동화 시스템을 효과적으로 구현**할 수 있도록 가이드를 제공합니다.

### 1.2 대상 독자

- **백엔드 개발자**: AI 에이전트 구현 및 통합
- **AI/ML 엔지니어**: Gemini API 활용 및 프롬프트 엔지니어링
- **시스템 아키텍트**: 에이전트 간 협업 구조 설계
- **QA 팀**: 에이전트 동작 테스트 및 검증

---

## 2. 에이전트 시스템 개요

### 2.1 왜 멀티에이전트인가?

**단일 대형 AI 모델의 한계:**
```
하나의 거대한 AI가 모든 박물관 업무를 처리하려면:
❌ 너무 많은 도메인 지식 필요 → 정확도 하락
❌ 컨텍스트 길이 제한 → 복잡한 작업 처리 불가
❌ 비용 증가 → 모든 요청에 Pro 모델 사용 시 고비용
❌ 유지보수 어려움 → 하나의 변경이 전체에 영향
```

**멀티에이전트 접근의 이점:**
```
각 에이전트가 특화된 영역을 담당:
✅ 높은 전문성 → 각 도메인에 최적화된 프롬프트
✅ 병렬 처리 → 여러 에이전트가 동시 작업
✅ 비용 효율 → 단순 작업은 Flash 모델 사용
✅ 확장 용이 → 새 에이전트 추가가 쉬움
✅ 실패 격리 → 한 에이전트 오류가 전체에 영향 안 줌
```

### 2.2 에이전트 시스템 철학

```yaml
Philosophy:
  1. Single Responsibility (단일 책임):
     - 각 에이전트는 하나의 명확한 역할만 수행
     - 예: Exhibition Agent는 전시 기획만, Budget Agent는 예산만
  
  2. Loose Coupling (느슨한 결합):
     - 에이전트 간 직접 의존성 최소화
     - MCP 프로토콜을 통한 메시지 기반 통신
  
  3. High Cohesion (높은 응집도):
     - 관련된 기능들을 한 에이전트에 집중
     - 예: Artwork Selection Agent는 검색+추천+큐레이션 모두 담당
  
  4. Autonomy (자율성):
     - 각 에이전트는 독립적으로 의사결정
     - Coordinator는 조정만, 강제하지 않음
  
  5. Collaboration (협업):
     - 필요 시 다른 에이전트와 협력
     - Negotiation 프로토콜로 조율
```

### 2.3 전체 에이전트 생태계

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Coordinator                         │
│               (중앙 조정자 및 메시지 라우터)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬───────────────┐
        │               │               │               │
        ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Exhibition   │ │  Budget      │ │  Artwork     │ │  Visitor     │
│   Agent      │ │   Agent      │ │  Selection   │ │  Prediction  │
│              │ │              │ │   Agent      │ │   Agent      │
│ - Plan       │ │ - Estimate   │ │ - Search     │ │ - Forecast   │
│ - Execute    │ │ - Optimize   │ │ - Recommend  │ │ - Analyze    │
│ - Generate   │ │ - Track      │ │ - Curate     │ │ - Optimize   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Space       │ │  Schedule    │ │  Guide       │ │  Notion      │
│  Design      │ │  Management  │ │  Generation  │ │  Integration │
│   Agent      │ │   Agent      │ │   Agent      │ │   Agent      │
│              │ │              │ │              │ │              │
│ - Layout     │ │ - Plan       │ │ - Generate   │ │ - Sync       │
│ - Optimize   │ │ - Coordinate │ │ - Translate  │ │ - Create     │
│ - Simulate   │ │ - Monitor    │ │ - Refine     │ │ - Update     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. 에이전트 아키텍처

### 3.1 Base Agent 클래스

```typescript
/**
 * Base Agent Class
 * 모든 에이전트가 상속받는 기본 클래스
 */
abstract class BaseAgent {
  // Agent Identity
  protected id: string;
  protected name: string;
  protected version: string;
  
  // Capabilities
  protected capabilities: string[];
  protected tools: Tool[];
  
  // State
  protected memory: AgentMemory;
  protected context: AgentContext;
  
  // Communication
  protected coordinator: AgentCoordinator;
  protected messageQueue: MessageQueue;
  
  /**
   * Constructor
   */
  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.version = config.version;
    this.capabilities = config.capabilities;
    this.tools = config.tools;
    this.memory = new AgentMemory();
    this.messageQueue = new MessageQueue();
  }
  
  /**
   * Execute Task (Abstract Method)
   * 각 에이전트가 구현해야 하는 메인 실행 메서드
   */
  abstract async execute(task: Task, context: AgentContext): Promise<ExecutionResult>;
  
  /**
   * Send Message to Another Agent
   */
  protected async sendMessage(
    toAgent: string,
    type: MessageType,
    payload: any
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: generateMessageId(),
      from: this.id,
      to: toAgent,
      type,
      payload,
      metadata: {
        timestamp: Date.now(),
        priority: 'normal',
        requiresResponse: type === 'request'
      }
    };
    
    return await this.coordinator.routeMessage(message);
  }
  
  /**
   * Receive Message from Another Agent
   */
  async receiveMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.enqueue(message);
    await this.processMessage(message);
  }
  
  /**
   * Process Message (Abstract Method)
   */
  protected abstract async processMessage(message: AgentMessage): Promise<void>;
  
  /**
   * Call Gemini API
   */
  protected async callGemini(
    prompt: string,
    model: 'flash' | 'pro' = 'flash'
  ): Promise<string> {
    const geminiService = getGeminiService();
    
    try {
      const response = await geminiService.generateContent(prompt, {
        model: model === 'flash' ? 'gemini-3.0-flash' : 'gemini-2.5-pro',
        temperature: 0.7,
        maxTokens: 2048
      });
      
      return response.text;
      
    } catch (error) {
      console.error(`[${this.name}] Gemini API Error:`, error);
      throw new AgentExecutionError(
        `Failed to call Gemini API: ${error.message}`
      );
    }
  }
  
  /**
   * Store in Memory
   */
  protected async remember(key: string, value: any): Promise<void> {
    await this.memory.store(key, value, { agentId: this.id });
  }
  
  /**
   * Retrieve from Memory
   */
  protected async recall(key: string): Promise<any> {
    return await this.memory.retrieve(key);
  }
  
  /**
   * Log Activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      level,
      message,
      data
    };
    
    console.log(`[${level.toUpperCase()}] [${this.name}] ${message}`, data || '');
    
    // Store in database for monitoring
    this.coordinator.logActivity(logEntry);
  }
}
```

### 3.2 Agent Interfaces

```typescript
/**
 * Agent Message Interface
 */
interface AgentMessage {
  id: string;
  from: string;        // Source agent ID
  to: string;          // Target agent ID
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
    correlationId?: string;  // For request-response tracking
  };
}

/**
 * Agent Context Interface
 */
interface AgentContext {
  userId: string;
  projectId?: string;
  workflowId?: string;
  sessionId: string;
  environment: 'development' | 'staging' | 'production';
  preferences: UserPreferences;
  constraints: {
    budget?: number;
    deadline?: string;
    requirements?: string[];
  };
}

/**
 * Task Interface
 */
interface Task {
  id: string;
  type: string;
  description: string;
  parameters: any;
  deadline?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dependencies?: string[];  // Other task IDs
}

/**
 * Execution Result Interface
 */
interface ExecutionResult {
  success: boolean;
  data: any;
  metadata: {
    executionTime: number;  // ms
    tokenUsage: number;
    cost: number;           // USD
    confidence: number;     // 0-1
  };
  errors?: ExecutionError[];
  warnings?: string[];
}

/**
 * Agent Tool Interface
 */
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: any) => Promise<any>;
}
```

---

## 4. 8개 전문 에이전트 명세

### 4.1 Exhibition Planning Agent (전시 기획 에이전트)

```typescript
class ExhibitionAgent extends BaseAgent {
  constructor() {
    super({
      id: 'agent-exhibition',
      name: 'Exhibition Planning Agent',
      version: '1.0.0',
      capabilities: [
        'plan_exhibition',
        'generate_concept',
        'select_artworks',
        'create_timeline',
        'collaborate'
      ],
      tools: [
        new ArtworkSearchTool(),
        new TimelineTool(),
        new ConceptGeneratorTool()
      ]
    });
  }
  
  /**
   * Plan Exhibition
   * 전시 전체 기획 수행
   */
  async execute(task: Task, context: AgentContext): Promise<ExecutionResult> {
    this.log('info', 'Starting exhibition planning', { task });
    
    const startTime = Date.now();
    let tokenUsage = 0;
    
    try {
      // Step 1: Generate Exhibition Concept
      const concept = await this.generateConcept(task.parameters);
      tokenUsage += concept.tokenUsage;
      
      // Step 2: Select Artworks (협업: Artwork Selection Agent)
      const artworks = await this.selectArtworks(concept, task.parameters.budget);
      
      // Step 3: Create Timeline (협업: Schedule Agent)
      const timeline = await this.createTimeline(task.parameters.duration);
      
      // Step 4: Generate Workflow Nodes
      const workflowNodes = await this.generateWorkflowNodes(
        concept,
        artworks,
        timeline
      );
      tokenUsage += workflowNodes.tokenUsage;
      
      // Step 5: Collaborate with Budget Agent
      const budgetPlan = await this.requestBudgetPlan(
        artworks,
        task.parameters.budget
      );
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          concept,
          artworks,
          timeline,
          workflowNodes,
          budgetPlan
        },
        metadata: {
          executionTime,
          tokenUsage,
          cost: tokenUsage * 0.000075, // $0.075 per 1M tokens
          confidence: 0.85
        }
      };
      
    } catch (error) {
      this.log('error', 'Exhibition planning failed', { error });
      throw error;
    }
  }
  
  /**
   * Generate Exhibition Concept
   */
  private async generateConcept(params: any): Promise<any> {
    const prompt = `
당신은 박물관 큐레이터입니다. 다음 정보를 바탕으로 전시 컨셉을 생성하세요:

주제: ${params.theme}
예산: ${params.budget} 원
기간: ${params.duration}
목표 관람객: ${params.targetAudience || '일반 대중'}

다음 JSON 형식으로 응답하세요:
{
  "title": "전시 제목",
  "subtitle": "부제",
  "description": "전시 설명 (200자 이내)",
  "mainTheme": "핵심 주제",
  "subThemes": ["소주제1", "소주제2"],
  "narrativeStructure": "스토리텔링 구조",
  "expectedVisitors": 예상 관람객 수,
  "educationalGoals": ["교육 목표1", "교육 목표2"]
}
    `.trim();
    
    const response = await this.callGemini(prompt, 'flash');
    const concept = JSON.parse(response);
    
    // Store in memory for future reference
    await this.remember('last_concept', concept);
    
    return {
      ...concept,
      tokenUsage: response.length / 4 // rough estimate
    };
  }
  
  /**
   * Select Artworks (Collaborate with Artwork Selection Agent)
   */
  private async selectArtworks(concept: any, budget: number): Promise<any> {
    const message = await this.sendMessage(
      'agent-artwork',
      'request',
      {
        action: 'recommend_artworks',
        data: {
          theme: concept.mainTheme,
          subThemes: concept.subThemes,
          budget,
          count: 15
        }
      }
    );
    
    // Wait for response
    const response = await this.waitForResponse(message.id, 10000); // 10s timeout
    return response.payload.data;
  }
  
  /**
   * Create Timeline (Collaborate with Schedule Agent)
   */
  private async createTimeline(duration: string): Promise<any> {
    const message = await this.sendMessage(
      'agent-schedule',
      'request',
      {
        action: 'create_timeline',
        data: { duration }
      }
    );
    
    const response = await this.waitForResponse(message.id, 5000);
    return response.payload.data;
  }
  
  /**
   * Generate Workflow Nodes
   */
  private async generateWorkflowNodes(
    concept: any,
    artworks: any[],
    timeline: any
  ): Promise<any> {
    const prompt = `
전시 컨셉과 작품 목록을 바탕으로 워크플로우 노드들을 생성하세요:

컨셉: ${concept.title}
작품 수: ${artworks.length}
기간: ${timeline.duration}

다음 18-20개의 노드를 JSON 배열로 생성하세요:
1. 컨셉 개발
2. 작품 선정 및 대여
3. 예산 승인
4. 공간 설계
5. 조명 설계
6. 작품 운송
7. 설치 및 진열
8. 도록 제작
9. 마케팅 계획
10. SNS 캠페인
... (18-20개)

형식:
[
  {
    "id": "node-1",
    "type": "task",
    "title": "노드 제목",
    "description": "노드 설명",
    "assignedAgent": "agent-exhibition",
    "dependencies": [],
    "estimatedDuration": "3 days"
  },
  ...
]
    `.trim();
    
    const response = await this.callGemini(prompt, 'flash');
    const nodes = JSON.parse(response);
    
    return {
      nodes,
      tokenUsage: response.length / 4
    };
  }
  
  /**
   * Request Budget Plan (Collaborate with Budget Agent)
   */
  private async requestBudgetPlan(artworks: any[], budget: number): Promise<any> {
    const message = await this.sendMessage(
      'agent-budget',
      'request',
      {
        action: 'create_budget_plan',
        data: { artworks, totalBudget: budget }
      }
    );
    
    const response = await this.waitForResponse(message.id, 15000); // 15s
    return response.payload.data;
  }
  
  /**
   * Wait for Response Message
   */
  private async waitForResponse(
    correlationId: string,
    timeout: number
  ): Promise<AgentMessage> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const message = await this.messageQueue.dequeue((msg) =>
        msg.metadata.correlationId === correlationId &&
        msg.type === 'response'
      );
      
      if (message) {
        return message;
      }
      
      await sleep(100); // Check every 100ms
    }
    
    throw new Error(`Timeout waiting for response (correlationId: ${correlationId})`);
  }
  
  /**
   * Process Message from Other Agents
   */
  protected async processMessage(message: AgentMessage): Promise<void> {
    const { action, data } = message.payload;
    
    switch (action) {
      case 'update_timeline':
        // Handle timeline update from Schedule Agent
        await this.handleTimelineUpdate(data);
        break;
      
      case 'budget_approved':
        // Handle budget approval from Budget Agent
        await this.handleBudgetApproval(data);
        break;
      
      default:
        this.log('warn', 'Unknown message action', { action });
    }
  }
  
  private async handleTimelineUpdate(data: any): Promise<void> {
    this.log('info', 'Timeline updated by Schedule Agent', data);
    // Update internal state...
  }
  
  private async handleBudgetApproval(data: any): Promise<void> {
    this.log('info', 'Budget approved by Budget Agent', data);
    // Proceed with next steps...
  }
}
```

### 4.2 Budget Management Agent (예산 관리 에이전트)

```typescript
class BudgetAgent extends BaseAgent {
  constructor() {
    super({
      id: 'agent-budget',
      name: 'Budget Management Agent',
      version: '1.0.0',
      capabilities: [
        'estimate_budget',
        'optimize_budget',
        'track_spending',
        'recommend_alternatives'
      ],
      tools: [
        new CostEstimatorTool(),
        new OptimizerTool(),
        new BudgetTrackerTool()
      ]
    });
  }
  
  async execute(task: Task, context: AgentContext): Promise<ExecutionResult> {
    const { action, data } = task.parameters;
    
    switch (action) {
      case 'create_budget_plan':
        return await this.createBudgetPlan(data);
      
      case 'optimize_budget':
        return await this.optimizeBudget(data);
      
      case 'track_spending':
        return await this.trackSpending(data);
      
      default:
        throw new Error(`Unknown budget action: ${action}`);
    }
  }
  
  /**
   * Create Budget Plan
   */
  private async createBudgetPlan(data: any): Promise<ExecutionResult> {
    const { artworks, totalBudget } = data;
    
    const prompt = `
다음 작품들을 전시하는 데 필요한 예산을 상세히 계획하세요:

작품 수: ${artworks.length}
총 예산: ${totalBudget} 원

다음 카테고리별로 예산을 배분하세요:
1. 작품 운송 및 보험 (20-25%)
2. 공간 설치 및 디자인 (25-30%)
3. 마케팅 및 홍보 (15-20%)
4. 도록 및 교육 자료 (10-15%)
5. 인건비 (15-20%)
6. 기타 운영비 (5-10%)

JSON 형식으로 응답:
{
  "categories": [
    {
      "name": "작품 운송 및 보험",
      "amount": 20000000,
      "percentage": 20,
      "breakdown": [
        { "item": "운송비", "amount": 12000000 },
        { "item": "보험료", "amount": 8000000 }
      ]
    },
    ...
  ],
  "totalAllocated": 100000000,
  "contingency": 5000000,
  "optimizationSuggestions": [
    "제안 1",
    "제안 2"
  ]
}
    `.trim();
    
    const response = await this.callGemini(prompt, 'flash');
    const budgetPlan = JSON.parse(response);
    
    return {
      success: true,
      data: budgetPlan,
      metadata: {
        executionTime: 5000,
        tokenUsage: response.length / 4,
        cost: 0.0001,
        confidence: 0.9
      }
    };
  }
  
  /**
   * Optimize Budget
   */
  private async optimizeBudget(data: any): Promise<ExecutionResult> {
    // Implementation...
  }
  
  /**
   * Track Spending
   */
  private async trackSpending(data: any): Promise<ExecutionResult> {
    // Implementation...
  }
  
  protected async processMessage(message: AgentMessage): Promise<void> {
    // Handle messages from other agents
  }
}
```

### 4.3-4.8 Other Agents

_(Artwork Selection, Visitor Prediction, Space Design, Schedule Management, Guide Generation, Notion Integration Agents는 유사한 패턴으로 구현)_

---

## 5. 에이전트 통신 프로토콜 (MCP)

### 5.1 MCP (Multi-agent Communication Protocol) 개요

```yaml
Protocol Name: MCP (Multi-agent Communication Protocol)
Version: 1.0
Based On: JSON-RPC 2.0 with extensions

Key Features:
  - Asynchronous message passing
  - Request-response pattern
  - Event broadcasting
  - Negotiation support
  - Priority queue
  - Timeout management
```

### 5.2 Message Types

```typescript
/**
 * 1. Request Message
 * 다른 에이전트에게 작업 요청
 */
interface RequestMessage {
  type: 'request';
  payload: {
    action: string;       // 'recommend_artworks', 'create_timeline', etc.
    data: any;            // Action-specific data
    context: AgentContext;
  };
  metadata: {
    requiresResponse: true;
    correlationId: string;  // For tracking
    timeout: number;        // ms
  };
}

/**
 * 2. Response Message
 * Request에 대한 응답
 */
interface ResponseMessage {
  type: 'response';
  payload: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
    };
  };
  metadata: {
    correlationId: string;  // Matches request
    executionTime: number;
  };
}

/**
 * 3. Event Message
 * 상태 변경 알림 (Broadcast)
 */
interface EventMessage {
  type: 'event';
  payload: {
    eventType: string;    // 'workflow_completed', 'budget_approved', etc.
    data: any;
  };
  metadata: {
    broadcast: true;      // All agents receive
  };
}

/**
 * 4. Negotiation Message
 * 에이전트 간 조율
 */
interface NegotiationMessage {
  type: 'negotiation';
  payload: {
    proposal: any;        // Agent's proposal
    counterProposal?: any; // Response to another's proposal
    status: 'propose' | 'accept' | 'reject' | 'counter';
  };
  metadata: {
    negotiationId: string;
    round: number;
  };
}
```

### 5.3 Message Routing

```typescript
/**
 * Message Router
 * 메시지를 적절한 에이전트로 라우팅
 */
class MessageRouter {
  private agents: Map<string, BaseAgent>;
  private messageQueue: PriorityQueue<AgentMessage>;
  
  constructor() {
    this.agents = new Map();
    this.messageQueue = new PriorityQueue();
  }
  
  /**
   * Register Agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
  }
  
  /**
   * Route Message
   */
  async routeMessage(message: AgentMessage): Promise<void> {
    const targetAgent = this.agents.get(message.to);
    
    if (!targetAgent) {
      throw new Error(`Agent not found: ${message.to}`);
    }
    
    // Add to priority queue
    this.messageQueue.enqueue(message, this.calculatePriority(message));
    
    // Process immediately if high priority
    if (message.metadata.priority === 'urgent') {
      await this.processMessage(message);
    }
  }
  
  /**
   * Process Message
   */
  private async processMessage(message: AgentMessage): Promise<void> {
    const targetAgent = this.agents.get(message.to);
    
    try {
      await targetAgent.receiveMessage(message);
      
      // Log for monitoring
      this.logMessage(message, 'delivered');
      
    } catch (error) {
      this.logMessage(message, 'failed', error);
      
      // Send error response if required
      if (message.metadata.requiresResponse) {
        await this.sendErrorResponse(message, error);
      }
    }
  }
  
  /**
   * Calculate Priority
   */
  private calculatePriority(message: AgentMessage): number {
    const priorityMap = {
      'urgent': 4,
      'high': 3,
      'normal': 2,
      'low': 1
    };
    
    return priorityMap[message.metadata.priority] || 2;
  }
  
  /**
   * Send Error Response
   */
  private async sendErrorResponse(
    originalMessage: AgentMessage,
    error: Error
  ): Promise<void> {
    const errorResponse: AgentMessage = {
      id: generateMessageId(),
      from: originalMessage.to,
      to: originalMessage.from,
      type: 'response',
      payload: {
        success: false,
        error: {
          code: 'AGENT_ERROR',
          message: error.message
        }
      },
      metadata: {
        correlationId: originalMessage.id,
        timestamp: Date.now(),
        priority: 'normal',
        requiresResponse: false
      }
    };
    
    await this.routeMessage(errorResponse);
  }
  
  /**
   * Log Message
   */
  private logMessage(
    message: AgentMessage,
    status: 'delivered' | 'failed',
    error?: Error
  ): void {
    console.log(`[MessageRouter] ${status.toUpperCase()}`, {
      messageId: message.id,
      from: message.from,
      to: message.to,
      type: message.type,
      error: error?.message
    });
  }
}
```

---

## 6. Agent Coordinator (조정자)

```typescript
/**
 * Agent Coordinator
 * 모든 에이전트를 조정하는 중앙 컨트롤러
 */
class AgentCoordinator {
  private agents: Map<string, BaseAgent>;
  private router: MessageRouter;
  private executionLog: ExecutionLog[];
  
  constructor() {
    this.agents = new Map();
    this.router = new MessageRouter();
    this.executionLog = [];
  }
  
  /**
   * Initialize All Agents
   */
  async initialize(): Promise<void> {
    // Create and register all agents
    const exhibitionAgent = new ExhibitionAgent();
    const budgetAgent = new BudgetAgent();
    const artworkAgent = new ArtworkSelectionAgent();
    const visitorAgent = new VisitorPredictionAgent();
    const spaceAgent = new SpaceDesignAgent();
    const scheduleAgent = new ScheduleManagementAgent();
    const guideAgent = new GuideGenerationAgent();
    const notionAgent = new NotionIntegrationAgent();
    
    this.registerAgent(exhibitionAgent);
    this.registerAgent(budgetAgent);
    this.registerAgent(artworkAgent);
    this.registerAgent(visitorAgent);
    this.registerAgent(spaceAgent);
    this.registerAgent(scheduleAgent);
    this.registerAgent(guideAgent);
    this.registerAgent(notionAgent);
    
    console.log('[Coordinator] All agents initialized successfully');
  }
  
  /**
   * Register Agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    this.router.registerAgent(agent);
    agent.setCoordinator(this);
  }
  
  /**
   * Execute Task
   * 외부에서 호출되는 메인 진입점
   */
  async executeTask(
    agentId: string,
    task: Task,
    context: AgentContext
  ): Promise<ExecutionResult> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    const executionId = generateExecutionId();
    
    this.log('info', 'Task execution started', {
      executionId,
      agentId,
      task
    });
    
    try {
      const result = await agent.execute(task, context);
      
      // Log execution
      this.executionLog.push({
        executionId,
        agentId,
        task,
        result,
        timestamp: Date.now()
      });
      
      // Store in database
      await this.storeExecution(executionId, agentId, task, result);
      
      this.log('info', 'Task execution completed', { executionId });
      
      return result;
      
    } catch (error) {
      this.log('error', 'Task execution failed', { executionId, error });
      throw error;
    }
  }
  
  /**
   * Route Message (Called by agents)
   */
  async routeMessage(message: AgentMessage): Promise<AgentMessage> {
    await this.router.routeMessage(message);
    return message;
  }
  
  /**
   * Broadcast Event
   */
  async broadcastEvent(
    eventType: string,
    data: any,
    fromAgent: string
  ): Promise<void> {
    const event: AgentMessage = {
      id: generateMessageId(),
      from: fromAgent,
      to: 'broadcast',
      type: 'event',
      payload: { eventType, data },
      metadata: {
        timestamp: Date.now(),
        priority: 'normal',
        requiresResponse: false,
        broadcast: true
      }
    };
    
    // Send to all agents except sender
    for (const [agentId, agent] of this.agents) {
      if (agentId !== fromAgent) {
        await agent.receiveMessage(event);
      }
    }
  }
  
  /**
   * Store Execution in Database
   */
  private async storeExecution(
    executionId: string,
    agentId: string,
    task: Task,
    result: ExecutionResult
  ): Promise<void> {
    const db = getDatabase();
    
    await db.prepare(`
      INSERT INTO agent_executions (
        id, agent_name, task, result, status,
        execution_time_ms, token_usage, cost, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      executionId,
      agentId,
      JSON.stringify(task),
      JSON.stringify(result.data),
      result.success ? 'completed' : 'failed',
      result.metadata.executionTime,
      result.metadata.tokenUsage,
      result.metadata.cost,
      new Date().toISOString()
    ).run();
  }
  
  /**
   * Get Agent Status
   */
  getAgentStatus(agentId: string): AgentStatus {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    return {
      id: agent.id,
      name: agent.name,
      status: 'online',
      capabilities: agent.capabilities,
      activeExecutions: agent.getActiveExecutions().length,
      totalExecutions: this.getAgentExecutionCount(agentId),
      lastActivity: agent.getLastActivityTime()
    };
  }
  
  /**
   * Get All Agents Status
   */
  getAllAgentsStatus(): AgentStatus[] {
    return Array.from(this.agents.keys()).map(agentId =>
      this.getAgentStatus(agentId)
    );
  }
  
  /**
   * Get Execution History
   */
  getExecutionHistory(limit: number = 100): ExecutionLog[] {
    return this.executionLog.slice(-limit);
  }
  
  private log(level: string, message: string, data?: any): void {
    console.log(`[Coordinator] [${level.toUpperCase()}] ${message}`, data || '');
  }
  
  private getAgentExecutionCount(agentId: string): number {
    return this.executionLog.filter(log => log.agentId === agentId).length;
  }
}
```

---

## 7. 에이전트 협업 시나리오

### 7.1 시나리오: 전시 기획 (Multi-Agent Orchestration)

```
User Request: "다음 달 인상파 전시 기획, 예산 1억, 기간 3개월"
                              ↓
                    ┌─────────────────────┐
                    │ Agent Coordinator    │
                    └──────────┬───────────┘
                               │
                  Intent Recognition (Gemini)
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Exhibition   │  │  Budget      │  │  Artwork     │
    │   Agent      │  │   Agent      │  │  Selection   │
    └──────────────┘  └──────────────┘  └──────────────┘
         │ (1)              │ (2)              │ (3)
         │ generateConcept  │ estimateBudget   │ recommendArtworks
         ▼                  ▼                  ▼
    "인상파 전시"       ₩100,000,000      15점 작품 리스트
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Schedule    │ │   Space      │ │   Guide      │
    │   Agent      │ │   Agent      │ │   Agent      │
    └──────────────┘ └──────────────┘ └──────────────┘
         │ (4)            │ (5)            │ (6)
         │ createTimeline │ designLayout   │ generateScript
         ▼                ▼                ▼
    간트 차트         3D 레이아웃      도슨트 스크립트
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
              ┌────────────────────┐
              │ Notion Agent (7)   │
              │ syncToNotion()     │
              └────────────────────┘
                          │
                          ▼
              ┌────────────────────┐
              │ Final Workflow     │
              │ (18-20 nodes)      │
              │ + Notion Project   │
              └────────────────────┘
                          │
                          ▼
                   User receives result
                   (5-10 seconds total)
```

**Message Flow:**

```typescript
// Step 1: Coordinator → Exhibition Agent
coordinator.executeTask('agent-exhibition', {
  type: 'plan_exhibition',
  parameters: {
    theme: '인상파 전시',
    budget: 100000000,
    duration: 'P3M'
  }
}, context);

// Step 2: Exhibition Agent → Artwork Selection Agent
exhibitionAgent.sendMessage('agent-artwork', 'request', {
  action: 'recommend_artworks',
  data: { theme: '인상파', count: 15 }
});

// Step 3: Artwork Selection Agent → Exhibition Agent (Response)
artworkAgent.sendMessage('agent-exhibition', 'response', {
  success: true,
  data: { artworks: [...] }
});

// Step 4: Exhibition Agent → Budget Agent
exhibitionAgent.sendMessage('agent-budget', 'request', {
  action: 'create_budget_plan',
  data: { artworks: [...], totalBudget: 100000000 }
});

// Step 5: Budget Agent → Exhibition Agent (Response)
budgetAgent.sendMessage('agent-exhibition', 'response', {
  success: true,
  data: { budgetPlan: {...} }
});

// Step 6: Exhibition Agent → Schedule Agent
exhibitionAgent.sendMessage('agent-schedule', 'request', {
  action: 'create_timeline',
  data: { duration: 'P3M' }
});

// Step 7: Exhibition Agent → Notion Agent
exhibitionAgent.sendMessage('agent-notion', 'request', {
  action: 'create_project',
  data: { workflow: {...} }
});

// Step 8: Exhibition Agent → Coordinator (Final Result)
return {
  success: true,
  data: { workflow, concept, artworks, budget, timeline }
};
```

---

## 8. 성능 및 비용 최적화

### 8.1 모델 선택 전략

```typescript
/**
 * Smart Model Selection
 * 작업 복잡도에 따라 적절한 모델 선택
 */
class ModelSelector {
  /**
   * Select Model Based on Task Complexity
   */
  selectModel(task: Task): 'flash' | 'pro' {
    const complexityScore = this.calculateComplexity(task);
    
    if (complexityScore > 7) {
      // High complexity → Use Pro model
      return 'pro';
    } else {
      // Low-medium complexity → Use Flash model
      return 'flash';
    }
  }
  
  /**
   * Calculate Task Complexity
   */
  private calculateComplexity(task: Task): number {
    let score = 0;
    
    // Factor 1: Task type
    const complexTaskTypes = [
      'plan_exhibition',
      'generate_workflow',
      'analyze_complex_data'
    ];
    if (complexTaskTypes.includes(task.type)) {
      score += 5;
    }
    
    // Factor 2: Data volume
    const dataSize = JSON.stringify(task.parameters).length;
    if (dataSize > 10000) {
      score += 3;
    }
    
    // Factor 3: Required accuracy
    if (task.priority === 'urgent' || task.parameters.requireHighAccuracy) {
      score += 2;
    }
    
    return score;
  }
}
```

### 8.2 캐싱 전략

```typescript
/**
 * Response Cache
 * 동일한 요청에 대한 응답 캐싱
 */
class ResponseCache {
  private cache: Map<string, CachedResponse>;
  private ttl: number = 3600000; // 1 hour
  
  /**
   * Get from Cache
   */
  async get(key: string): Promise<any | null> {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check expiration
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Set to Cache
   */
  async set(key: string, data: any): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Generate Cache Key
   */
  generateKey(agentId: string, task: Task): string {
    return `${agentId}:${task.type}:${hashObject(task.parameters)}`;
  }
}

// Usage in Agent
async execute(task: Task, context: AgentContext): Promise<ExecutionResult> {
  const cacheKey = this.cache.generateKey(this.id, task);
  
  // Try cache first
  const cached = await this.cache.get(cacheKey);
  if (cached) {
    this.log('info', 'Using cached response', { cacheKey });
    return cached;
  }
  
  // Execute task
  const result = await this.executeTask(task, context);
  
  // Cache result
  await this.cache.set(cacheKey, result);
  
  return result;
}
```

### 8.3 비용 추적

```typescript
/**
 * Cost Tracker
 * API 비용 실시간 추적
 */
class CostTracker {
  private costs: CostLog[] = [];
  
  /**
   * Track API Call
   */
  trackAPICall(
    agentId: string,
    model: 'flash' | 'pro',
    tokenUsage: number
  ): number {
    const costPerToken = model === 'flash' ? 0.000000075 : 0.0000005;
    const cost = tokenUsage * costPerToken;
    
    this.costs.push({
      timestamp: Date.now(),
      agentId,
      model,
      tokenUsage,
      cost
    });
    
    return cost;
  }
  
  /**
   * Get Daily Cost
   */
  getDailyCost(date?: Date): number {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).getTime();
    
    return this.costs
      .filter(log => log.timestamp >= startOfDay && log.timestamp <= endOfDay)
      .reduce((sum, log) => sum + log.cost, 0);
  }
  
  /**
   * Get Cost by Agent
   */
  getCostByAgent(agentId: string, days: number = 7): number {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return this.costs
      .filter(log => log.agentId === agentId && log.timestamp >= cutoff)
      .reduce((sum, log) => sum + log.cost, 0);
  }
  
  /**
   * Get Cost Summary
   */
  getSummary(days: number = 7): CostSummary {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentCosts = this.costs.filter(log => log.timestamp >= cutoff);
    
    const totalCost = recentCosts.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = recentCosts.reduce((sum, log) => sum + log.tokenUsage, 0);
    const flashCalls = recentCosts.filter(log => log.model === 'flash').length;
    const proCalls = recentCosts.filter(log => log.model === 'pro').length;
    
    return {
      totalCost,
      totalTokens,
      averageCostPerCall: totalCost / recentCosts.length,
      flashCalls,
      proCalls,
      costByAgent: this.groupCostsByAgent(recentCosts)
    };
  }
  
  private groupCostsByAgent(costs: CostLog[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const cost of costs) {
      grouped[cost.agentId] = (grouped[cost.agentId] || 0) + cost.cost;
    }
    
    return grouped;
  }
}
```

---

## 9. 에이전트 모니터링 및 디버깅

### 9.1 Monitoring Dashboard

```typescript
/**
 * Agent Monitor
 * 에이전트 상태 실시간 모니터링
 */
class AgentMonitor {
  private coordinator: AgentCoordinator;
  private metrics: MetricsCollector;
  
  /**
   * Get Real-time Metrics
   */
  getRealTimeMetrics(): AgentMetrics {
    const agents = this.coordinator.getAllAgentsStatus();
    
    return {
      totalAgents: agents.length,
      onlineAgents: agents.filter(a => a.status === 'online').length,
      activeExecutions: agents.reduce((sum, a) => sum + a.activeExecutions, 0),
      totalExecutions: agents.reduce((sum, a) => sum + a.totalExecutions, 0),
      averageResponseTime: this.metrics.getAverageResponseTime(),
      successRate: this.metrics.getSuccessRate(),
      errorRate: this.metrics.getErrorRate()
    };
  }
  
  /**
   * Get Agent Health
   */
  getAgentHealth(agentId: string): AgentHealth {
    const status = this.coordinator.getAgentStatus(agentId);
    const history = this.coordinator.getExecutionHistory()
      .filter(log => log.agentId === agentId)
      .slice(-100);
    
    const successCount = history.filter(log => log.result.success).length;
    const errorCount = history.length - successCount;
    
    return {
      agentId,
      status: status.status,
      uptime: Date.now() - status.lastActivity,
      successRate: successCount / history.length,
      errorRate: errorCount / history.length,
      averageExecutionTime: this.calculateAverageTime(history),
      lastError: this.getLastError(history)
    };
  }
  
  /**
   * Detect Anomalies
   */
  detectAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Check for slow agents
    const agents = this.coordinator.getAllAgentsStatus();
    for (const agent of agents) {
      const health = this.getAgentHealth(agent.id);
      
      if (health.averageExecutionTime > 30000) {
        anomalies.push({
          type: 'slow_agent',
          agentId: agent.id,
          severity: 'warning',
          message: `Agent ${agent.name} is responding slowly (avg: ${health.averageExecutionTime}ms)`
        });
      }
      
      if (health.errorRate > 0.2) {
        anomalies.push({
          type: 'high_error_rate',
          agentId: agent.id,
          severity: 'error',
          message: `Agent ${agent.name} has high error rate (${(health.errorRate * 100).toFixed(1)}%)`
        });
      }
    }
    
    return anomalies;
  }
  
  private calculateAverageTime(history: ExecutionLog[]): number {
    if (history.length === 0) return 0;
    const sum = history.reduce((s, log) => s + log.result.metadata.executionTime, 0);
    return sum / history.length;
  }
  
  private getLastError(history: ExecutionLog[]): string | null {
    const errors = history.filter(log => !log.result.success);
    if (errors.length === 0) return null;
    return errors[errors.length - 1].result.errors?.[0]?.message || 'Unknown error';
  }
}
```

---

## 10. 확장 및 유지보수

### 10.1 새 에이전트 추가하기

```typescript
/**
 * Example: Image Analysis Agent
 * 새 에이전트 추가 예시
 */
class ImageAnalysisAgent extends BaseAgent {
  constructor() {
    super({
      id: 'agent-image-analysis',
      name: 'Image Analysis Agent',
      version: '1.0.0',
      capabilities: [
        'analyze_artwork_image',
        'detect_objects',
        'extract_colors',
        'estimate_period'
      ],
      tools: [
        new ObjectDetectionTool(),
        new ColorExtractionTool()
      ]
    });
  }
  
  async execute(task: Task, context: AgentContext): Promise<ExecutionResult> {
    // Implementation...
  }
  
  protected async processMessage(message: AgentMessage): Promise<void> {
    // Handle messages...
  }
}

// Register in Coordinator
const coordinator = getCoordinator();
const imageAgent = new ImageAnalysisAgent();
coordinator.registerAgent(imageAgent);
```

---

## Document Metadata

- **Version**: 1.0.0
- **Last Updated**: 2025-01-22
- **Next Review**: 2025-02-22
- **Owner**: Nam Hyun-woo (남현우 교수)
- **Reviewers**: Backend Team, AI Team
- **Confidentiality**: Internal Use Only

---

**End of Document 4: Multi-Agent Collaboration Framework Document**

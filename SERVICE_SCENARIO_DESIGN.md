# MuseFlow AI Orchestration System
## 최종 서비스 시나리오 설계서

**Version**: 1.0  
**Date**: 2025-12-03  
**Author**: 남현우 교수  
**Status**: ✅ 설계 완료 - 구현 대기

---

## 📋 목차

1. [비전 및 핵심 가치](#1-비전-및-핵심-가치)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [상세 서비스 시나리오](#3-상세-서비스-시나리오)
4. [AI 오케스트레이션 설계](#4-ai-오케스트레이션-설계)
5. [Dashboard ↔ Canvas 통합](#5-dashboard--canvas-통합)
6. [87개 위젯 통합 계획](#6-87개-위젯-통합-계획)
7. [진화형 AI 시스템](#7-진화형-ai-시스템)
8. [UX/UI 설계](#8-uxui-설계)
9. [기술 스택 및 구현 계획](#9-기술-스택-및-구현-계획)
10. [성공 지표 및 평가](#10-성공-지표-및-평가)

---

## 1. 비전 및 핵심 가치

### 🎯 핵심 비전
> **"AI가 모든 업무를 처리하고, 학예사는 최종 의사결정만 한다"**

### ✨ 핵심 가치
- **업무 효율성**: 기존 8시간 작업 → 1시간 (87.5% 단축)
- **지능형 자동화**: AI가 컨텍스트를 이해하고 자율 실행
- **실시간 모니터링**: Canvas 작업 결과 → Dashboard 즉시 반영
- **진화형 학습**: 사용 데이터 축적 → AI 자율성 강화

### 🎭 대상 사용자
- **주 사용자**: 미술관/박물관 학예사 (Curator)
- **업무 범위**: 전시 기획, 소장품 관리, 교육 프로그램, 예산 관리, 홍보 등

---

## 2. 시스템 아키텍처

### 🏗️ 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     MuseFlow Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐          ┌──────────────┐                 │
│  │  Dashboard  │◄────────►│   Canvas V5  │                 │
│  │ (모니터링)    │  실시간   │  (작업공간)   │                 │
│  │             │  동기화   │              │                 │
│  │  87 Widgets │          │  AI Node     │                 │
│  │             │          │  Workflow    │                 │
│  └──────┬──────┘          └──────┬───────┘                 │
│         │                        │                          │
│         └────────┬───────────────┘                          │
│                  │                                           │
│         ┌────────▼─────────┐                                │
│         │                  │                                │
│         │  AI Orchestrator │                                │
│         │  (Multi-Agent)   │                                │
│         │                  │                                │
│         │  • Research AI   │                                │
│         │  • Canvas AI     │                                │
│         │  • Document AI   │                                │
│         │  • Widget AI     │                                │
│         │  • Monitor AI    │                                │
│         │                  │                                │
│         └────────┬─────────┘                                │
│                  │                                           │
│         ┌────────▼─────────┐                                │
│         │                  │                                │
│         │  Cloudflare D1   │                                │
│         │  Database        │                                │
│         │                  │                                │
│         │  • Projects      │                                │
│         │  • Widgets       │                                │
│         │  • AI Sessions   │                                │
│         │  • Learning Data │                                │
│         │                  │                                │
│         └──────────────────┘                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 🔗 데이터 흐름

```
사용자 명령
    ↓
Dashboard AI 패널
    ↓
AI Orchestrator (명령 파싱)
    ↓
Multi-Agent 실행
    ↓
Canvas Workflow 자동 생성
    ↓
Dashboard Widget 실시간 업데이트
    ↓
AI 결과 제시 → 사용자 최종 결정
    ↓
Learning Data 저장 (AI 진화)
```

---

## 3. 상세 서비스 시나리오

### 📌 시나리오 A: 예산 승인 업무 (대화형 모드 - Stage 1)

#### 현황 (As-Is)
- **소요시간**: 90분
- **클릭 수**: 50+ 클릭
- **작업**: 수동으로 Canvas 진입 → 노드 생성 → 데이터 입력 → Dashboard 확인

#### 개선 (To-Be)
- **소요시간**: 5분 (94% 단축)
- **클릭 수**: 2 클릭 (96% 단축)
- **AI 자동화율**: 95%

#### 상세 플로우

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Dashboard에서 업무 확인                              │
└─────────────────────────────────────────────────────────────┘

학예사가 Dashboard에 접속
    ↓
오늘 할 일: "예산 승인 필요" (Task Widget에서 확인)
    ↓
학예사: Dashboard AI 패널 클릭
    ↓
학예사: "인상주의 전시 예산 승인해줘" (음성/텍스트 입력)


┌─────────────────────────────────────────────────────────────┐
│ Step 2: AI 대화형 모드 실행                                  │
└─────────────────────────────────────────────────────────────┘

AI: "인상주의 전시의 예산 규모는 어느 정도로 생각하시나요?"
학예사: "3천만원 정도"

AI: "예산 항목을 자동 분석했습니다:
     - 작품 대여비: 1,500만원 (50%)
     - 보험료: 600만원 (20%)
     - 전시 디자인: 450만원 (15%)
     - 홍보비: 300만원 (10%)
     - 기타: 150만원 (5%)
     이대로 진행할까요?"

학예사: "홍보비를 500만원으로 늘려줘"

AI: "홍보비를 500만원으로 조정했습니다. (기타에서 200만원 이동)
     Canvas에서 예산안 작성을 시작합니다."


┌─────────────────────────────────────────────────────────────┐
│ Step 3: Canvas 자동 Workflow 생성 (백그라운드)               │
└─────────────────────────────────────────────────────────────┘

AI가 자동으로 Canvas에 다음 노드 생성:
    ↓
[1] 예산 계획 차트 노드
    - 3천만원 총 예산
    - 5개 항목 자동 분류
    - 파이 차트 렌더링

[2] 예산 근거 문서 노드
    - Google Docs 자동 생성
    - "인상주의 전시 예산 계획서" 제목
    - 항목별 상세 설명 자동 작성

[3] 예산 검토 Task 노드
    - 담당자: 관리부서
    - 기한: 3일 후
    - 상태: 검토 대기


┌─────────────────────────────────────────────────────────────┐
│ Step 4: Dashboard 실시간 업데이트                            │
└─────────────────────────────────────────────────────────────┘

Dashboard Widgets 즉시 업데이트:
    ↓
[Budget Comparison Widget]
    - 3천만원 예산 반영
    - 항목별 비율 차트 표시
    - 전년 대비 +15% 표시

[Exhibition Calendar Widget]
    - "인상주의 전시" 일정 추가
    - 예산 확정 마일스톤 표시

[Task Assignment Board Widget]
    - "예산 검토" 신규 Task 추가
    - 관리부서에 자동 알림

[Progress Status Widget]
    - 전시 기획 진행률: 30% → 50%
    - 예산 단계 완료 표시


┌─────────────────────────────────────────────────────────────┐
│ Step 5: 학예사 최종 검토 및 승인                             │
└─────────────────────────────────────────────────────────────┘

학예사: Canvas에서 생성된 예산안 확인
    ↓
학예사: "승인" 버튼 클릭
    ↓
AI: "예산안이 승인되었습니다. 
     Google Docs에 공유되었고, 관리부서에 알림이 전송되었습니다."
    ↓
Dashboard 상태 업데이트:
    - Task Status: "승인 완료" ✓
    - 예산 항목: 확정됨 (녹색 표시)
```

#### 학습 데이터 수집

```sql
INSERT INTO learning_data (
    user_id,
    task_type,
    user_input,
    ai_decision,
    user_feedback,
    success_rate
) VALUES (
    1,
    'budget_approval',
    '인상주의 전시 예산 3천만원, 홍보비 500만원',
    '5개 항목 자동 분류, Canvas 노드 3개 생성',
    'approved',
    100
);
```

---

### 📌 시나리오 B: 전시 기획 업무 (자율형 모드 - Stage 3)

> **전제조건**: 100+ 학습 데이터 축적 (6개월 후)

#### 상세 플로우

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: AI에게 한 번만 명령                                  │
└─────────────────────────────────────────────────────────────┘

학예사: Dashboard AI 패널에서
        "다음 주 인상주의 전시를 기획해줘"


┌─────────────────────────────────────────────────────────────┐
│ Step 2: AI가 1시간 동안 자율 실행 (과정 실시간 표시)        │
└─────────────────────────────────────────────────────────────┘

[Phase 1: 리서치 (15분)]
    ↓
AI Research Agent 실행:
    - Google 검색: "인상주의 작품 목록"
    - 위키피디아: "Impressionism Exhibition History"
    - 뉴욕 MoMA 사이트: "Impressionist Collection"
    - 루브르 박물관 API: 작품 대여 가능 여부 확인
    ↓
Dashboard 업데이트:
    - [Research Status Widget]: "50개 작품 후보 발견"
    - [Progress Widget]: Phase 1 완료 (25%)


[Phase 2: 컨셉 생성 (10분)]
    ↓
AI Canvas Agent 실행:
    - Canvas에 "전시 컨셉" 노드 생성
    - 3가지 컨셉 자동 생성:
        1. "빛과 색채의 혁명" (모네 중심)
        2. "파리의 순간들" (도시 풍경 중심)
        3. "인상주의의 탄생" (역사적 관점)
    ↓
Dashboard 업데이트:
    - [Exhibition Concept Widget]: 3가지 옵션 표시
    - [AI Recommendation]: "빛과 색채의 혁명" 추천 (과거 성공률 85%)


[Phase 3: 예산 계산 (5분)]
    ↓
AI Budget Agent 실행:
    - 과거 전시 데이터 분석 (Learning Data 활용)
    - 평균 비용 계산: 작품 대여 (50%), 보험 (20%), 디자인 (15%)...
    - 총 예산: 3,500만원 자동 계산
    ↓
Canvas 업데이트:
    - "예산 계획" 차트 노드 생성
    - 항목별 세부 내역 자동 입력
    ↓
Dashboard 업데이트:
    - [Budget Comparison Widget]: 3,500만원 반영
    - [Budget Alert]: "전년 대비 +10% (적정 범위)"


[Phase 4: 홍보 계획 (10분)]
    ↓
AI Document Agent 실행:
    - Google Docs 자동 생성: "인상주의 전시 홍보 계획서"
    - SNS 콘텐츠 10개 자동 생성 (Instagram, Facebook, Twitter)
    - 보도자료 초안 작성
    - 이메일 캠페인 템플릿 생성
    ↓
Canvas 업데이트:
    - "홍보 문구" 노드 생성 (10개 변형)
    - "SNS 일정" 노드 생성 (Timeline)
    ↓
Dashboard 업데이트:
    - [Email Campaign Widget]: 10개 콘텐츠 준비 완료
    - [Social Engagement Widget]: 예상 도달 범위 표시


[Phase 5: 교육 프로그램 (10분)]
    ↓
AI Curriculum Agent 실행:
    - "어린이 미술 교육" 프로그램 자동 생성
    - 대상: 초등학생 4-6학년
    - 커리큘럼: 4주 과정, 주 1회 2시간
    - 학습 목표: 인상주의 이해, 색채 감각 발달
    ↓
Canvas 업데이트:
    - "교육 프로그램" 노드 생성
    - 주차별 수업 계획 자동 작성
    ↓
Dashboard 업데이트:
    - [Educational Program Widget]: 프로그램 일정 표시
    - [Visitor Experience Widget]: 예상 참가자 100명


[Phase 6: 워크플로우 완성 (5분)]
    ↓
AI Monitor Agent 실행:
    - Canvas의 모든 노드 연결 확인
    - 누락된 항목 체크
    - Timeline 자동 조정 (전시 준비 기간: 6주)
    ↓
Canvas 최종 상태:
    - 총 15개 노드 자동 생성
    - 모든 노드 연결 완료
    - Workflow 완성도: 95%


[Phase 7: 외부 통합 (5분)]
    ↓
AI Integration Agent 실행:
    - Google Calendar: 전시 일정 자동 등록
    - Google Docs: 기획서 5개 자동 생성
    - Gmail: 협력 기관에 초안 이메일 전송 (Draft)
    - Drive: 모든 문서 자동 백업


┌─────────────────────────────────────────────────────────────┐
│ Step 3: AI가 학예사에게 결과 제시                            │
└─────────────────────────────────────────────────────────────┘

AI: "인상주의 전시 기획이 완료되었습니다! 
     3가지 옵션을 준비했습니다:
     
     [Option 1] 빛과 색채의 혁명 (추천)
         - 모네, 르누아르 중심
         - 예산: 3,500만원
         - 예상 관람객: 15,000명
         - 성공 확률: 85%
     
     [Option 2] 파리의 순간들
         - 도시 풍경 중심
         - 예산: 3,200만원
         - 예상 관람객: 12,000명
         - 성공 확률: 70%
     
     [Option 3] 인상주의의 탄생
         - 역사적 관점
         - 예산: 2,800만원
         - 예상 관람객: 10,000명
         - 성공 확률: 65%
     
     어떤 옵션을 선택하시겠습니까?"


┌─────────────────────────────────────────────────────────────┐
│ Step 4: 학예사 최종 의사결정                                 │
└─────────────────────────────────────────────────────────────┘

학예사: "Option 1로 진행해줘"
    ↓
AI: "Option 1 '빛과 색채의 혁명'으로 확정되었습니다.
     
     ✅ Canvas Workflow 최종 저장
     ✅ Dashboard 모든 위젯 업데이트 완료
     ✅ Google Docs 5개 문서 공유
     ✅ Google Calendar 일정 등록
     ✅ 협력 기관에 이메일 전송 (3곳)
     
     다음 단계: 작품 대여 협상 (AI가 초안 준비 완료)"
```

#### 실시간 과정 표시 UI (Canvas V4)

```
┌─────────────────────────────────────────────────────────────┐
│                   AI 자율 실행 중...                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Phase 1] 리서치           ✓ 완료 (15:23)                   │
│  [Phase 2] 컨셉 생성        ✓ 완료 (10:45)                   │
│  [Phase 3] 예산 계산        ✓ 완료 (05:12)                   │
│  [Phase 4] 홍보 계획        ⚡ 실행 중... (07:30 / 10:00)    │
│  [Phase 5] 교육 프로그램    ⏳ 대기 중                        │
│  [Phase 6] 워크플로우 완성  ⏳ 대기 중                        │
│  [Phase 7] 외부 통합        ⏳ 대기 중                        │
│                                                               │
│  [현재 작업] SNS 콘텐츠 10개 생성 중... (7/10)               │
│                                                               │
│  [⏸ 일시정지]  [⏩ 빠르게 진행]  [❌ 취소]                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 📌 시나리오 C: 소장품 선정 업무

```
학예사: "조선시대 회화 전시를 위한 소장품 10점을 선정해줘"
    ↓
AI: [대화형 모드]
    "어떤 주제로 구성하시겠습니까?
     1) 산수화 중심
     2) 인물화 중심
     3) 시대별 변천"
    ↓
학예사: "산수화 중심으로"
    ↓
AI: [자동 실행]
    - 소장품 DB 검색
    - 보존 상태 분석 (AI Conservation Agent)
    - 10점 자동 선정
    - Canvas에 작품 이미지 노드 10개 생성
    - 각 작품 설명 자동 작성
    - 전시 배치 순서 제안
    ↓
Dashboard 업데이트:
    - [Collection Search Widget]: 10점 목록 표시
    - [Conservation Monitor Widget]: 보존 상태 표시
    - [Artwork Gallery Widget]: 이미지 갤러리 표시
```

---

## 4. AI 오케스트레이션 설계

### 🤖 AI Orchestrator 아키텍처

```typescript
// AI Orchestrator Core
class AIOrchestrator {
    private agents: {
        research: ResearchAgent;
        canvas: CanvasAgent;
        document: DocumentAgent;
        widget: WidgetAgent;
        integration: IntegrationAgent;
        monitor: MonitorAgent;
    };

    async execute(userCommand: string, mode: 'conversational' | 'autonomous') {
        // 1. 명령 파싱 (Gemini 1.5 Flash)
        const intent = await this.parseIntent(userCommand);
        
        // 2. 컨텍스트 로드 (과거 학습 데이터)
        const context = await this.loadContext(intent);
        
        // 3. 워크플로우 생성
        const workflow = await this.generateWorkflow(intent, context);
        
        // 4. Multi-Agent 실행
        if (mode === 'conversational') {
            // 단계별 사용자 확인
            return await this.executeConversational(workflow);
        } else {
            // 자율 실행 (과정 표시)
            return await this.executeAutonomous(workflow);
        }
    }
}
```

### 🎯 Multi-Agent 시스템

#### 1. Research Agent
- **역할**: 웹 리서치, 데이터 수집
- **사용 API**: Google Search, Wikipedia, Museum APIs
- **출력**: Canvas 노드 (아이디어, 작품 목록)

```typescript
class ResearchAgent {
    async execute(query: string) {
        const results = await Promise.all([
            this.googleSearch(query),
            this.wikipediaSearch(query),
            this.museumAPISearch(query)
        ]);
        
        // Canvas 노드 생성
        await this.createCanvasNode({
            type: 'research',
            title: `${query} 리서치 결과`,
            content: results
        });
        
        // Dashboard 업데이트
        await this.updateDashboardWidget('research-status', {
            query,
            results: results.length
        });
    }
}
```

#### 2. Canvas Agent
- **역할**: Canvas 노드 자동 생성/연결
- **출력**: Workflow 구조, 노드 데이터

```typescript
class CanvasAgent {
    async createWorkflow(type: string, data: any) {
        const template = this.getWorkflowTemplate(type);
        const nodes = [];
        
        for (const nodeTemplate of template) {
            const node = await this.createNode({
                type: nodeTemplate.type,
                title: nodeTemplate.title,
                data: this.generateNodeData(data, nodeTemplate)
            });
            nodes.push(node);
        }
        
        // 노드 자동 연결
        await this.connectNodes(nodes);
        
        // Dashboard 실시간 업데이트
        await this.syncToDashboard(nodes);
    }
}
```

#### 3. Document Agent
- **역할**: Google Docs, Gmail, Calendar 자동 생성
- **사용 API**: Google APIs
- **출력**: 문서 URL, 이메일 Draft

```typescript
class DocumentAgent {
    async createDocument(title: string, content: string) {
        // Google Docs 생성
        const doc = await this.googleDocs.create({
            title,
            body: content
        });
        
        // Canvas 노드 생성
        await this.createCanvasNode({
            type: 'document',
            title,
            url: doc.url
        });
        
        // Dashboard 업데이트
        await this.updateDashboardWidget('document-list', {
            title,
            url: doc.url,
            status: 'created'
        });
    }
}
```

#### 4. Widget Agent
- **역할**: Dashboard Widget 자동 업데이트
- **출력**: Widget 데이터

```typescript
class WidgetAgent {
    async updateWidget(widgetId: string, data: any) {
        // Widget 데이터 업데이트
        await this.db.execute(`
            UPDATE widget_configs 
            SET config_data = ?
            WHERE widget_id = ?
        `, [JSON.stringify(data), widgetId]);
        
        // 실시간 SSE 전송
        await this.sse.send({
            type: 'widget-update',
            widgetId,
            data
        });
    }
}
```

#### 5. Integration Agent
- **역할**: 외부 서비스 연동 (Google, Slack, Notion)
- **출력**: 통합 결과 알림

#### 6. Monitor Agent
- **역할**: Workflow 완성도 검사, 누락 항목 체크
- **출력**: 품질 보고서

---

## 5. Dashboard ↔ Canvas 통합

### 🔄 실시간 양방향 동기화

#### Architecture

```
Dashboard (Frontend)
    ↓ SSE Connection
Backend (Hono + Cloudflare Workers)
    ↓ D1 Database
Canvas (Frontend)
```

#### SSE (Server-Sent Events) 구현

```typescript
// Backend: src/routes/dashboard.ts
app.get('/api/dashboard/stream', async (c) => {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // SSE 헤더 설정
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    
    // Canvas 변경 이벤트 구독
    const subscription = subscribeToCanvasEvents((event) => {
        writer.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    
    return new Response(readable, {
        headers: c.res.headers
    });
});
```

#### Frontend: Dashboard Widget 실시간 업데이트

```typescript
// Frontend: public/dashboard.html
const eventSource = new EventSource('/api/dashboard/stream');

eventSource.addEventListener('message', (e) => {
    const event = JSON.parse(e.data);
    
    switch(event.type) {
        case 'canvas-node-created':
            updateWidget(event.widgetId, event.data);
            showNotification(`새로운 노드 생성: ${event.data.title}`);
            break;
        
        case 'canvas-node-completed':
            updateWidget(event.widgetId, { status: 'completed' });
            showAnimation(event.widgetId, 'success');
            break;
        
        case 'ai-phase-complete':
            updateProgressWidget(event.phase, event.progress);
            break;
    }
});

function updateWidget(widgetId, data) {
    const widget = document.querySelector(`[data-widget="${widgetId}"]`);
    
    // 애니메이션 효과
    widget.classList.add('widget-update-pulse');
    
    // 데이터 업데이트
    widget.querySelector('.widget-content').innerHTML = renderWidgetData(data);
    
    // 애니메이션 제거
    setTimeout(() => {
        widget.classList.remove('widget-update-pulse');
    }, 1000);
}
```

### 📊 Canvas → Dashboard 매핑

| Canvas 작업 | Dashboard Widget | 업데이트 내용 |
|------------|------------------|--------------|
| 전시 기획 노드 생성 | Exhibition Calendar | 전시 일정 추가 |
| 예산 차트 노드 생성 | Budget Comparison | 예산 항목 반영 |
| Task 노드 생성 | Task Assignment Board | 신규 Task 추가 |
| 작품 이미지 노드 생성 | Artwork Gallery | 이미지 갤러리 추가 |
| 교육 프로그램 노드 | Educational Program | 프로그램 일정 표시 |
| 관람객 보고서 노드 | Visitor Analysis | 통계 차트 업데이트 |
| 문서 노드 생성 | Document List | 문서 목록 추가 |

### 🎯 데이터베이스 스키마

```sql
-- Canvas ↔ Dashboard 동기화 테이블
CREATE TABLE canvas_dashboard_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canvas_node_id TEXT NOT NULL,
    canvas_node_type TEXT NOT NULL,
    dashboard_widget_id TEXT NOT NULL,
    sync_data JSON NOT NULL,
    sync_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'pending'
);

-- AI 실행 세션 테이블
CREATE TABLE ai_execution_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    command TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'conversational' or 'autonomous'
    status TEXT DEFAULT 'running',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    total_duration_ms INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI 실행 이벤트 로그
CREATE TABLE ai_execution_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    phase_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES ai_execution_sessions(id)
);

-- Widget 스냅샷 (버전 관리)
CREATE TABLE widget_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    widget_id TEXT NOT NULL,
    snapshot_data JSON NOT NULL,
    created_by TEXT NOT NULL, -- 'user' or 'ai'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 학습 데이터
CREATE TABLE learning_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_type TEXT NOT NULL,
    user_input TEXT NOT NULL,
    ai_decision JSON NOT NULL,
    user_feedback TEXT, -- 'approved', 'rejected', 'modified'
    success_rate INTEGER, -- 0-100
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 6. 87개 위젯 통합 계획

### 📦 전체 위젯 목록 (87개)

#### 카테고리별 분류

```
📊 Data Analysis & Visualization (6개)
    - Heatmap Chart
    - Word Cloud
    - Gantt Chart
    - Treemap
    - Radar Chart
    - Waterfall Chart

🎭 Museum Specialized (18개)
    - Exhibition Status Board
    - Conservation Monitor
    - Ticket Sales
    - Visitor Flow
    - Docent Schedule
    - Artwork Loan Status
    - Exhibition Effectiveness Dashboard
    - Real-time Satisfaction Survey
    - ... (10개 더)

🤖 AI & Smart Features (4개)
    - AI Recommendation Engine
    - Sentiment Analysis
    - Smart Search
    - Predictive Analytics

💰 Finance & Budget (7개)
    - Budget Comparison
    - Donor Management
    - Museum Shop Sales
    - Revenue Forecasting
    - Cost Tracking
    - Financial Dashboard
    - Expense Approval

👥 Staff Management & Collaboration (7개)
    - Task Assignment Board
    - Staff Attendance
    - Meeting Room Booking
    - Team Messenger
    - Project Kanban Board
    - Employee Performance
    - Shift Scheduler

🏢 Facilities & Safety (9개)
    - Security System Status
    - Energy Usage
    - Facility Inspection
    - Emergency Response
    - CCTV Monitor
    - Access Control
    - Maintenance Log
    - Environmental Monitor
    - Fire Safety

📢 Marketing & Promotion (4개)
    - Email Campaign Status
    - Social Engagement
    - Press Release
    - Event Registration

🔗 Integration & Linking (5개)
    - Google Workspace
    - Microsoft 365
    - Slack Notifications
    - Notion Integration
    - Trello Board

📅 Notification & Task Management (6개)
    - Priority Matrix
    - Deadline Timer
    - Calendar Sync
    - Reminder Alert
    - Task Dependencies
    - Progress Tracker

🎨 Media & Content (3개)
    - Image Gallery
    - Video Player
    - Document Viewer

⚙️ System & Utility (6개)
    - System Monitor
    - API Status
    - Backup Status
    - Error Log
    - Performance Metrics
    - Database Health

📊 Advanced Analytics (7개, Premium)
    - Visitor Dwell Time
    - Collection Loan Status
    - Conservation Workflow
    - Artifact Loan Status
    - Audio Guide Usage
    - Facility Inspection Checklist
    - Power Usage Monitor
```

### 🎯 Canvas 통합 우선순위 (Tier 1 - 10개)

#### 즉시 통합 필요 (학예사 핵심 업무)

1. **Budget Comparison** (예산 비교)
   - Canvas Node: 예산 차트 노드
   - 실시간 업데이트: 예산 항목 변경 시
   - 데이터: 총 예산, 항목별 금액, 비율

2. **Task Assignment Board** (업무 할당 보드)
   - Canvas Node: Task 노드
   - 실시간 업데이트: Task 생성/완료 시
   - 데이터: Task 제목, 담당자, 기한, 상태

3. **Exhibition Calendar** (전시 캘린더)
   - Canvas Node: 전시 기획 노드
   - 실시간 업데이트: 전시 일정 변경 시
   - 데이터: 전시명, 시작일, 종료일, 상태

4. **Collection Search** (소장품 검색)
   - Canvas Node: 작품 이미지 노드
   - 실시간 업데이트: 작품 선정 시
   - 데이터: 작품명, 작가, 이미지, 설명

5. **Educational Program** (교육 프로그램)
   - Canvas Node: 교육 프로그램 노드
   - 실시간 업데이트: 프로그램 생성 시
   - 데이터: 프로그램명, 일정, 대상, 커리큘럼

6. **Email Campaign Status** (이메일 캠페인)
   - Canvas Node: 홍보 문구 노드
   - 실시간 업데이트: 캠페인 생성 시
   - 데이터: 제목, 내용, 수신자, 발송 상태

7. **Deadline Timer** (마감 타이머)
   - Canvas Node: Task 노드
   - 실시간 업데이트: 기한 설정 시
   - 데이터: Task명, 남은 시간, 진행률

8. **Exhibition Effectiveness Dashboard** (전시 효과성)
   - Canvas Node: 관람객 보고서 노드
   - 실시간 업데이트: 통계 데이터 입력 시
   - 데이터: 관람객 수, 만족도, 체류 시간

9. **Artwork Loan Status** (작품 대여 상태)
   - Canvas Node: 작품 이미지 노드
   - 실시간 업데이트: 대여 신청/승인 시
   - 데이터: 작품명, 대여 기관, 기간, 상태

10. **Exhibition Review Monitor** (전시 리뷰)
    - Canvas Node: 리뷰 분석 노드
    - 실시간 업데이트: 리뷰 수집 시
    - 데이터: 평점, 키워드, 감정 분석

### 📊 통합 구현 방법

```typescript
// AI_TO_WIDGET_MAPPING.ts
export const AI_TO_WIDGET_MAPPING = {
    'budget_chart': {
        widgetId: 'budget-comparison',
        updateFunction: async (data: any) => {
            await updateWidget('budget-comparison', {
                totalBudget: data.total,
                items: data.items,
                chart: {
                    type: 'pie',
                    data: data.items.map(item => ({
                        label: item.name,
                        value: item.amount
                    }))
                }
            });
        }
    },
    'task_node': {
        widgetId: 'task-assignment-board',
        updateFunction: async (data: any) => {
            await updateWidget('task-assignment-board', {
                tasks: [{
                    id: data.id,
                    title: data.title,
                    assignee: data.assignee,
                    deadline: data.deadline,
                    status: data.status
                }]
            });
        }
    },
    'exhibition_plan': {
        widgetId: 'exhibition-calendar',
        updateFunction: async (data: any) => {
            await updateWidget('exhibition-calendar', {
                events: [{
                    id: data.id,
                    title: data.title,
                    start: data.startDate,
                    end: data.endDate,
                    color: data.status === 'confirmed' ? 'green' : 'orange'
                }]
            });
        }
    }
    // ... 87개 위젯 매핑
};
```

---

## 7. 진화형 AI 시스템

### 🌱 4단계 진화 로드맵

#### Stage 1: 대화형 초보 어시스턴트 (현재)
- **학습 데이터**: 0-50개
- **AI 자율성**: 10%
- **사용자 개입**: 90%
- **소요 기간**: 1-2주

**특징**:
- AI가 사용자 질문에 응답
- 사용자가 모든 결정
- AI는 명령 실행만 담당

**학습 수집**:
```typescript
// 모든 사용자 상호작용 기록
await recordLearningData({
    userCommand: "예산 승인",
    aiResponse: "예산 항목 5개 생성",
    userFeedback: "approved",
    contextData: {
        taskType: "budget_approval",
        budgetAmount: 30000000,
        userHistory: []
    }
});
```

---

#### Stage 2: 숙련된 어시스턴트 (3개월 후)
- **학습 데이터**: 100-300개
- **AI 자율성**: 40%
- **사용자 개입**: 60%
- **소요 기간**: 2-3개월

**특징**:
- AI가 빈번한 작업 패턴 인식
- 사전 제안(Proactive Suggestion)
- 부분 자율 실행

**진화 알고리즘**:
```typescript
// 빈도 분석
const frequentTasks = await analyzeLearningData();
// 결과: "예산 승인" 작업이 월 10회 발생

// AI 자동 제안
if (frequentTasks.includes('budget_approval')) {
    showAIProposal({
        message: "매월 초에 예산 승인 작업이 발생합니다. 자동으로 준비할까요?",
        action: "prepare_budget_template"
    });
}
```

---

#### Stage 3: 전문가 파트너 (6개월 후)
- **학습 데이터**: 500-1000개
- **AI 자율성**: 80%
- **사용자 개입**: 20%
- **소요 기간**: 6-9개월

**특징**:
- AI가 자율적으로 80% 작업 실행
- 실시간 과정 표시
- 중요 결정 시점만 사용자 개입

**자율 실행 예시**:
```typescript
// AI가 자동으로 Phase 1-6 실행
await autonomousExecution({
    phases: [
        { name: "Research", auto: true },
        { name: "Concept", auto: true },
        { name: "Budget", auto: true, requiresApproval: true }, // 승인 필요
        { name: "Promotion", auto: true },
        { name: "Education", auto: true },
        { name: "Workflow", auto: true }
    ]
});
```

---

#### Stage 4: 전문가 에이전트 (1년 후)
- **학습 데이터**: 2000+ 개
- **AI 자율성**: 95%
- **사용자 개입**: 5%
- **소요 기간**: 1년 이상

**특징**:
- AI가 거의 모든 작업 자율 실행
- 최종 승인만 사용자가 담당
- 예외 상황 자동 처리

**완전 자율 모드**:
```typescript
await fullyAutonomousMode({
    userCommand: "다음 달 전시 기획",
    aiExecution: {
        research: "자동",
        concept: "자동",
        budget: "자동",
        approval: "자동 (과거 패턴 기반)",
        notification: "사용자에게 결과만 알림"
    }
});
```

### 📈 진화 지표

| Stage | 학습 데이터 | AI 자율성 | 작업 시간 단축 | 사용자 만족도 |
|-------|-----------|----------|--------------|-------------|
| Stage 1 | 0-50 | 10% | -50% | 60% |
| Stage 2 | 100-300 | 40% | -70% | 75% |
| Stage 3 | 500-1000 | 80% | -85% | 90% |
| Stage 4 | 2000+ | 95% | -95% | 95% |

---

## 8. UX/UI 설계

### 🎨 Hybrid Canvas V4 (3-Column Layout)

```
┌────────────────────────────────────────────────────────────────┐
│                    MuseFlow - AI Workspace                      │
├────────────┬──────────────────────────┬───────────────────────┤
│            │                          │                       │
│  [왼쪽]    │       [중앙]             │       [오른쪽]        │
│  History & │   AI Conversation        │   Live Canvas         │
│  Projects  │                          │                       │
│            │                          │                       │
│  📁 Projects│  💬 AI: "어떤 전시를     │   [Node 1] 전시 기획   │
│  - 인상주의 │       기획하시겠습니까?" │   [Node 2] 예산       │
│  - 조선시대 │                          │   [Node 3] 홍보       │
│  - 현대미술 │  👤 User: "인상주의"     │        │              │
│            │                          │        ├──[Node 4]    │
│  📋 Tasks  │  💬 AI: "3가지 컨셉을    │        │              │
│  - 예산승인 │       준비했습니다"      │        └──[Node 5]    │
│  - 작품선정 │                          │                       │
│            │  [Phase 1] 리서치 ✓      │   [실시간 업데이트]   │
│  🕐 Recent │  [Phase 2] 컨셉생성 ⚡   │                       │
│  - 전시기획 │  [Phase 3] 예산계산 ⏳   │   [Dashboard 미리보기]│
│  - 교육프로 │                          │   Budget: ₩3,500만   │
│            │  [일시정지] [빠르게]     │   Tasks: 5개 생성     │
│            │                          │   Progress: 60%       │
└────────────┴──────────────────────────┴───────────────────────┘
    (20%)              (50%)                    (30%)
```

### 🎯 주요 UX 개선 사항

#### 1. Phase 기반 폴딩/언폴딩
```html
<div class="ai-conversation">
    <div class="phase-group collapsed">
        <div class="phase-header" onclick="togglePhase(1)">
            [Phase 1] 리서치 ✓ <span class="duration">15:23</span>
        </div>
        <div class="phase-content">
            💬 AI: "50개 작품 후보를 발견했습니다"
            💬 AI: "MoMA에서 3점 대여 가능"
            💬 AI: "루브르 박물관 확인 중..."
        </div>
    </div>
    
    <div class="phase-group active">
        <div class="phase-header">
            [Phase 2] 컨셉 생성 ⚡ <span class="duration">07:30 / 10:00</span>
        </div>
        <div class="phase-content">
            💬 AI: "3가지 컨셉을 생성했습니다"
            💬 AI: "Option 1: 빛과 색채의 혁명 (추천)"
            👤 User: "Option 1로 진행해줘"
        </div>
    </div>
</div>
```

#### 2. 양방향 동기화 (Conversation ↔ Canvas)
```typescript
// Conversation → Canvas
onAIMessage((message) => {
    if (message.type === 'node_created') {
        canvas.addNode(message.nodeData);
        showAnimation('node-created');
    }
});

// Canvas → Conversation
canvas.onNodeClick((node) => {
    conversation.addMessage({
        type: 'user',
        content: `[${node.title}] 노드를 확인했습니다.`
    });
    
    // AI가 컨텍스트 제공
    ai.provideContext(node);
});
```

#### 3. Dashboard 미리보기 (오른쪽 하단)
```html
<div class="dashboard-preview">
    <h4>Dashboard 실시간 상태</h4>
    <div class="widget-mini" data-widget="budget-comparison">
        <span class="widget-title">예산</span>
        <span class="widget-value">₩3,500만</span>
    </div>
    <div class="widget-mini" data-widget="task-assignment">
        <span class="widget-title">Tasks</span>
        <span class="widget-value">5개 생성</span>
    </div>
    <div class="widget-mini" data-widget="progress-status">
        <span class="widget-title">진행률</span>
        <span class="widget-value">60%</span>
    </div>
</div>
```

### 🎨 Dashboard UI (87 Widgets)

```html
<!-- Dashboard Grid Layout -->
<div class="dashboard-grid">
    <!-- AI Command Panel (상단 고정) -->
    <div class="ai-command-panel">
        <input type="text" placeholder="AI에게 명령하세요... (예: 인상주의 전시 기획해줘)" />
        <button class="ai-submit">실행</button>
    </div>
    
    <!-- Widget Grid (4-Column) -->
    <div class="widget-grid">
        <!-- Tier 1 위젯 (10개) -->
        <div class="widget" data-widget="budget-comparison">
            <div class="widget-header">
                <h3>예산 비교</h3>
                <span class="sync-badge">실시간 동기화</span>
            </div>
            <div class="widget-content">
                <!-- Chart.js 차트 -->
            </div>
        </div>
        
        <div class="widget" data-widget="task-assignment-board">
            <div class="widget-header">
                <h3>업무 할당</h3>
                <button class="canvas-link" onclick="openCanvas('task-workflow')">
                    Canvas에서 작업하기
                </button>
            </div>
            <div class="widget-content">
                <!-- Task 목록 -->
            </div>
        </div>
        
        <!-- 87개 위젯 반복... -->
    </div>
</div>
```

### 🎨 Design System (통일된 스타일)

```css
/* MuseFlow Design System */
:root {
    /* Colors (Dashboard와 동일) */
    --color-bg-primary: #111827;
    --color-bg-secondary: #1F2937;
    --color-text-primary: #F9FAFB;
    --color-text-secondary: #9CA3AF;
    --color-accent: #8B5CF6;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    
    /* Typography */
    --font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-size-base: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 20px;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}

/* Widget 공통 스타일 */
.widget {
    background: var(--color-bg-secondary);
    border-radius: 12px;
    padding: var(--spacing-md);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.widget-update-pulse {
    animation: pulse 1s ease-in-out;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

/* AI Conversation 스타일 */
.ai-message {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: var(--spacing-md);
    border-radius: 12px;
    margin-bottom: var(--spacing-sm);
}

.user-message {
    background: var(--color-bg-secondary);
    padding: var(--spacing-md);
    border-radius: 12px;
    margin-bottom: var(--spacing-sm);
    text-align: right;
}
```

---

## 9. 기술 스택 및 구현 계획

### 🛠️ 기술 스택

#### Frontend
- **Framework**: Vanilla JavaScript (Canvas V3 기반)
- **UI Library**: Lucide Icons, Chart.js
- **Styling**: Custom CSS (Design System 기반)
- **Real-time**: EventSource (SSE)

#### Backend
- **Framework**: Hono (Edge-first, TypeScript)
- **Platform**: Cloudflare Pages + Workers
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Google Gemini 1.5 Flash (API)

#### External Integrations
- **Google APIs**: Docs, Gmail, Calendar, Drive
- **AI Services**: Gemini 2.0 Flash Thinking Mode
- **Search**: Google Custom Search API

### 📅 구현 계획 (4주)

#### Week 1: Design System 통일 + Dashboard AI 패널
- [ ] Canvas V4 3-Column Layout 구현
- [ ] Dashboard AI Command Panel 추가
- [ ] Design System CSS 통일
- [ ] 예상 소요시간: 40시간

#### Week 2: Backend API + AI Orchestrator
- [ ] AI Orchestrator Core 구현
- [ ] Multi-Agent System 구현 (6개 Agent)
- [ ] SSE 실시간 스트리밍 API
- [ ] D1 Database Migration (4개 테이블 추가)
- [ ] 예상 소요시간: 40시간

#### Week 3: Frontend 통합 + 10개 Tier 1 위젯
- [ ] Conversation ↔ Canvas 양방향 동기화
- [ ] Dashboard Widget 실시간 업데이트 (10개)
- [ ] Phase 기반 폴딩/언폴딩 UI
- [ ] Dashboard 미리보기 패널
- [ ] 예상 소요시간: 40시간

#### Week 4: 테스트 + 배포 + 학습 데이터 수집
- [ ] E2E 테스트 (시나리오 A, B, C)
- [ ] 성능 최적화
- [ ] Production 배포
- [ ] Learning Data 수집 시작
- [ ] 예상 소요시간: 40시간

**총 예상 시간**: 160시간 (4주 Full-time)

---

## 10. 성공 지표 및 평가

### 📊 핵심 KPI

#### 1. 작업 효율성
- **목표**: 작업 시간 85% 단축
- **측정 방법**: Before/After 비교
- **예시**: 전시 기획 8시간 → 1시간

#### 2. AI 자율성
- **목표**: Stage 3 도달 (80% 자율)
- **측정 방법**: 사용자 개입 횟수 카운트
- **예시**: 50 클릭 → 10 클릭

#### 3. 실시간 동기화
- **목표**: 3초 이내 업데이트
- **측정 방법**: SSE 이벤트 지연 시간
- **예시**: Canvas 노드 생성 → Dashboard 반영 (3초 이내)

#### 4. 사용자 만족도
- **목표**: 90% 이상
- **측정 방법**: 설문 조사 (5점 척도)
- **예시**: "AI가 업무를 얼마나 도와주나요?"

#### 5. 학습 데이터 축적
- **목표**: 6개월 내 500개 이상
- **측정 방법**: `learning_data` 테이블 레코드 수
- **예시**: 매주 20개 × 25주 = 500개

### 📈 성공 시나리오

#### 3개월 후 (Stage 2)
- 학습 데이터: 200개
- AI 자율성: 40%
- 작업 시간 단축: 70%
- 사용자 만족도: 75%

#### 6개월 후 (Stage 3)
- 학습 데이터: 600개
- AI 자율성: 80%
- 작업 시간 단축: 85%
- 사용자 만족도: 90%

#### 1년 후 (Stage 4)
- 학습 데이터: 2000개
- AI 자율성: 95%
- 작업 시간 단축: 95%
- 사용자 만족도: 95%

---

## 📝 부록

### A. API 엔드포인트 목록

```typescript
// AI Orchestrator
POST   /api/ai/execute                 // AI 명령 실행
POST   /api/ai/decision                // 사용자 결정 전달
GET    /api/ai/stream                  // 실시간 진행 상황 (SSE)

// Dashboard Sync
GET    /api/dashboard/stream           // Widget 실시간 업데이트 (SSE)
POST   /api/dashboard/widget/update    // Widget 수동 업데이트
GET    /api/dashboard/widgets          // 모든 위젯 데이터 조회

// Canvas
POST   /api/canvas/node/create         // Canvas 노드 생성
PUT    /api/canvas/node/:id/update     // Canvas 노드 업데이트
POST   /api/canvas/workflow/generate   // Workflow 자동 생성

// Learning Data
POST   /api/learning/record            // 학습 데이터 기록
GET    /api/learning/analytics         // 학습 데이터 분석
```

### B. 데이터베이스 ERD

```
users (1) ──< (N) ai_execution_sessions
                      │
                      └──< (N) ai_execution_events

users (1) ──< (N) learning_data

widgets (1) ──< (N) user_widgets (N) ──> (1) users
                      │
                      └──< (N) widget_configs

canvas_nodes (1) ──< (N) canvas_dashboard_sync (N) ──> (1) widgets
```

### C. 환경 변수 설정

```bash
# .dev.vars
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_DOCS_API_KEY=your_google_docs_api_key
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
JWT_SECRET=your_jwt_secret
```

---

## 🎯 최종 확인 사항

### ✅ 설계 완료 항목
- [x] 비전 및 핵심 가치 정의
- [x] 시스템 아키텍처 설계
- [x] 3가지 상세 서비스 시나리오 (예산 승인, 전시 기획, 소장품 선정)
- [x] AI 오케스트레이션 6개 Agent 설계
- [x] Dashboard ↔ Canvas 실시간 동기화 설계
- [x] 87개 위젯 통합 계획 (Tier 1 10개 우선순위)
- [x] 진화형 AI 4단계 로드맵
- [x] Hybrid Canvas V4 UX/UI 설계
- [x] 기술 스택 및 4주 구현 계획
- [x] 성공 지표 및 평가 방법

### 🚀 다음 단계 (구현 대기)

교수님의 최종 승인 후 **Week 1부터 개발 시작**합니다.

---

**문서 작성일**: 2025-12-03  
**작성자**: 남현우 교수  
**버전**: 1.0  
**상태**: ✅ 최종 설계 완료 - 구현 대기

---

**🎨 MuseFlow - AI가 일하고, 학예사는 결정한다**

# MuseFlow AI Orchestrator - API Documentation

## Overview

MuseFlow AI Orchestrator는 AI 기반 큐레이터 업무 자동화 시스템입니다. RESTful API와 SSE(Server-Sent Events)를 통해 실시간 AI 실행 및 모니터링 기능을 제공합니다.

**Base URL**: `/api/orchestrator`

---

## Authentication

현재 버전은 데모 목적으로 인증이 필요하지 않습니다. 프로덕션 배포 시 JWT 기반 인증을 추가할 수 있습니다.

---

## API Endpoints

### 1. AI 실행 시작

AI 워크플로우 실행을 시작합니다.

**Endpoint**: `POST /api/orchestrator/execute`

**Request Body**:
```json
{
  "workflow_type": "exhibition_planning",
  "user_input": "인상주의 특별전을 3000만원 예산으로 기획해줘",
  "user_id": "curator-demo",
  "autonomy_preference": "balanced",
  "config": {
    "max_retries": 3,
    "timeout": 300000
  }
}
```

**Parameters**:
- `workflow_type` (required): 워크플로우 타입
  - `exhibition_planning`: 전시 기획
  - `budget_approval`: 예산 승인
  - `collection_selection`: 소장품 선정
  - `education_program`: 교육 프로그램
  - `promotion_plan`: 홍보 계획
- `user_input` (required): 사용자 입력 (자연어)
- `user_id` (required): 사용자 ID
- `autonomy_preference` (optional): AI 자율성 수준
  - `conservative`: 보수적 (40%)
  - `balanced`: 균형 (70%) - 기본값
  - `aggressive`: 공격적 (95%)
- `config` (optional): 추가 설정
  - `max_retries`: 최대 재시도 횟수 (기본: 3)
  - `timeout`: 타임아웃 (ms, 기본: 300000)

**Response (200 OK)**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_type": "exhibition_planning",
  "status": "initiated",
  "estimated_duration": 60,
  "stream_url": "/api/orchestrator/stream/550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid workflow_type"
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "AI execution failed"
}
```

---

### 2. SSE 실시간 스트림

AI 실행의 실시간 이벤트를 수신합니다.

**Endpoint**: `GET /api/orchestrator/stream/:session_id`

**Parameters**:
- `session_id` (required): 세션 ID

**SSE Event Types**:

#### `start` Event
워크플로우 시작
```json
{
  "type": "start",
  "payload": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "workflow_type": "exhibition_planning",
    "phases": [
      {
        "name": "Research",
        "description": "작품 및 전시 트렌드 조사",
        "estimated_duration": 15
      }
    ]
  }
}
```

#### `phase-start` Event
Phase 시작
```json
{
  "type": "phase-start",
  "payload": {
    "phase_index": 0,
    "phase_name": "Research",
    "agent_type": "research"
  }
}
```

#### `agent-action` Event
Agent 동작
```json
{
  "type": "agent-action",
  "payload": {
    "agent_type": "research",
    "action": "Searching Wikipedia...",
    "progress": 25
  }
}
```

#### `phase-complete` Event
Phase 완료
```json
{
  "type": "phase-complete",
  "payload": {
    "phase_index": 0,
    "phase_name": "Research",
    "duration": 12.5,
    "progress": 20,
    "result": {
      "research_data": [...],
      "summary": "..."
    }
  }
}
```

#### `complete` Event
워크플로우 완료
```json
{
  "type": "complete",
  "payload": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "duration": 58.3,
    "results": {
      "canvas_nodes": [...],
      "documents": [...],
      "widgets": [...]
    }
  }
}
```

#### `error` Event
에러 발생
```json
{
  "type": "error",
  "payload": {
    "message": "Agent execution failed",
    "phase": "Research",
    "error_code": "AGENT_TIMEOUT"
  }
}
```

#### `keep-alive` Event
연결 유지 (30초마다)
```json
{
  "type": "keep-alive",
  "payload": {
    "timestamp": "2024-12-03T10:30:00Z"
  }
}
```

---

### 3. 세션 상태 조회

실행 중인 세션의 상태를 조회합니다.

**Endpoint**: `GET /api/orchestrator/status/:session_id`

**Response (200 OK)**:
```json
{
  "success": true,
  "session": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "workflow_type": "exhibition_planning",
    "current_phase": "Research",
    "progress": 20,
    "started_at": "2024-12-03T10:25:00Z",
    "estimated_completion": "2024-12-03T10:26:00Z"
  }
}
```

---

### 4. 사용자 결정 제출

AI가 요청한 사용자 결정을 제출합니다.

**Endpoint**: `POST /api/orchestrator/decision/:session_id`

**Request Body**:
```json
{
  "decision_id": "decision-123",
  "choice": "approve",
  "feedback": "예산을 10% 증액하세요"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Decision received",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 5. 워크플로우 일시정지

실행 중인 워크플로우를 일시정지합니다.

**Endpoint**: `POST /api/orchestrator/pause/:session_id`

**Response (200 OK)**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "paused"
}
```

---

### 6. 워크플로우 재개

일시정지된 워크플로우를 재개합니다.

**Endpoint**: `POST /api/orchestrator/resume/:session_id`

**Response (200 OK)**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running"
}
```

---

### 7. 워크플로우 취소

실행 중인 워크플로우를 취소합니다.

**Endpoint**: `POST /api/orchestrator/cancel/:session_id`

**Response (200 OK)**:
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "cancelled"
}
```

---

### 8. 실행 히스토리 조회

사용자의 실행 히스토리를 조회합니다.

**Endpoint**: `GET /api/orchestrator/history?user_id=curator-demo&limit=10`

**Query Parameters**:
- `user_id` (required): 사용자 ID
- `limit` (optional): 결과 개수 (기본: 10, 최대: 100)
- `workflow_type` (optional): 워크플로우 타입 필터
- `status` (optional): 상태 필터 (`completed`, `failed`, `cancelled`)

**Response (200 OK)**:
```json
{
  "success": true,
  "history": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "workflow_type": "exhibition_planning",
      "status": "completed",
      "started_at": "2024-12-03T10:25:00Z",
      "completed_at": "2024-12-03T10:26:00Z",
      "duration": 58.3,
      "results_summary": {
        "canvas_nodes": 6,
        "documents": 3,
        "widgets": 2
      }
    }
  ],
  "total": 25,
  "page": 1
}
```

---

### 9. 워크플로우 템플릿 조회

사용 가능한 워크플로우 템플릿 목록을 조회합니다.

**Endpoint**: `GET /api/orchestrator/templates`

**Response (200 OK)**:
```json
{
  "success": true,
  "templates": [
    {
      "workflow_type": "exhibition_planning",
      "name": "전시 기획",
      "description": "AI가 전시를 자동으로 기획합니다",
      "phases": 7,
      "estimated_duration": 60,
      "autonomy_level": "high"
    },
    {
      "workflow_type": "budget_approval",
      "name": "예산 승인",
      "description": "예산 계획 및 승인 자동화",
      "phases": 5,
      "estimated_duration": 5,
      "autonomy_level": "medium"
    }
  ]
}
```

---

## Agent Types

### Research Agent
- **기능**: 멀티소스 검색 (Internal DB, Wikipedia, MET Museum, Gemini AI)
- **출력**: 검색 결과, AI 요약, 관련도 점수

### Canvas Agent
- **기능**: 자동 Canvas 노드 생성
- **노드 타입**: `concept_generation`, `budget_chart`, `education_nodes`, `artwork_nodes`
- **출력**: Canvas 노드 데이터, 자동 배치 좌표

### Document Agent
- **기능**: 문서 자동 생성
- **문서 타입**: `budget_document`, `promotion_plan`, `sns_content`, `press_release`, `email_campaign`, `curriculum`, `report`
- **출력**: Markdown/HTML 문서

### Widget Agent
- **기능**: Dashboard 위젯 자동 생성
- **위젯 타입**: `budget_comparison`, `task_board`, `exhibition_calendar`, `artwork_gallery`, `document_list`, `educational_program`, `visitor_analytics`, `collection_status`
- **출력**: 위젯 데이터, Chart.js 설정

### Integration Agent
- **기능**: 외부 API 연동
- **지원 API**: Wikipedia, MET Museum, Google Search, Notion, Weather, Currency, Stock, News
- **출력**: 통합 결과 데이터

### Monitor Agent
- **기능**: 실시간 모니터링
- **모니터링 타입**: `session`, `performance`, `errors`, `analytics`, `health`, `alerts`
- **출력**: 메트릭, 알림

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_WORKFLOW` | 잘못된 워크플로우 타입 |
| `AGENT_TIMEOUT` | Agent 실행 타임아웃 |
| `AGENT_FAILED` | Agent 실행 실패 |
| `SESSION_NOT_FOUND` | 세션을 찾을 수 없음 |
| `DB_ERROR` | 데이터베이스 에러 |
| `EXTERNAL_API_ERROR` | 외부 API 에러 |

---

## Rate Limits

- **API 호출**: 100 requests/minute per user
- **SSE 연결**: 5 concurrent connections per user
- **세션 생성**: 10 sessions/minute per user

---

## Best Practices

1. **SSE 연결 관리**
   - 연결 종료 시 자동 재연결 구현
   - Keep-alive 이벤트 처리
   - 에러 발생 시 연결 종료

2. **에러 처리**
   - 모든 API 호출에 try-catch 추가
   - 타임아웃 설정 (최소 5분 권장)
   - 재시도 로직 구현 (최대 3회)

3. **성능 최적화**
   - 불필요한 API 호출 최소화
   - 결과 캐싱 활용
   - 배치 처리 고려

---

## Examples

### JavaScript (Fetch API)
```javascript
// 1. AI 실행 시작
const response = await fetch('/api/orchestrator/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    workflow_type: 'exhibition_planning',
    user_input: '인상주의 특별전 기획',
    user_id: 'curator-demo',
    autonomy_preference: 'balanced'
  })
});

const data = await response.json();
const sessionId = data.session_id;

// 2. SSE 스트림 연결
const eventSource = new EventSource(`/api/orchestrator/stream/${sessionId}`);

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.payload);
};

eventSource.onerror = function(error) {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

---

## Changelog

### v1.0.0 (2024-12-03)
- Initial release
- 9 API endpoints
- 6 Agent types
- SSE real-time streaming
- 5 workflow templates

---

## Support

문의: [GitHub Issues](https://github.com/your-org/museflow-v4/issues)

# Document 7: Glossary & Data Dictionary

**MuseFlow V4 - 초개인화 지능형 대시보드 및 멀티에이전트 기반 뮤지엄 업무 워크플로우 시스템**

**작성일:** 2025-01-23  
**버전:** 1.0  
**작성자:** MuseFlow V4 Documentation Team  
**문서 ID:** GDD-MUSEFLOW-V4-001

---

## 📋 목차

1. [문서 목적](#1-문서-목적)
2. [용어집 (Glossary)](#2-용어집-glossary)
3. [데이터 모델 사전 (Data Model Dictionary)](#3-데이터-모델-사전-data-model-dictionary)
4. [API 엔드포인트 사전 (API Endpoint Dictionary)](#4-api-엔드포인트-사전-api-endpoint-dictionary)
5. [에러 코드 사전 (Error Code Dictionary)](#5-에러-코드-사전-error-code-dictionary)
6. [이벤트 타입 사전 (Event Type Dictionary)](#6-이벤트-타입-사전-event-type-dictionary)
7. [약어 및 두문자어 (Abbreviations & Acronyms)](#7-약어-및-두문자어-abbreviations--acronyms)

---

## 1. 문서 목적

본 Glossary & Data Dictionary는 **MuseFlow V4** 시스템에서 사용되는 모든 기술 용어, 데이터 모델, API 규격, 에러 코드, 이벤트 타입을 정의하여 개발팀, 디자인팀, QA팀, 운영팀 간의 일관된 커뮤니케이션을 지원합니다.

### 1.1 대상 독자

- **개발자:** API 구현 및 데이터 모델 이해
- **디자이너:** UX 용어 및 상태 정의 이해
- **QA 엔지니어:** 테스트 케이스 작성 시 참조
- **기술 문서 작성자:** 일관된 용어 사용
- **신규 팀원:** 온보딩 및 학습 자료

### 1.2 표기 규칙

- **영문 용어:** 한글 설명과 함께 표기
- **데이터 타입:** TypeScript 타입 표기법 사용
- **필수 여부:** `REQUIRED` (필수), `OPTIONAL` (선택)
- **제약조건:** `UNIQUE`, `NOT NULL`, `CHECK` 등

---

## 2. 용어집 (Glossary)

### 2.1 핵심 개념 (Core Concepts)

#### **초개인화 (Hyper-Personalization)**
> AI가 사용자의 역할(Role), 행동 패턴(Behavior Pattern), 업무 맥락(Work Context)을 학습하여 대시보드 레이아웃, 위젯 배치, 콘텐츠 추천을 자동으로 최적화하는 것.

**예시:**
- 큐레이터 A는 전시 관련 위젯을 자주 사용 → AI가 전시 위젯을 상단에 배치
- 관리자 B는 매일 아침 예산 현황을 확인 → AI가 예산 위젯을 첫 화면에 표시

---

#### **Zero-UI**
> 복잡한 UI 조작 없이 자연어 명령(Natural Language Command) 하나로 원하는 작업을 수행할 수 있는 인터페이스 철학.

**예시:**
- "인상파 전시 기획해줘" → AI가 전시 워크플로우 자동 생성
- "지난달 예산 초과 프로젝트 찾아줘" → 검색 결과 즉시 표시

---

#### **멀티에이전트 시스템 (Multi-Agent System)**
> 여러 전문 AI 에이전트(Specialized AI Agents)가 협업하여 복잡한 작업을 자동화하는 시스템. 각 에이전트는 특정 도메인(전시 기획, 예산 관리, 문서 작성 등)에 특화되어 있으며, MCP 프로토콜을 통해 메시지를 주고받음.

**구성 요소:**
- **Agent Coordinator:** 에이전트 간 협업 조율
- **8개 전문 에이전트:** Exhibition, Budget, Artwork, Schedule, Document, Notion, Email, AI Analysis
- **MCP Protocol:** 에이전트 간 통신 프로토콜

---

#### **MCP (Multi-agent Communication Protocol)**
> 에이전트 간 메시지 교환을 위한 JSON-RPC 2.0 기반 프로토콜. 4가지 메시지 타입(Request, Response, Event, Negotiation)을 지원.

**메시지 구조:**
```json
{
  "id": "msg-12345",
  "from": "exhibition-agent",
  "to": "budget-agent",
  "type": "request",
  "payload": {
    "action": "create_budget_plan",
    "data": { "budget": 100000000 },
    "context": { "userId": 1, "workflowId": 42 }
  },
  "metadata": {
    "timestamp": 1706000000000,
    "priority": "high",
    "requiresResponse": true
  }
}
```

---

#### **워크플로우 캔버스 (Workflow Canvas)**
> 업무 프로세스를 노드(Node)와 연결선(Edge)으로 시각화하는 무한 캔버스(Infinite Canvas) 인터페이스. 실시간 협업 편집(Real-time Collaborative Editing)을 지원.

**특징:**
- **무한 캔버스:** 확대/축소, 패닝(Pan) 자유로움
- **노드 타입:** Task, Milestone, Decision, Document, Note 등
- **실시간 동시 편집:** WebSocket 기반, 최대 20명
- **버전 히스토리:** 자동 저장 (30초 간격), 최근 30개 버전

---

#### **위젯 (Widget)**
> 대시보드에 배치되는 독립적인 UI 컴포넌트. 각 위젯은 특정 데이터를 시각화하거나 기능을 제공함.

**위젯 타입:**
- **Project Widget:** 진행 중인 프로젝트 목록 및 진행률
- **Budget Widget:** 예산 집행률 및 초과 알림
- **Calendar Widget:** 일정 및 마감일
- **Notification Widget:** 실시간 알림
- **Statistics Widget:** 통계 차트 (Bar, Line, Pie)

**위젯 크기:**
- **Small:** 1x1 (150x150px)
- **Medium:** 2x1 (300x150px)
- **Large:** 2x2 (300x300px)

---

#### **Command Bar (명령 바)**
> Ctrl+K 단축키로 활성화되는 전역 검색 및 명령 실행 인터페이스. Spotlight(macOS)나 Alfred와 유사.

**기능:**
- 자연어 검색
- 빠른 명령 실행 (프로젝트 생성, 문서 열기 등)
- AI 워크플로우 생성
- 최근 검색 기록 자동 완성

---

### 2.2 기술 용어 (Technical Terms)

#### **Edge Computing**
> 사용자와 가까운 지리적 위치의 서버(엣지 서버)에서 애플리케이션을 실행하여 지연 시간(Latency)을 최소화하는 컴퓨팅 패러다임. Cloudflare Workers/Pages가 이를 지원.

**장점:**
- 글로벌 < 50ms 응답 시간
- 자동 스케일링
- DDoS 보호

---

#### **Cloudflare D1**
> Cloudflare의 글로벌 분산 SQLite 데이터베이스. 각 지역에서 읽기 성능이 빠르며, 쓰기는 Primary 리전으로 전송됨.

**특징:**
- SQLite 기반 (SQL 호환)
- 글로벌 읽기 복제
- 무료 플랜: 5GB 스토리지, 500만 행 읽기/일

---

#### **Cloudflare KV (Key-Value Storage)**
> 전역 분산 키-값 스토리지. 캐싱, 세션 저장, 임시 데이터 저장에 적합.

**특징:**
- Eventually Consistent (최종 일관성)
- TTL(Time-to-Live) 지원
- 무료 플랜: 100,000 읽기/일, 1,000 쓰기/일

---

#### **Cloudflare R2**
> S3 호환 객체 스토리지. 파일(이미지, PDF, 동영상 등) 저장에 사용.

**특징:**
- S3 API 호환
- 무료 egress (출력 트래픽 무료)
- 무료 플랫: 10GB 스토리지

---

#### **JWT (JSON Web Token)**
> 사용자 인증에 사용되는 토큰 기반 인증 방식. Header, Payload, Signature 3부분으로 구성.

**구조:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.signature
│────────── Header ──────────│──────── Payload ────────│─Signature─│
```

**만료 시간:** 24시간 (설정 가능)

---

#### **PBKDF2 (Password-Based Key Derivation Function 2)**
> 비밀번호를 안전하게 해싱하기 위한 알고리즘. Salt와 반복(Iterations)을 사용하여 무차별 대입 공격(Brute Force Attack)을 방어.

**MuseFlow V4 설정:**
- Iterations: 100,000
- Hash: SHA-256
- Salt: 16 bytes 랜덤

---

#### **RBAC (Role-Based Access Control)**
> 역할 기반 접근 제어. 사용자에게 역할(Role)을 할당하고, 각 역할에 권한(Permission)을 부여.

**MuseFlow V4 역할:**
- **Admin:** 모든 권한 (시스템 설정, 사용자 관리)
- **Manager:** 프로젝트 생성/수정/삭제, 팀원 초대
- **Member:** 프로젝트 참여, 문서 작성
- **Viewer:** 읽기 전용

---

#### **WebSocket**
> 클라이언트와 서버 간 양방향 실시간 통신 프로토콜. 실시간 협업 캔버스, 채팅, 알림에 사용.

**특징:**
- 지속적인 연결 유지
- 낮은 지연 시간 (< 100ms)
- HTTP보다 오버헤드 적음

---

#### **Service Worker**
> 브라우저 백그라운드에서 실행되는 JavaScript. 오프라인 캐싱, 푸시 알림, 백그라운드 동기화에 사용.

**MuseFlow V4 사용 사례:**
- 오프라인 모드
- 푸시 알림
- 캐싱 전략

---

### 2.3 UX/UI 용어 (UX/UI Terms)

#### **Progressive Disclosure (점진적 노출)**
> 사용자에게 필요한 정보만 단계적으로 보여주는 UX 패턴. 복잡성을 줄이고 인지 부하를 낮춤.

**예시:**
- 기본 정보만 표시 → "더 보기" 클릭 → 상세 정보 표시

---

#### **Contextual Actions (맥락 기반 액션)**
> 사용자의 현재 상황(Context)에 맞는 액션만 표시. 불필요한 옵션을 숨김.

**예시:**
- 프로젝트 선택 시 → "수정", "삭제", "공유" 버튼 표시
- 텍스트 선택 시 → "복사", "붙여넣기", "AI 요약" 버튼 표시

---

#### **Immediate Feedback (즉각적 피드백)**
> 사용자 액션에 < 100ms 안에 시각적/청각적 피드백을 제공.

**예시:**
- 버튼 클릭 → 배경색 변경, 리플 효과
- 로딩 중 → 스피너, 프로그레스 바
- 성공/실패 → Toast 알림, 사운드

---

#### **Skeleton Screen (스켈레톤 스크린)**
> 콘텐츠 로딩 중 표시하는 플레이스홀더. 로딩 속도가 빠르게 느껴지는 효과.

**예시:**
```
┌─────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓          │  ← 제목 로딩 중
│ ▓▓▓▓▓▓▓▓            │  ← 부제목 로딩 중
│                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  ← 본문 로딩 중
│ ▓▓▓▓▓▓▓▓▓▓▓▓        │
└─────────────────────┘
```

---

#### **Toast Notification (토스트 알림)**
> 화면 하단 또는 우측 상단에 일시적으로 표시되는 알림. 3-5초 후 자동 사라짐.

**타입:**
- Success (초록색)
- Error (빨간색)
- Warning (노란색)
- Info (파란색)

---

### 2.4 AI/ML 용어 (AI/ML Terms)

#### **Gemini 3.0 Flash**
> Google의 경량 AI 모델. 빠른 응답 속도 (< 1초)와 낮은 비용이 특징. MuseFlow V4의 Primary AI 모델.

**사용 사례:**
- 자연어 의도 인식
- 검색 쿼리 최적화
- 간단한 문서 초안 생성
- 이미지 설명 생성

---

#### **Gemini 2.5 Pro**
> Google의 고성능 AI 모델. 복잡한 추론 및 긴 컨텍스트 처리에 강점. MuseFlow V4의 Fallback 모델.

**사용 사례:**
- 복잡한 전시 기획안 생성
- 긴 문서 요약 및 분석
- 다단계 추론이 필요한 작업

---

#### **Prompt Engineering**
> AI 모델에게 효과적인 결과를 얻기 위해 입력(Prompt)을 최적화하는 기술.

**Best Practices:**
- 명확한 지시 (Clear Instructions)
- 예시 제공 (Few-shot Learning)
- 역할 부여 (Role Assignment)
- 출력 형식 지정 (Output Format)

---

#### **Context Window**
> AI 모델이 한 번에 처리할 수 있는 텍스트 길이 (토큰 수).

**Gemini 모델:**
- Gemini 3.0 Flash: 1,048,576 tokens (약 70만 단어)
- Gemini 2.5 Pro: 2,097,152 tokens (약 140만 단어)

---

#### **Few-shot Learning**
> AI에게 몇 개의 예시(Example)를 제공하여 원하는 출력 형식을 학습시키는 기법.

**예시:**
```
User: 다음 형식으로 전시 제목을 생성해줘.

예시 1: "빛의 여정: 인상주의 걸작전"
예시 2: "시간을 거슬러: 르네상스 미술의 재발견"

테마: 한국 전통 미술

AI: "고요한 아름다움: 조선 회화의 정수"
```

---

### 2.5 뮤지엄 도메인 용어 (Museum Domain Terms)

#### **큐레이터 (Curator)**
> 박물관·미술관의 전시 기획 및 작품 관리를 담당하는 전문가.

**주요 업무:**
- 전시 콘셉트 개발
- 작품 선정 및 배치
- 전시 도록 제작
- 작품 해설 및 교육 프로그램 기획

---

#### **보존 처리 (Conservation Treatment)**
> 작품의 물리적 상태를 안정화하고 손상을 복원하는 과정.

**단계:**
1. **상태 조사 (Condition Report):** 작품의 현재 상태 기록
2. **처리 계획 (Treatment Plan):** 보존 방법 결정
3. **처리 실행 (Treatment):** 세척, 보강, 복원
4. **사후 관리 (Post-treatment Care):** 환경 모니터링

---

#### **소장품 (Collection)**
> 박물관·미술관이 소유하고 관리하는 작품 및 유물.

**관리 항목:**
- 등록 번호 (Accession Number)
- 작가/제작자 (Artist/Creator)
- 제작 연도 (Year)
- 재질 (Medium)
- 크기 (Dimensions)
- 취득 경위 (Provenance)
- 보존 상태 (Condition)

---

#### **전시 도록 (Exhibition Catalogue)**
> 전시 작품 목록, 작품 설명, 에세이, 이미지를 포함하는 출판물.

**구성:**
- 전시 소개 (Introduction)
- 큐레이터 에세이 (Curator's Essay)
- 작품 도판 및 설명 (Plates & Descriptions)
- 작가 약력 (Artist Biographies)
- 참고문헌 (Bibliography)

---

#### **교육 프로그램 (Educational Program)**
> 관람객 대상 교육 활동 (강연, 워크숍, 가이드 투어 등).

**유형:**
- **가이드 투어 (Guided Tour):** 도슨트가 전시 해설
- **워크숍 (Workshop):** 작품 제작 체험
- **강연 (Lecture):** 전문가 초청 강의
- **학교 연계 프로그램:** 초중고 단체 방문

---

## 3. 데이터 모델 사전 (Data Model Dictionary)

### 3.1 사용자 관련 테이블 (User Tables)

#### **users (사용자)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 사용자 고유 ID |
| `email` | TEXT | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password_hash` | TEXT | NOT NULL | PBKDF2 해싱된 비밀번호 |
| `name` | TEXT | NOT NULL | 사용자 이름 |
| `role` | TEXT | CHECK(role IN ('admin', 'manager', 'member', 'viewer')) | 역할 |
| `avatar_url` | TEXT | OPTIONAL | 프로필 이미지 URL |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 가입 일시 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 수정 일시 |

**인덱스:**
- `idx_users_email` ON `email`

**샘플 데이터:**
```json
{
  "id": 1,
  "email": "curator@museum.com",
  "name": "김지원",
  "role": "member",
  "avatar_url": "https://museflow-files.r2.dev/avatars/user1.jpg",
  "created_at": "2025-01-15T09:00:00Z"
}
```

---

#### **dashboard_configs (대시보드 설정)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 설정 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users(id) | 사용자 ID |
| `layout` | TEXT | NOT NULL | 레이아웃 (JSON) |
| `widgets` | TEXT | NOT NULL | 위젯 목록 (JSON) |
| `theme` | TEXT | CHECK(theme IN ('light', 'dark')) | 테마 |
| `auto_refresh_interval` | INTEGER | DEFAULT 60 | 자동 갱신 간격 (초) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 수정 일시 |

**layout JSON 구조:**
```json
{
  "gridColumns": 3,
  "widgets": [
    {"id": "widget-1", "type": "projects", "position": {"row": 0, "col": 0}, "size": {"width": 1, "height": 1}},
    {"id": "widget-2", "type": "budget", "position": {"row": 0, "col": 1}, "size": {"width": 2, "height": 1}}
  ]
}
```

**widgets JSON 구조:**
```json
[
  {"type": "projects", "enabled": true, "settings": {"showCompleted": false}},
  {"type": "budget", "enabled": true, "settings": {"showAlerts": true}},
  {"type": "calendar", "enabled": true, "settings": {"view": "month"}}
]
```

---

#### **user_behavior_logs (사용자 행동 로그)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 로그 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users(id) | 사용자 ID |
| `action_type` | TEXT | NOT NULL | 액션 타입 ('view', 'click', 'search', 'create') |
| `action_target` | TEXT | OPTIONAL | 액션 대상 (페이지 URL, 버튼 ID 등) |
| `context` | TEXT | OPTIONAL | 추가 컨텍스트 (JSON) |
| `timestamp` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 발생 시간 |

**인덱스:**
- `idx_behavior_logs_user_id` ON `user_id`
- `idx_behavior_logs_timestamp` ON `timestamp`

**샘플 데이터:**
```json
{
  "id": 1,
  "user_id": 1,
  "action_type": "click",
  "action_target": "widget-add-button",
  "context": {"widgetType": "projects", "fromPage": "dashboard"},
  "timestamp": "2025-01-23T10:30:00Z"
}
```

---

### 3.2 워크플로우 관련 테이블 (Workflow Tables)

#### **workflows (워크플로우)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 워크플로우 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users(id) | 생성자 ID |
| `title` | TEXT | NOT NULL | 워크플로우 제목 |
| `description` | TEXT | OPTIONAL | 설명 |
| `type` | TEXT | OPTIONAL | 워크플로우 타입 ('exhibition', 'budget', 'education') |
| `nodes` | TEXT | NOT NULL | 노드 데이터 (JSON) |
| `edges` | TEXT | NOT NULL | 연결선 데이터 (JSON) |
| `status` | TEXT | CHECK(status IN ('draft', 'active', 'completed', 'archived')) | 상태 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 수정 일시 |

**nodes JSON 구조:**
```json
[
  {
    "id": "node-1",
    "type": "task",
    "position": {"x": 100, "y": 100},
    "data": {
      "title": "작품 선정",
      "description": "인상파 작품 15점 선정",
      "status": "in_progress",
      "assignee": "김지원",
      "dueDate": "2025-02-15"
    }
  }
]
```

**edges JSON 구조:**
```json
[
  {
    "id": "edge-1",
    "source": "node-1",
    "target": "node-2",
    "type": "default",
    "label": "완료 후"
  }
]
```

---

#### **agent_executions (에이전트 실행 로그)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 실행 ID |
| `workflow_id` | INTEGER | OPTIONAL, FOREIGN KEY → workflows(id) | 워크플로우 ID |
| `agent_type` | TEXT | NOT NULL | 에이전트 타입 ('exhibition-agent', 'budget-agent') |
| `input` | TEXT | OPTIONAL | 입력 데이터 (JSON) |
| `output` | TEXT | OPTIONAL | 출력 데이터 (JSON) |
| `status` | TEXT | CHECK(status IN ('pending', 'running', 'success', 'error')) | 상태 |
| `error_message` | TEXT | OPTIONAL | 에러 메시지 |
| `execution_time_ms` | INTEGER | OPTIONAL | 실행 시간 (밀리초) |
| `started_at` | DATETIME | OPTIONAL | 시작 시간 |
| `completed_at` | DATETIME | OPTIONAL | 완료 시간 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |

**샘플 데이터:**
```json
{
  "id": 1,
  "workflow_id": 42,
  "agent_type": "exhibition-agent",
  "input": {"command": "인상파 전시 기획해줘", "budget": 100000000},
  "output": {"concept": {"title": "빛의 여정"}, "artworks": [...]},
  "status": "success",
  "execution_time_ms": 8520,
  "started_at": "2025-01-23T10:30:00Z",
  "completed_at": "2025-01-23T10:30:08Z"
}
```

---

### 3.3 프로젝트 관련 테이블 (Project Tables)

#### **projects (프로젝트)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 프로젝트 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users(id) | 생성자 ID |
| `workspace_type` | TEXT | NOT NULL | 워크스페이스 타입 ('exhibition', 'collection', 'education') |
| `title` | TEXT | NOT NULL | 프로젝트 제목 |
| `description` | TEXT | OPTIONAL | 설명 |
| `status` | TEXT | CHECK(status IN ('planning', 'in_progress', 'completed', 'archived')) | 상태 |
| `start_date` | DATE | OPTIONAL | 시작일 |
| `end_date` | DATE | OPTIONAL | 종료일 |
| `budget` | REAL | OPTIONAL | 예산 (원) |
| `metadata` | TEXT | OPTIONAL | 추가 메타데이터 (JSON) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 수정 일시 |

**metadata JSON 구조 (전시 프로젝트 예시):**
```json
{
  "theme": "인상주의",
  "venue": "본관 2층 전시실",
  "expectedVisitors": 50000,
  "curator": "김지원",
  "team": ["이민호", "박지은"]
}
```

---

### 3.4 문서 관련 테이블 (Document Tables)

#### **documents (문서)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | 문서 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users(id) | 작성자 ID |
| `project_id` | INTEGER | OPTIONAL, FOREIGN KEY → projects(id) | 연결된 프로젝트 ID |
| `title` | TEXT | NOT NULL | 문서 제목 |
| `content` | TEXT | OPTIONAL | 문서 내용 (Markdown 또는 HTML) |
| `format` | TEXT | CHECK(format IN ('markdown', 'html', 'pdf')) | 문서 형식 |
| `file_url` | TEXT | OPTIONAL | 파일 URL (R2 스토리지) |
| `version` | INTEGER | DEFAULT 1 | 버전 번호 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 수정 일시 |

**샘플 데이터:**
```json
{
  "id": 1,
  "user_id": 1,
  "project_id": 42,
  "title": "인상주의 전시 기획안",
  "content": "# 전시 개요\n\n...",
  "format": "markdown",
  "file_url": "https://museflow-files.r2.dev/docs/exhibition-plan-42.pdf",
  "version": 3,
  "created_at": "2025-01-20T14:00:00Z",
  "updated_at": "2025-01-23T10:30:00Z"
}
```

---

## 4. API 엔드포인트 사전 (API Endpoint Dictionary)

### 4.1 인증 API (Authentication API)

#### **POST /api/auth/register**
> 신규 사용자 회원가입

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "김지원",
  "role": "member"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "김지원",
    "role": "member"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `409 Conflict`: Email already registered
- `400 Bad Request`: Invalid input

---

#### **POST /api/auth/login**
> 사용자 로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "김지원",
    "role": "member"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

#### **GET /api/auth/me**
> 현재 로그인한 사용자 정보 조회 (보호된 엔드포인트)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "김지원",
    "role": "member"
  }
}
```

---

### 4.2 대시보드 API (Dashboard API)

#### **GET /api/dashboard/config**
> 사용자 대시보드 설정 조회

**Response (200 OK):**
```json
{
  "config": {
    "id": 1,
    "user_id": 1,
    "layout": {...},
    "widgets": [...],
    "theme": "light",
    "auto_refresh_interval": 60
  }
}
```

---

#### **PUT /api/dashboard/config**
> 대시보드 설정 업데이트

**Request Body:**
```json
{
  "layout": {...},
  "widgets": [...],
  "theme": "dark"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "config": {...}
}
```

---

#### **GET /api/dashboard/widgets/:widgetType/data**
> 위젯 데이터 조회

**Path Parameters:**
- `widgetType`: 위젯 타입 (예: `projects`, `budget`, `calendar`)

**Response (200 OK):**
```json
{
  "data": {
    "projects": [
      {"id": 1, "name": "인상파 전시", "progress": 75, "status": "in_progress"},
      {"id": 2, "name": "교육 프로그램", "progress": 30, "status": "planning"}
    ]
  }
}
```

---

### 4.3 워크플로우 API (Workflow API)

#### **POST /api/workflows/generate**
> AI 워크플로우 자동 생성

**Request Body:**
```json
{
  "command": "인상파 전시 기획해줘, 예산 1억, 기간 3개월",
  "context": {
    "workspace": "exhibition",
    "targetDate": "2025-05-01"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "workflow": {
    "id": 42,
    "title": "인상파 전시 기획",
    "nodes": [...],
    "edges": [...]
  },
  "executionTime": 8520
}
```

---

#### **GET /api/workflows**
> 사용자 워크플로우 목록 조회

**Query Parameters:**
- `status`: 상태 필터 (옵션)
- `type`: 타입 필터 (옵션)
- `limit`: 개수 제한 (기본: 20)
- `offset`: 페이지네이션 오프셋 (기본: 0)

**Response (200 OK):**
```json
{
  "workflows": [
    {"id": 42, "title": "인상파 전시 기획", "status": "active"},
    {"id": 43, "title": "예산 계획", "status": "draft"}
  ],
  "total": 2
}
```

---

#### **GET /api/workflows/:id**
> 특정 워크플로우 상세 조회

**Response (200 OK):**
```json
{
  "workflow": {
    "id": 42,
    "title": "인상파 전시 기획",
    "description": "...",
    "nodes": [...],
    "edges": [...],
    "status": "active",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

#### **PUT /api/workflows/:id**
> 워크플로우 수정

**Request Body:**
```json
{
  "title": "인상파 전시 기획 (수정)",
  "nodes": [...],
  "edges": [...],
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "workflow": {...}
}
```

---

#### **DELETE /api/workflows/:id**
> 워크플로우 삭제

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### 4.4 검색 API (Search API)

#### **GET /api/search**
> 전역 검색

**Query Parameters:**
- `q`: 검색어 (필수)
- `type`: 검색 타입 (옵션: `all`, `projects`, `documents`, `users`)
- `limit`: 개수 제한 (기본: 20)

**Response (200 OK):**
```json
{
  "results": [
    {
      "type": "project",
      "id": 42,
      "title": "인상파 전시",
      "snippet": "...인상주의 작품을 중심으로...",
      "score": 0.95
    },
    {
      "type": "document",
      "id": 15,
      "title": "전시 기획안",
      "snippet": "...인상파 전시 콘셉트...",
      "score": 0.87
    }
  ],
  "total": 2,
  "executionTime": 120
}
```

---

### 4.5 문서 API (Document API)

#### **POST /api/documents**
> 문서 생성

**Request Body:**
```json
{
  "title": "전시 기획안",
  "content": "# 전시 개요\n\n...",
  "format": "markdown",
  "project_id": 42
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "document": {
    "id": 15,
    "title": "전시 기획안",
    "created_at": "2025-01-23T10:30:00Z"
  }
}
```

---

#### **POST /api/documents/generate**
> AI 문서 자동 생성

**Request Body:**
```json
{
  "template": "exhibition_plan",
  "data": {
    "title": "인상파 전시",
    "theme": "인상주의",
    "budget": 100000000
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "document": {
    "id": 16,
    "title": "인상파 전시 기획안",
    "content": "# 전시 개요\n\n이번 전시는...",
    "file_url": "https://museflow-files.r2.dev/docs/doc-16.pdf"
  }
}
```

---

## 5. 에러 코드 사전 (Error Code Dictionary)

### 5.1 HTTP 상태 코드 (HTTP Status Codes)

| 코드 | 이름 | 설명 | 사용 사례 |
|------|------|------|----------|
| **200** | OK | 요청 성공 | GET, PUT 성공 |
| **201** | Created | 리소스 생성 성공 | POST 성공 |
| **204** | No Content | 요청 성공, 응답 본문 없음 | DELETE 성공 |
| **400** | Bad Request | 잘못된 요청 | 유효성 검증 실패 |
| **401** | Unauthorized | 인증 필요 | 토큰 없음 또는 만료 |
| **403** | Forbidden | 권한 없음 | RBAC 권한 부족 |
| **404** | Not Found | 리소스 없음 | 존재하지 않는 ID |
| **409** | Conflict | 리소스 충돌 | 이메일 중복 |
| **422** | Unprocessable Entity | 처리 불가 | 비즈니스 로직 오류 |
| **429** | Too Many Requests | 요청 제한 초과 | Rate Limiting |
| **500** | Internal Server Error | 서버 오류 | 예상치 못한 에러 |
| **503** | Service Unavailable | 서비스 불가 | 점검 중 또는 과부하 |

---

### 5.2 커스텀 에러 코드 (Custom Error Codes)

| 에러 코드 | HTTP 상태 | 설명 | 해결 방법 |
|----------|----------|------|----------|
| `AUTH_001` | 401 | Invalid credentials | 이메일/비밀번호 확인 |
| `AUTH_002` | 401 | Token expired | 재로그인 필요 |
| `AUTH_003` | 401 | Token invalid | 재로그인 필요 |
| `AUTH_004` | 403 | Insufficient permissions | 권한 상승 요청 |
| `USER_001` | 409 | Email already exists | 다른 이메일 사용 |
| `USER_002` | 404 | User not found | 사용자 ID 확인 |
| `WORKFLOW_001` | 422 | Workflow generation failed | 명령어 재입력 |
| `WORKFLOW_002` | 404 | Workflow not found | 워크플로우 ID 확인 |
| `AGENT_001` | 500 | Agent execution timeout | 다시 시도 |
| `AGENT_002` | 500 | Gemini API error | API 키 확인 |
| `DOCUMENT_001` | 422 | Document generation failed | 템플릿 확인 |
| `SEARCH_001` | 422 | Search query invalid | 검색어 수정 |
| `RATE_LIMIT_001` | 429 | Rate limit exceeded | 잠시 후 재시도 |

**에러 응답 형식:**
```json
{
  "error": "AUTH_002",
  "message": "Token expired. Please login again.",
  "timestamp": "2025-01-23T10:30:00Z",
  "path": "/api/dashboard/config"
}
```

---

## 6. 이벤트 타입 사전 (Event Type Dictionary)

### 6.1 사용자 이벤트 (User Events)

| 이벤트 타입 | 설명 | 페이로드 |
|------------|------|---------|
| `user.login` | 사용자 로그인 | `{userId, timestamp}` |
| `user.logout` | 사용자 로그아웃 | `{userId, timestamp}` |
| `user.register` | 신규 사용자 가입 | `{userId, email, role}` |
| `user.profile_update` | 프로필 수정 | `{userId, changes}` |

---

### 6.2 대시보드 이벤트 (Dashboard Events)

| 이벤트 타입 | 설명 | 페이로드 |
|------------|------|---------|
| `dashboard.widget_add` | 위젯 추가 | `{userId, widgetType}` |
| `dashboard.widget_remove` | 위젯 제거 | `{userId, widgetId}` |
| `dashboard.layout_change` | 레이아웃 변경 | `{userId, newLayout}` |
| `dashboard.theme_change` | 테마 변경 | `{userId, theme}` |

---

### 6.3 워크플로우 이벤트 (Workflow Events)

| 이벤트 타입 | 설명 | 페이로드 |
|------------|------|---------|
| `workflow.created` | 워크플로우 생성 | `{workflowId, userId, title}` |
| `workflow.updated` | 워크플로우 수정 | `{workflowId, userId, changes}` |
| `workflow.deleted` | 워크플로우 삭제 | `{workflowId, userId}` |
| `workflow.status_change` | 상태 변경 | `{workflowId, oldStatus, newStatus}` |
| `workflow.node_added` | 노드 추가 | `{workflowId, nodeId, nodeType}` |
| `workflow.node_updated` | 노드 수정 | `{workflowId, nodeId, changes}` |

---

### 6.4 에이전트 이벤트 (Agent Events)

| 이벤트 타입 | 설명 | 페이로드 |
|------------|------|---------|
| `agent.execution_start` | 에이전트 실행 시작 | `{agentType, taskId}` |
| `agent.execution_success` | 에이전트 실행 성공 | `{agentType, taskId, result}` |
| `agent.execution_error` | 에이전트 실행 실패 | `{agentType, taskId, error}` |
| `agent.message_sent` | 에이전트 간 메시지 전송 | `{from, to, messageType}` |

---

### 6.5 시스템 이벤트 (System Events)

| 이벤트 타입 | 설명 | 페이로드 |
|------------|------|---------|
| `system.health_check` | 시스템 헬스 체크 | `{status, timestamp}` |
| `system.error` | 시스템 에러 | `{errorType, message, stack}` |
| `system.performance_alert` | 성능 알림 | `{metric, value, threshold}` |

---

## 7. 약어 및 두문자어 (Abbreviations & Acronyms)

| 약어 | 전체 이름 | 설명 |
|------|-----------|------|
| **API** | Application Programming Interface | 애플리케이션 프로그래밍 인터페이스 |
| **ARR** | Annual Recurring Revenue | 연간 반복 매출 |
| **CAGR** | Compound Annual Growth Rate | 연평균 성장률 |
| **CDN** | Content Delivery Network | 콘텐츠 전송 네트워크 |
| **CI/CD** | Continuous Integration/Continuous Deployment | 지속적 통합/배포 |
| **CORS** | Cross-Origin Resource Sharing | 교차 출처 리소스 공유 |
| **CSAT** | Customer Satisfaction Score | 고객 만족도 점수 |
| **CSRF** | Cross-Site Request Forgery | 사이트 간 요청 위조 |
| **CSP** | Content Security Policy | 콘텐츠 보안 정책 |
| **D1** | Cloudflare D1 Database | Cloudflare D1 데이터베이스 |
| **DAU** | Daily Active Users | 일일 활성 사용자 |
| **HTTPS** | Hypertext Transfer Protocol Secure | 보안 HTTP |
| **JWT** | JSON Web Token | JSON 웹 토큰 |
| **KPI** | Key Performance Indicator | 핵심 성과 지표 |
| **KV** | Key-Value Storage | 키-값 스토리지 |
| **LCP** | Largest Contentful Paint | 최대 콘텐츠 렌더링 시간 |
| **MAU** | Monthly Active Users | 월간 활성 사용자 |
| **MCP** | Multi-agent Communication Protocol | 멀티에이전트 통신 프로토콜 |
| **MTTR** | Mean Time To Recovery | 평균 복구 시간 |
| **MVP** | Minimum Viable Product | 최소 기능 제품 |
| **NPS** | Net Promoter Score | 순추천지수 |
| **OT** | Operational Transform | 운영 변환 (실시간 협업 알고리즘) |
| **PBKDF2** | Password-Based Key Derivation Function 2 | 비밀번호 기반 키 유도 함수 2 |
| **PM** | Product Manager | 제품 관리자 |
| **PRD** | Product Requirements Document | 제품 요구사항 문서 |
| **QA** | Quality Assurance | 품질 보증 |
| **R2** | Cloudflare R2 Storage | Cloudflare R2 스토리지 |
| **RBAC** | Role-Based Access Control | 역할 기반 접근 제어 |
| **REST** | Representational State Transfer | REST (API 아키텍처) |
| **ROI** | Return on Investment | 투자 수익률 |
| **SAML** | Security Assertion Markup Language | 보안 표명 마크업 언어 |
| **SPA** | Single Page Application | 단일 페이지 애플리케이션 |
| **SQL** | Structured Query Language | 구조적 질의 언어 |
| **SSO** | Single Sign-On | 단일 인증 |
| **TF-IDF** | Term Frequency-Inverse Document Frequency | 단어 빈도-역문서 빈도 |
| **TLS** | Transport Layer Security | 전송 계층 보안 |
| **TOTP** | Time-based One-Time Password | 시간 기반 일회용 비밀번호 |
| **TTL** | Time To Live | 생존 시간 |
| **UI** | User Interface | 사용자 인터페이스 |
| **URL** | Uniform Resource Locator | 통합 자원 위치 지정자 |
| **UX** | User Experience | 사용자 경험 |
| **WAU** | Weekly Active Users | 주간 활성 사용자 |
| **WCAG** | Web Content Accessibility Guidelines | 웹 콘텐츠 접근성 가이드라인 |
| **XSS** | Cross-Site Scripting | 사이트 간 스크립팅 |

---

**문서 종료 (End of Document)**

---

**변경 이력 (Change Log):**
- 2025-01-23: v1.0 초기 작성 (MuseFlow V4 Documentation Team)

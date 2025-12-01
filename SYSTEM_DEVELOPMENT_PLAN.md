# MuseFlow Solo Curator AI System 개발 계획서

**문서 버전**: 1.0  
**작성일**: 2025-12-01  
**프로젝트명**: MuseFlow - AI 기반 1인 학예사 업무 자동화 시스템  
**대상**: 소규모 미술관/박물관 1인 학예사  

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [현황 분석](#2-현황-분석)
3. [시스템 목표](#3-시스템-목표)
4. [핵심 기능 설계](#4-핵심-기능-설계)
5. [시스템 아키텍처](#5-시스템-아키텍처)
6. [데이터베이스 설계](#6-데이터베이스-설계)
7. [AI 자동화 기능](#7-ai-자동화-기능)
8. [UI/UX 설계](#8-uiux-설계)
9. [개발 로드맵](#9-개발-로드맵)
10. [기대 효과](#10-기대-효과)
11. [위험 관리](#11-위험-관리)
12. [결론](#12-결론)

---

## 1. 프로젝트 개요

### 1.1 배경

소규모 미술관/박물관에서 1인 학예사가 전시, 교육, 수집보존, 출판, 연구, 행정 등 6개 핵심 업무를 단독으로 처리해야 하는 현실적 문제를 해결하기 위한 AI 기반 업무 자동화 시스템입니다.

### 1.2 문제 정의

**현재 1인 학예사 업무량 분석** (월 기준):
- **전시 기획/운영**: 60시간 (27.5%)
- **교육 프로그램**: 45시간 (20.6%)
- **수집/보존**: 50시간 (22.9%)
- **출판/홍보**: 35시간 (16.1%)
- **연구**: 40시간 (18.3%)
- **행정**: 32.5시간 (14.9%)
- **총 업무량**: 262.5시간/월 (가용시간 130시간의 **202% 초과**)

### 1.3 솔루션 방향

**AI 자동화 + 외부 협력 + 업무 재설계**를 통해 1인 학예사가 실제로 업무를 처리할 수 있는 시스템을 구축합니다.

- **AI 자동화**: 60시간/월 절감 (23%)
- **외부 협력**: 27시간/월 절감 (10%)
- **업무 우선순위화**: 24시간/월 절감 (9%)
- **최종 업무량**: 130시간/월 (100% 달성)

---

## 2. 현황 분석

### 2.1 기존 시스템 현황

**MuseFlow V10.6.2 현재 상태**:
- ✅ Canvas V3 워크플로우 시스템 완성 (88개 모듈)
- ✅ 샘플 워크플로우 (전시 기획 프로세스 13노드)
- ✅ Dashboard 기본 UI (8개 섹션, 5063줄)
- ✅ Cloudflare Pages 프로덕션 배포
- ⚠️ **문제점**: 정보 과부하, 긴 스크롤, 직관성 부족, 1인 학예사 맞춤 기능 없음

### 2.2 개선 필요 영역

| 영역 | 현재 상태 | 목표 상태 |
|------|-----------|-----------|
| Dashboard | 8개 섹션 (스크롤 지옥) | 3개 핵심 영역 + 탭 |
| 정보 밀도 | 과다 (인지 과부하) | 적정 (3가지 긴급 작업) |
| AI 자동화 | 없음 | 6개 핵심 업무 자동화 |
| 워크플로우 연동 | 독립적 페이지 | Hub & Spoke 통합 |
| 1인 맞춤 기능 | 없음 | Solo Curator Mode |

---

## 3. 시스템 목표

### 3.1 핵심 목표

1. **업무 시간 단축**: 262.5시간 → 130시간/월 (50% 절감)
2. **우선순위 자동화**: AI가 긴급 작업 3가지만 제시
3. **반복 업무 자동화**: 라벨 작성, SNS 콘텐츠, 이메일 회신 등
4. **통합 워크플로우**: Dashboard 중심 Hub & Spoke 아키텍처
5. **번아웃 방지**: 자동 업무 로그 + AI 인사이트

### 3.2 성과 지표 (KPI)

| 지표 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| 월 업무 시간 | 262.5h | 130h | -50% |
| 첫 작업 착수 시간 | 10초 | 2초 | -80% |
| 작업 완료율 | 65% | 92% | +42% |
| 사용자 만족도 | 3.5/5 | 4.8/5 | +37% |
| 반복 방문율 | 60% | 88% | +47% |

---

## 4. 핵심 기능 설계

### 4.1 AI 우선순위 커맨드 센터

**목적**: 1인 학예사가 가장 긴급한 작업 3가지에만 집중하도록 지원

**기능**:
```javascript
// AI Priority Algorithm
const calculateUrgency = (task) => {
  const factors = {
    deadline: (today - task.dueDate) / (1000 * 60 * 60 * 24), // 마감일까지 남은 일수
    impact: task.budget > 10000000 ? 3 : task.budget > 5000000 ? 2 : 1,
    dependencies: task.blockingOthers ? 2 : 1,
    complexity: task.estimatedHours / 8 // 업무 복잡도
  };
  
  return (factors.deadline * 0.4) + 
         (factors.impact * 0.3) + 
         (factors.dependencies * 0.2) + 
         (factors.complexity * 0.1);
};

// Top 3 긴급 작업만 표시
const prioritizedTasks = allTasks
  .map(task => ({ ...task, urgency: calculateUrgency(task) }))
  .sort((a, b) => b.urgency - a.urgency)
  .slice(0, 3);
```

**UI 구현**:
- 카드 1개당 1개 작업 (제목, 마감일, 예상 시간, 즉시 시작 버튼)
- AI 추천 이유 표시 ("예산 초과 위험 85%")
- 원클릭으로 Canvas V3 워크플로우 진입

### 4.2 AI 자동화 어시스턴트

#### 4.2.1 라벨 자동 생성 (2시간 → 5분, 87% 절감)

```javascript
// API Route: /api/ai/generate-label
app.post('/api/ai/generate-label', async (c) => {
  const { artworkId } = await c.req.json();
  
  // D1에서 작품 정보 조회
  const artwork = await c.env.DB.prepare(`
    SELECT title, artist, year, material, size, description
    FROM artworks WHERE id = ?
  `).bind(artworkId).first();
  
  // AI 프롬프트 생성
  const prompt = `
    작품 정보:
    - 제목: ${artwork.title}
    - 작가: ${artwork.artist}
    - 제작년도: ${artwork.year}
    - 재료: ${artwork.material}
    - 크기: ${artwork.size}
    - 설명: ${artwork.description}
    
    한국어, 영어, 중국어 3개 언어로 전시 라벨을 생성하세요.
    각 언어별 150자 이내, 관람객이 이해하기 쉬운 문체로 작성.
  `;
  
  // AI API 호출 (예: OpenAI GPT-4)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  const aiResult = await response.json();
  const labels = aiResult.choices[0].message.content;
  
  // D1에 저장
  await c.env.DB.prepare(`
    UPDATE artworks 
    SET label_ko = ?, label_en = ?, label_zh = ?, label_generated_at = ?
    WHERE id = ?
  `).bind(labels.ko, labels.en, labels.zh, new Date().toISOString(), artworkId).run();
  
  return c.json({ success: true, labels });
});
```

#### 4.2.2 SNS 콘텐츠 자동 생성 (30분 → 5분, 83% 절감)

```javascript
// API Route: /api/ai/generate-sns
app.post('/api/ai/generate-sns', async (c) => {
  const { projectId, platform } = await c.req.json(); // platform: 'instagram', 'facebook', 'blog'
  
  const project = await c.env.DB.prepare(`
    SELECT title, description, start_date, artworks_count
    FROM projects WHERE id = ?
  `).bind(projectId).first();
  
  const prompt = `
    전시 정보:
    - 제목: ${project.title}
    - 설명: ${project.description}
    - 시작일: ${project.start_date}
    - 작품 수: ${project.artworks_count}
    
    ${platform}용 SNS 게시물을 작성하세요.
    - Instagram: 해시태그 10개 포함, 감성적 문체, 150자
    - Facebook: 상세 설명, 관람 유도 문구, 300자
    - Blog: 심층 분석, 작품 의미 해석, 500자
  `;
  
  // AI 생성 로직...
  
  return c.json({ success: true, content });
});
```

#### 4.2.3 이메일 자동 회신 (1시간 → 10분, 83% 절감)

```javascript
// API Route: /api/ai/draft-email
app.post('/api/ai/draft-email', async (c) => {
  const { incomingEmail, category } = await c.req.json();
  
  // 카테고리별 템플릿
  const templates = {
    '관람문의': '예약 시스템 안내 + 관람 시간 + 요금 정보',
    '교육프로그램': '신청 방법 + 일정 + 준비물',
    '협력제안': '검토 기간 안내 + 담당자 연락처',
    '작품대여': '대여 정책 + 계약서 양식 + 보험 안내'
  };
  
  const prompt = `
    수신 이메일: ${incomingEmail}
    카테고리: ${category}
    템플릿: ${templates[category]}
    
    전문적이고 친절한 톤으로 회신 이메일 초안을 작성하세요.
  `;
  
  // AI 생성 + 사용자 검토 후 발송
  
  return c.json({ success: true, draft });
});
```

#### 4.2.4 일일 업무 리포트 자동 생성 (30분 → 즉시, 100% 절감)

```javascript
// API Route: /api/ai/daily-report (매일 18:00 자동 실행)
app.get('/api/ai/daily-report', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  
  // 오늘 처리한 작업 조회
  const tasks = await c.env.DB.prepare(`
    SELECT * FROM tasks 
    WHERE completed_at LIKE ? 
    ORDER BY completed_at DESC
  `).bind(`${today}%`).all();
  
  // 통계 생성
  const stats = {
    totalTasks: tasks.results.length,
    byCategory: tasks.results.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {}),
    totalHours: tasks.results.reduce((sum, task) => sum + task.actual_hours, 0)
  };
  
  // AI 인사이트
  const prompt = `
    오늘 업무 통계:
    - 완료 작업: ${stats.totalTasks}건
    - 카테고리별: ${JSON.stringify(stats.byCategory)}
    - 총 소요 시간: ${stats.totalHours}시간
    
    생산성 분석 및 개선 제안을 작성하세요 (3줄 요약).
  `;
  
  // AI 인사이트 생성...
  
  return c.json({ success: true, report: { stats, aiInsight } });
});
```

### 4.3 통합 상태 보드 (All-in-One)

**4개 카드로 6개 업무 한눈에 파악**:

```javascript
// Dashboard Widget Data Structure
const statusCards = [
  {
    title: '전시 현황',
    data: {
      ongoing: 2, // 진행중 전시
      upcoming: 1, // 예정 전시
      urgent: '라벨 작성 마감 3일 전',
      aiSuggestion: '관람객 수 -15%, SNS 홍보 강화 추천'
    }
  },
  {
    title: '소장품 관리',
    data: {
      total: 1247, // 총 소장품
      needConservation: 8, // 보존 필요
      recentAcquisition: 3, // 최근 수집
      urgent: '습도 관리 필요 작품 8점'
    }
  },
  {
    title: '교육/연구',
    data: {
      educationPrograms: 2, // 진행중 교육
      participants: 45, // 참가자
      researchProjects: 1, // 연구 과제
      urgent: '교육 프로그램 참가자 모집 중'
    }
  },
  {
    title: '예산 현황',
    data: {
      total: 50000000, // 총 예산
      used: 32500000, // 사용액
      usageRate: 65, // 사용률 %
      urgent: '전시 예산 85% 초과 위험',
      aiSuggestion: '다음 분기 예산 조정 필요'
    }
  }
];
```

### 4.4 AI 추천 스케줄

**에너지 레벨 기반 자동 일정 생성**:

```javascript
// AI Schedule Optimizer
const optimizeSchedule = (tasks) => {
  const schedule = {
    morning: [], // 09:00-12:00 (고에너지)
    afternoon: [], // 13:00-17:00 (중에너지)
    evening: [] // 17:00-18:00 (저에너지)
  };
  
  // 작업 분류
  tasks.forEach(task => {
    if (task.complexity === 'high' && task.creativity_required) {
      schedule.morning.push(task); // 창의적 고난이도 → 아침
    } else if (task.complexity === 'medium') {
      schedule.afternoon.push(task); // 중간 난이도 → 오후
    } else {
      schedule.evening.push(task); // 단순 반복 → 저녁
    }
  });
  
  return schedule;
};

// 사용 예시
const todayTasks = [
  { id: 1, title: '전시 기획안 작성', complexity: 'high', creativity_required: true },
  { id: 2, title: '라벨 교정', complexity: 'low', creativity_required: false },
  { id: 3, title: '예산 보고서 작성', complexity: 'medium', creativity_required: false }
];

const optimized = optimizeSchedule(todayTasks);
// Result:
// morning: ['전시 기획안 작성']
// afternoon: ['예산 보고서 작성']
// evening: ['라벨 교정']
```

### 4.5 자동 업무 로그

**모든 작업 자동 트래킹 + AI 인사이트**:

```javascript
// Auto Work Log System
class WorkLogger {
  constructor(db) {
    this.db = db;
    this.currentTask = null;
    this.startTime = null;
  }
  
  // 작업 시작
  async startTask(taskId) {
    this.currentTask = taskId;
    this.startTime = Date.now();
    
    await this.db.prepare(`
      INSERT INTO work_logs (task_id, start_time, status)
      VALUES (?, ?, 'in_progress')
    `).bind(taskId, new Date().toISOString()).run();
  }
  
  // 작업 완료
  async completeTask() {
    const duration = (Date.now() - this.startTime) / 1000 / 60; // 분 단위
    
    await this.db.prepare(`
      UPDATE work_logs 
      SET end_time = ?, duration_minutes = ?, status = 'completed'
      WHERE task_id = ? AND status = 'in_progress'
    `).bind(new Date().toISOString(), duration, this.currentTask).run();
    
    this.currentTask = null;
    this.startTime = null;
  }
  
  // 일간 요약
  async getDailySummary(date) {
    const logs = await this.db.prepare(`
      SELECT t.category, SUM(wl.duration_minutes) as total_minutes
      FROM work_logs wl
      JOIN tasks t ON wl.task_id = t.id
      WHERE DATE(wl.start_time) = ?
      GROUP BY t.category
    `).bind(date).all();
    
    return logs.results;
  }
  
  // AI 인사이트 생성
  async generateInsights(weeklyData) {
    const prompt = `
      주간 업무 데이터:
      ${JSON.stringify(weeklyData)}
      
      분석 항목:
      1. 가장 많은 시간을 소비한 업무 카테고리
      2. 생산성이 높은 시간대
      3. 병목 현상이 발생한 업무
      4. 다음 주 개선 제안 3가지
    `;
    
    // AI 인사이트 생성...
    return aiInsight;
  }
}
```

---

## 5. 시스템 아키텍처

### 5.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Cloudflare Pages)         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Canvas V3   │  │   Budget     │      │
│  │  (Hub)       │◄─┤  (Workflow)  │  │  Analytics   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                API Layer (Hono on Cloudflare Workers)        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Project API  │  │   AI API     │  │  Sync API    │      │
│  │ /api/projects│  │ /api/ai/*    │  │ /api/sync    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                     │
        ▼                    ▼                     ▼
┌──────────────┐   ┌──────────────┐    ┌──────────────┐
│ D1 Database  │   │  KV Storage  │    │  R2 Storage  │
│ (Projects,   │   │  (Cache,     │    │  (Files,     │
│  Tasks,      │   │   Sessions)  │    │   Images)    │
│  Logs)       │   │              │    │              │
└──────────────┘   └──────────────┘    └──────────────┘
        │
        ▼
┌──────────────┐
│ External AI  │
│ (OpenAI,     │
│  Claude)     │
└──────────────┘
```

### 5.2 Hub & Spoke 통합 모델

**Dashboard를 중심으로 모든 페이지가 연결**:

```javascript
// Central Data Store (상태 관리)
class CentralDataStore {
  constructor() {
    this.state = {
      user: null,
      currentProject: null,
      projects: [],
      tasks: [],
      budget: {},
      analytics: {},
      workflows: []
    };
    
    this.observers = [];
    this.syncChannel = null;
  }
  
  // 상태 업데이트 (옵저버 패턴)
  setState(key, value) {
    this.state[key] = value;
    this.notifyObservers(key, value);
    this.syncToServer(key, value);
  }
  
  // 옵저버 등록
  subscribe(callback) {
    this.observers.push(callback);
  }
  
  // 옵저버 알림
  notifyObservers(key, value) {
    this.observers.forEach(callback => callback(key, value));
  }
  
  // 서버 동기화 (SSE)
  async syncToServer(key, value) {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, timestamp: Date.now() })
    });
  }
  
  // 실시간 동기화 스트림
  initSyncStream() {
    this.syncChannel = new EventSource('/api/sync/stream');
    
    this.syncChannel.onmessage = (event) => {
      const { key, value } = JSON.parse(event.data);
      this.state[key] = value;
      this.notifyObservers(key, value);
    };
  }
}

// 전역 데이터 스토어
window.dataStore = new CentralDataStore();
window.dataStore.initSyncStream();
```

### 5.3 페이지 간 컨텍스트 전달

**Dashboard → Canvas V3 예시**:

```javascript
// Dashboard에서 Canvas 진입
function openCanvasWithContext(projectId, focusNodeId) {
  // 컨텍스트 저장
  sessionStorage.setItem('canvasContext', JSON.stringify({
    projectId: projectId,
    focusNode: focusNodeId,
    returnTo: 'dashboard',
    timestamp: Date.now()
  }));
  
  // Canvas 페이지로 이동
  window.location.href = `/canvas-v3.html?project=${projectId}&focus=${focusNodeId}`;
}

// Canvas V3에서 컨텍스트 복원
function restoreContext() {
  const context = JSON.parse(sessionStorage.getItem('canvasContext') || '{}');
  
  if (context.focusNode) {
    // 특정 노드로 자동 포커스
    highlightNode(context.focusNode);
    panToNode(context.focusNode);
  }
  
  // 컨텍스트 바 표시
  showContextBar({
    origin: context.returnTo,
    projectName: getProjectName(context.projectId)
  });
}

// Canvas에서 작업 완료 후 자동 복귀
function completeTaskAndReturn() {
  const context = JSON.parse(sessionStorage.getItem('canvasContext') || '{}');
  
  // 작업 완료 저장
  saveCanvasState();
  
  // Dashboard로 자동 복귀
  window.location.href = `/${context.returnTo}.html`;
}
```

---

## 6. 데이터베이스 설계

### 6.1 D1 Database 스키마

```sql
-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'exhibition', 'education', 'research', etc.
  status TEXT DEFAULT 'planning', -- 'planning', 'in_progress', 'completed'
  start_date DATE,
  end_date DATE,
  budget INTEGER,
  spent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 작업 테이블
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'exhibition', 'education', 'collection', 'publication', 'research', 'admin'
  priority INTEGER DEFAULT 1, -- 1-5 (AI 계산)
  urgency_score REAL, -- AI 긴급도 점수
  estimated_hours REAL,
  actual_hours REAL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 업무 로그 테이블
CREATE TABLE IF NOT EXISTS work_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes REAL,
  status TEXT, -- 'in_progress', 'completed', 'paused'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- AI 생성 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'label', 'sns', 'email', 'report'
  related_id INTEGER, -- artwork_id, project_id 등
  prompt TEXT,
  generated_text TEXT,
  language TEXT,
  approved BOOLEAN DEFAULT 0,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 소장품 테이블
CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT,
  year INTEGER,
  material TEXT,
  size TEXT,
  description TEXT,
  label_ko TEXT,
  label_en TEXT,
  label_zh TEXT,
  label_generated_at DATETIME,
  conservation_status TEXT, -- 'good', 'needs_attention', 'urgent'
  last_inspection_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 예산 테이블
CREATE TABLE IF NOT EXISTS budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  category TEXT, -- 'exhibition', 'education', 'collection', 'publication', 'research', 'admin'
  item_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  spent INTEGER DEFAULT 0,
  transaction_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  work_style TEXT, -- 'sequential', 'parallel'
  preferred_work_hours TEXT, -- '09:00-18:00'
  notification_settings TEXT, -- JSON
  dashboard_layout TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_task ON work_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_budget_project ON budget_items(project_id);
```

### 6.2 마이그레이션 파일

```bash
# migrations/0009_solo_curator_system.sql
-- (상기 스키마 복사)
```

### 6.3 시드 데이터

```sql
-- seed.sql
-- 샘플 프로젝트
INSERT INTO projects (title, category, status, start_date, end_date, budget) VALUES
('세계 문화유산 순회전', 'exhibition', 'in_progress', '2025-01-15', '2025-03-31', 15000000),
('어린이 미술 교육 프로그램', 'education', 'planning', '2025-02-01', '2025-02-28', 3000000),
('조선시대 도자기 연구', 'research', 'in_progress', '2025-01-01', '2025-06-30', 5000000);

-- 샘플 작업 (AI 우선순위 테스트)
INSERT INTO tasks (project_id, title, category, priority, urgency_score, estimated_hours, due_date, status) VALUES
(1, '전시 라벨 3개 국어 작성', 'exhibition', 5, 8.5, 2, '2025-12-04', 'pending'),
(1, '전시 홍보 SNS 콘텐츠 10개 작성', 'exhibition', 4, 7.2, 1, '2025-12-05', 'pending'),
(2, '교육 프로그램 참가자 모집 공고', 'education', 3, 6.0, 0.5, '2025-12-10', 'pending'),
(3, '연구 논문 초고 작성', 'research', 2, 4.5, 8, '2025-12-20', 'pending');
```

---

## 7. AI 자동화 기능

### 7.1 AI API 통합

**OpenAI GPT-4 / Claude 통합**:

```javascript
// src/services/ai-service.js
class AIService {
  constructor(apiKey, model = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }
  
  async generateText(prompt, options = {}) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  // 라벨 생성 전용
  async generateLabel(artwork) {
    const prompt = this._buildLabelPrompt(artwork);
    return await this.generateText(prompt, { temperature: 0.5 });
  }
  
  // SNS 콘텐츠 생성 전용
  async generateSNS(project, platform) {
    const prompt = this._buildSNSPrompt(project, platform);
    return await this.generateText(prompt, { temperature: 0.8 });
  }
  
  // 이메일 초안 생성
  async draftEmail(incomingEmail, category) {
    const prompt = this._buildEmailPrompt(incomingEmail, category);
    return await this.generateText(prompt, { temperature: 0.6 });
  }
  
  // 업무 인사이트 생성
  async generateInsights(workData) {
    const prompt = this._buildInsightsPrompt(workData);
    return await this.generateText(prompt, { temperature: 0.5 });
  }
  
  // 프롬프트 빌더들...
  _buildLabelPrompt(artwork) {
    return `
작품 정보:
- 제목: ${artwork.title}
- 작가: ${artwork.artist}
- 제작년도: ${artwork.year}
- 재료: ${artwork.material}
- 크기: ${artwork.size}
- 설명: ${artwork.description}

다음 형식으로 전시 라벨을 생성하세요:

**한국어** (150자 이내):
[작품의 핵심 특징과 감상 포인트를 관람객이 쉽게 이해할 수 있도록 작성]

**English** (150자 이내):
[Same content in English]

**中文** (150자 이내):
[Same content in Chinese]
    `;
  }
  
  _buildSNSPrompt(project, platform) {
    const platformGuidelines = {
      instagram: '해시태그 10개 포함, 감성적 문체, 이모지 활용, 150자',
      facebook: '상세 설명, 관람 유도 문구, 300자',
      blog: '심층 분석, 작품 의미 해석, 큐레이터 관점, 500자'
    };
    
    return `
전시 정보:
- 제목: ${project.title}
- 설명: ${project.description}
- 기간: ${project.start_date} ~ ${project.end_date}

${platform}용 SNS 게시물을 작성하세요.
가이드라인: ${platformGuidelines[platform]}
    `;
  }
  
  _buildEmailPrompt(incomingEmail, category) {
    const templates = {
      '관람문의': '예약 시스템 안내, 관람 시간, 요금 정보 포함',
      '교육프로그램': '신청 방법, 일정, 준비물 안내',
      '협력제안': '검토 기간 안내, 담당자 연락처',
      '작품대여': '대여 정책, 계약서 양식, 보험 안내'
    };
    
    return `
수신 이메일:
${incomingEmail}

카테고리: ${category}
템플릿 가이드: ${templates[category]}

전문적이고 친절한 톤으로 회신 이메일 초안을 작성하세요.
    `;
  }
  
  _buildInsightsPrompt(workData) {
    return `
주간 업무 데이터:
${JSON.stringify(workData, null, 2)}

다음 항목을 분석하세요:
1. 가장 많은 시간을 소비한 업무 카테고리와 이유
2. 생산성이 높았던 시간대와 패턴
3. 병목 현상이 발생한 업무와 원인
4. 다음 주 개선 제안 3가지 (구체적이고 실행 가능한)

각 항목을 3줄 이내로 요약하세요.
    `;
  }
}

// Cloudflare Workers에서 사용
export default {
  async fetch(request, env) {
    const ai = new AIService(env.OPENAI_API_KEY);
    // ...
  }
};
```

### 7.2 AI 우선순위 알고리즘

```javascript
// src/services/priority-calculator.js
class PriorityCalculator {
  constructor(db) {
    this.db = db;
  }
  
  async calculateAllTasksPriority() {
    // 모든 작업 조회
    const tasks = await this.db.prepare(`
      SELECT t.*, p.budget, p.status as project_status
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.status != 'completed'
    `).all();
    
    // 각 작업의 긴급도 계산
    const scoredTasks = tasks.results.map(task => ({
      ...task,
      urgencyScore: this._calculateUrgencyScore(task)
    }));
    
    // 긴급도 순 정렬
    scoredTasks.sort((a, b) => b.urgencyScore - a.urgencyScore);
    
    // DB에 우선순위 업데이트
    for (let i = 0; i < scoredTasks.length; i++) {
      await this.db.prepare(`
        UPDATE tasks 
        SET priority = ?, urgency_score = ?
        WHERE id = ?
      `).bind(scoredTasks.length - i, scoredTasks[i].urgencyScore, scoredTasks[i].id).run();
    }
    
    return scoredTasks.slice(0, 3); // Top 3 반환
  }
  
  _calculateUrgencyScore(task) {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
    
    // 요소별 점수 계산
    const deadlineScore = this._getDeadlineScore(daysUntilDue);
    const impactScore = this._getImpactScore(task.budget, task.category);
    const dependencyScore = this._getDependencyScore(task);
    const complexityScore = this._getComplexityScore(task.estimated_hours);
    
    // 가중치 적용
    const weights = {
      deadline: 0.40,
      impact: 0.30,
      dependency: 0.20,
      complexity: 0.10
    };
    
    return (
      deadlineScore * weights.deadline +
      impactScore * weights.impact +
      dependencyScore * weights.dependency +
      complexityScore * weights.complexity
    );
  }
  
  _getDeadlineScore(daysUntilDue) {
    if (daysUntilDue < 0) return 10; // 마감 지남
    if (daysUntilDue <= 1) return 9;
    if (daysUntilDue <= 3) return 8;
    if (daysUntilDue <= 7) return 6;
    if (daysUntilDue <= 14) return 4;
    return 2;
  }
  
  _getImpactScore(budget, category) {
    let score = 0;
    
    // 예산 임팩트
    if (budget > 10000000) score += 5;
    else if (budget > 5000000) score += 3;
    else score += 1;
    
    // 카테고리 임팩트 (전시/교육이 우선)
    const categoryImpact = {
      'exhibition': 3,
      'education': 3,
      'collection': 2,
      'publication': 2,
      'research': 1,
      'admin': 1
    };
    score += categoryImpact[category] || 1;
    
    return score;
  }
  
  _getDependencyScore(task) {
    // 다른 작업을 블로킹하는지 확인
    // (간단한 예시, 실제로는 dependency graph 필요)
    return task.blocking_others ? 5 : 1;
  }
  
  _getComplexityScore(estimatedHours) {
    // 복잡도가 높을수록 먼저 처리 (분할 가능)
    if (estimatedHours > 8) return 4;
    if (estimatedHours > 4) return 3;
    if (estimatedHours > 2) return 2;
    return 1;
  }
}
```

### 7.3 AI 스케줄 최적화

```javascript
// src/services/schedule-optimizer.js
class ScheduleOptimizer {
  constructor(db, aiService) {
    this.db = db;
    this.ai = aiService;
  }
  
  async generateDailySchedule(userId, date) {
    // 오늘 할 작업 조회 (Top 10)
    const tasks = await this.db.prepare(`
      SELECT * FROM tasks
      WHERE status = 'pending'
      ORDER BY priority DESC, due_date ASC
      LIMIT 10
    `).all();
    
    // 사용자 작업 스타일 조회
    const userPrefs = await this.db.prepare(`
      SELECT work_style, preferred_work_hours
      FROM user_preferences
      WHERE user_id = ?
    `).bind(userId).first();
    
    // 에너지 레벨 기반 분류
    const schedule = this._categorizeByEnergy(tasks.results, userPrefs);
    
    // AI 추천 추가
    const aiRecommendation = await this._getAIRecommendation(schedule);
    
    return {
      schedule,
      aiRecommendation,
      totalEstimatedHours: this._calculateTotalHours(schedule)
    };
  }
  
  _categorizeByEnergy(tasks, userPrefs) {
    const schedule = {
      morning: { time: '09:00-12:00', tasks: [], energy: 'high' },
      afternoon: { time: '13:00-17:00', tasks: [], energy: 'medium' },
      evening: { time: '17:00-18:00', tasks: [], energy: 'low' }
    };
    
    tasks.forEach(task => {
      // 창의적이고 복잡한 작업 → 아침
      if (task.category === 'exhibition' || task.category === 'research') {
        if (task.estimated_hours > 2) {
          schedule.morning.tasks.push(task);
        } else {
          schedule.afternoon.tasks.push(task);
        }
      }
      // 중간 난이도 작업 → 오후
      else if (task.category === 'education' || task.category === 'publication') {
        schedule.afternoon.tasks.push(task);
      }
      // 단순 반복 작업 → 저녁
      else {
        schedule.evening.tasks.push(task);
      }
    });
    
    return schedule;
  }
  
  async _getAIRecommendation(schedule) {
    const prompt = `
오늘 스케줄:
- 아침 (고에너지): ${schedule.morning.tasks.map(t => t.title).join(', ')}
- 오후 (중에너지): ${schedule.afternoon.tasks.map(t => t.title).join(', ')}
- 저녁 (저에너지): ${schedule.evening.tasks.map(t => t.title).join(', ')}

1인 학예사를 위한 생산성 팁 3가지를 제안하세요 (각 1줄).
    `;
    
    return await this.ai.generateText(prompt, { temperature: 0.6, maxTokens: 200 });
  }
  
  _calculateTotalHours(schedule) {
    const allTasks = [
      ...schedule.morning.tasks,
      ...schedule.afternoon.tasks,
      ...schedule.evening.tasks
    ];
    
    return allTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  }
}
```

---

## 8. UI/UX 설계

### 8.1 Solo Curator Dashboard 3.0

**레이아웃 구조**:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] MuseFlow                    [알림] [설정] [프로필] │ ← Fixed Navbar
├─────────────────────────────────────────────────────────┤
│                                                           │
│  👋 안녕하세요, 김학예님                                    │ ← Hero Section
│  오늘 집중할 작업 3가지                                     │
│                                                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐  │
│  │ 🚨 긴급 작업 1   │ │ ⚠️ 긴급 작업 2   │ │ 📌 작업 3 │  │ ← AI 우선순위
│  │ 라벨 작성       │ │ SNS 콘텐츠      │ │ 예산보고  │  │
│  │ 마감: 3일 전    │ │ 마감: 5일 전    │ │ 예상 1h  │  │
│  │ 예상: 2h        │ │ 예상: 1h        │ │          │  │
│  │ [즉시 시작] ▶  │ │ [시작] ▶       │ │ [시작] ▶ │  │
│  └─────────────────┘ └─────────────────┘ └──────────┘  │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  📊 한눈에 보는 업무 현황                                   │ ← KPI Cards
│                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ 🎨 전시 │ │ 📦 소장품│ │ 📚 교육 │ │ 💰 예산 │      │
│  │ 진행 2  │ │ 총 1247 │ │ 참가 45 │ │ 65% 사용│      │
│  │ 예정 1  │ │ 보존 8  │ │ 프로그램2│ │ ⚠️초과위험│      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  📁 프로젝트 목록                                          │ ← Project Grid
│                                                           │
│  [진행중] [예정] [완료] [전체]                             │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ 세계 문화유산 순회전                      │            │
│  │ 진행중 • 예산 85% • 마감 45일 전          │            │
│  │ [워크플로우] [예산] [분석]                │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
│  [🏠 홈] [📊 워크플로우] [💰 예산] [📈 분석]              │ ← Bottom Nav
└─────────────────────────────────────────────────────────┘
```

### 8.2 컴포넌트 디자인

#### 8.2.1 AI 우선순위 카드

```html
<!-- public/static/components/priority-task-card.html -->
<div class="priority-task-card" data-urgency="high">
  <div class="card-header">
    <span class="urgency-badge">🚨 긴급</span>
    <span class="category-badge">전시</span>
  </div>
  
  <h3 class="task-title">전시 라벨 3개 국어 작성</h3>
  
  <div class="task-meta">
    <div class="meta-item">
      <i class="fas fa-clock"></i>
      <span>마감 3일 전</span>
    </div>
    <div class="meta-item">
      <i class="fas fa-hourglass-half"></i>
      <span>예상 2시간</span>
    </div>
  </div>
  
  <div class="ai-reason">
    <i class="fas fa-robot"></i>
    <span>예산 초과 위험 85% + 마감 임박</span>
  </div>
  
  <button class="btn-start" onclick="startTask(this)" data-task-id="1">
    <i class="fas fa-play-circle"></i>
    즉시 시작
  </button>
</div>

<style>
.priority-task-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.priority-task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.3);
}

.priority-task-card[data-urgency="high"] {
  border-color: rgba(239, 68, 68, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0); }
}

.card-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.urgency-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.category-badge {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}

.task-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.ai-reason {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #93c5fd;
}

.btn-start {
  width: 100%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-start:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.5);
}
</style>

<script>
function startTask(button) {
  const taskId = button.dataset.taskId;
  
  // 작업 시작 로그
  fetch('/api/work-logs/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, startTime: new Date().toISOString() })
  });
  
  // Canvas V3로 컨텍스트 전달하며 이동
  sessionStorage.setItem('canvasContext', JSON.stringify({
    taskId: taskId,
    returnTo: 'dashboard',
    timestamp: Date.now()
  }));
  
  window.location.href = `/canvas-v3.html?task=${taskId}`;
}
</script>
```

#### 8.2.2 KPI 상태 카드

```html
<!-- public/static/components/kpi-status-card.html -->
<div class="kpi-card" data-category="exhibition">
  <div class="kpi-icon">🎨</div>
  <h4 class="kpi-title">전시 현황</h4>
  
  <div class="kpi-stats">
    <div class="stat-row">
      <span class="stat-label">진행중</span>
      <span class="stat-value">2</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">예정</span>
      <span class="stat-value">1</span>
    </div>
  </div>
  
  <div class="kpi-alert">
    <i class="fas fa-exclamation-triangle"></i>
    <span>라벨 작성 마감 3일 전</span>
  </div>
  
  <div class="ai-insight">
    <i class="fas fa-lightbulb"></i>
    <span>관람객 수 -15%, SNS 홍보 강화 추천</span>
  </div>
</div>

<style>
.kpi-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.kpi-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.kpi-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.kpi-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.stat-value {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
}

.kpi-alert {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #fca5a5;
}

.ai-insight {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #93c5fd;
}
</style>
```

#### 8.2.3 프로젝트 카드 (간소화)

```html
<!-- public/static/components/project-card-mini.html -->
<div class="project-card-mini" data-project-id="1">
  <div class="project-header">
    <h4 class="project-title">세계 문화유산 순회전</h4>
    <span class="project-status status-inprogress">진행중</span>
  </div>
  
  <div class="project-meta">
    <div class="meta-item">
      <i class="fas fa-calendar"></i>
      <span>마감 45일 전</span>
    </div>
    <div class="meta-item">
      <i class="fas fa-dollar-sign"></i>
      <span>예산 85%</span>
      <span class="badge-warning">초과 위험</span>
    </div>
  </div>
  
  <div class="project-actions">
    <button class="btn-action" onclick="openCanvas(1)">
      <i class="fas fa-project-diagram"></i>
      워크플로우
    </button>
    <button class="btn-action" onclick="openBudget(1)">
      <i class="fas fa-chart-pie"></i>
      예산
    </button>
    <button class="btn-action" onclick="openAnalytics(1)">
      <i class="fas fa-chart-line"></i>
      분석
    </button>
  </div>
</div>

<style>
.project-card-mini {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.project-card-mini:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(168, 85, 247, 0.5);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.project-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-inprogress {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.badge-warning {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.project-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.btn-action {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.btn-action:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}
</style>

<script>
function openCanvas(projectId) {
  sessionStorage.setItem('canvasContext', JSON.stringify({
    projectId: projectId,
    returnTo: 'dashboard',
    timestamp: Date.now()
  }));
  window.location.href = `/canvas-v3.html?project=${projectId}`;
}

function openBudget(projectId) {
  sessionStorage.setItem('budgetContext', JSON.stringify({
    projectId: projectId,
    returnTo: 'dashboard'
  }));
  window.location.href = `/budget.html?project=${projectId}`;
}

function openAnalytics(projectId) {
  sessionStorage.setItem('analyticsContext', JSON.stringify({
    projectId: projectId,
    returnTo: 'dashboard'
  }));
  window.location.href = `/analytics-dashboard.html?project=${projectId}`;
}
</script>
```

### 8.3 반응형 디자인

```css
/* Mobile First Design */
/* public/static/css/solo-curator-dashboard.css */

/* Base (Mobile) */
.dashboard-container {
  padding: 1rem;
  max-width: 100%;
}

.priority-tasks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.project-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .dashboard-container {
    padding: 2rem;
  }
  
  .priority-tasks {
    flex-direction: row;
  }
  
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .project-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 3rem;
  }
  
  .priority-tasks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  
  .kpi-cards {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 9. 개발 로드맵

### 9.1 Phase 1: 기반 구축 (1주)

**목표**: Central Data Store + AI API 통합

**작업 목록**:
- [ ] CentralDataStore 클래스 구현
- [ ] Server-Sent Events 실시간 동기화
- [ ] D1 Database 마이그레이션 (0009_solo_curator_system.sql)
- [ ] AIService 클래스 구현 (OpenAI GPT-4 통합)
- [ ] PriorityCalculator 구현
- [ ] 단위 테스트 작성

**성공 기준**:
- ✅ 모든 페이지가 CentralDataStore 통해 데이터 공유
- ✅ AI API 호출 성공률 95% 이상
- ✅ 우선순위 알고리즘 정확도 검증

### 9.2 Phase 2: Solo Dashboard 구현 (1주)

**목표**: 1인 학예사 맞춤 Dashboard UI

**작업 목록**:
- [ ] Solo Curator Dashboard 3.0 HTML/CSS 구현
- [ ] AI 우선순위 카드 컴포넌트
- [ ] KPI 상태 카드 4개 (전시, 소장품, 교육, 예산)
- [ ] 프로젝트 카드 간소화
- [ ] Bottom Navigation 구현
- [ ] 반응형 디자인 (Mobile/Tablet/Desktop)

**성공 기준**:
- ✅ 스크롤 길이 8000px → 3000px (-62%)
- ✅ 첫 작업 착수 시간 10초 → 2초
- ✅ 모바일 UX 테스트 통과

### 9.3 Phase 3: AI 자동화 기능 (1주)

**목표**: 6개 핵심 업무 자동화

**작업 목록**:
- [ ] 라벨 자동 생성 API (`/api/ai/generate-label`)
- [ ] SNS 콘텐츠 생성 API (`/api/ai/generate-sns`)
- [ ] 이메일 초안 작성 API (`/api/ai/draft-email`)
- [ ] 일일 리포트 자동 생성 (Cron Job)
- [ ] AI 추천 스케줄 API (`/api/ai/optimize-schedule`)
- [ ] 자동 업무 로그 시스템 (WorkLogger)

**성공 기준**:
- ✅ 라벨 작성 시간 2h → 5분 (87% 절감)
- ✅ SNS 콘텐츠 30분 → 5분 (83% 절감)
- ✅ 이메일 회신 1h → 10분 (83% 절감)
- ✅ 일일 리포트 30분 → 즉시 (100% 절감)

### 9.4 Phase 4: Hub & Spoke 통합 (1주)

**목표**: Dashboard ↔ Canvas/Budget/Analytics 연동

**작업 목록**:
- [ ] Canvas V3 Solo Curator Mode 구현
- [ ] Budget Page 컨텍스트 바 추가
- [ ] Analytics Page AI 인사이트 위젯
- [ ] Contextual Navigation (Smart Breadcrumb)
- [ ] 작업 완료 시 자동 Dashboard 복귀
- [ ] 실시간 데이터 동기화 테스트

**성공 기준**:
- ✅ 페이지 간 컨텍스트 유지율 100%
- ✅ 데이터 동기화 지연 < 1초
- ✅ 작업 흐름 끊김 없음

### 9.5 Phase 5: 고도화 & 안정화 (2주)

**목표**: 성능 최적화 + 사용자 테스트

**작업 목록**:
- [ ] 성능 최적화 (Lazy Loading, Virtual Scrolling)
- [ ] PWA 기능 강화 (오프라인 모드)
- [ ] 실제 학예사 베타 테스트 (3명)
- [ ] 피드백 반영 및 UI 개선
- [ ] 사용자 매뉴얼 작성
- [ ] 최종 프로덕션 배포

**성공 기준**:
- ✅ Page Load < 2초
- ✅ Lighthouse Score > 90
- ✅ 베타 사용자 만족도 4.5/5 이상

---

## 10. 기대 효과

### 10.1 정량적 효과

| 지표 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| **월 업무 시간** | 262.5h | 130h | **-50%** |
| **라벨 작성 시간** | 2h | 5분 | **-87%** |
| **SNS 콘텐츠 작성** | 30분 | 5분 | **-83%** |
| **이메일 회신** | 1h | 10분 | **-83%** |
| **일일 리포트** | 30분 | 즉시 | **-100%** |
| **첫 작업 착수 시간** | 10초 | 2초 | **-80%** |
| **작업 완료율** | 65% | 92% | **+42%** |
| **사용자 만족도** | 3.5/5 | 4.8/5 | **+37%** |

### 10.2 정성적 효과

1. **업무 부담 경감**
   - 정시 퇴근 가능 (12시간 → 8시간 근무)
   - 주말 업무 감소
   - 스트레스 및 번아웃 방지

2. **전문성 향상**
   - 행정/반복 업무 시간 감소 → 연구/기획에 집중
   - 창의적 작업에 더 많은 에너지 투입
   - 전문 학예사로서의 커리어 발전

3. **관람객 경험 개선**
   - 전시 품질 향상 (AI 라벨, 큐레이션)
   - 교육 프로그램 다양화
   - 빠른 민원 응대

4. **미술관 운영 효율화**
   - 예산 초과 방지 (실시간 모니터링)
   - 데이터 기반 의사결정
   - 외부 협력 네트워크 구축 용이

### 10.3 ROI 분석

**개발 비용**: 약 5주 (1명 개발자 풀타임)
**예상 시간 절감**: 132.5시간/월 (50%)
**학예사 1명 인건비**: 월 300만원 가정
**절감 금액**: 월 150만원 (50%)
**연간 절감**: 1,800만원

**투자 회수 기간**: 약 2개월

---

## 11. 위험 관리

### 11.1 기술적 위험

| 위험 | 발생 확률 | 영향도 | 대응 방안 |
|------|-----------|--------|-----------|
| AI API 장애 | 중 | 고 | Fallback 로직 구현 (템플릿 기반) |
| D1 Database 성능 | 저 | 중 | 인덱스 최적화 + KV 캐싱 |
| 실시간 동기화 지연 | 중 | 중 | SSE 타임아웃 처리 + 폴백 |
| 복잡한 워크플로우 처리 | 중 | 고 | Canvas V3 성능 최적화 |

**대응 전략**:
- AI API 장애 시: 사전 정의된 템플릿 사용
- 성능 이슈: Lazy Loading, Virtual Scrolling
- 네트워크 장애: PWA 오프라인 모드

### 11.2 사용자 수용 위험

| 위험 | 발생 확률 | 영향도 | 대응 방안 |
|------|-----------|--------|-----------|
| AI 생성 콘텐츠 불신 | 중 | 고 | 사용자 검토/수정 기능 필수 |
| 복잡한 UI로 인한 거부감 | 저 | 중 | 첫 방문 튜토리얼 제공 |
| 기존 업무 방식 고수 | 중 | 고 | 점진적 도입 + 교육 |

**대응 전략**:
- AI는 "제안"만 하고 최종 결정은 사용자
- 간단한 UI + 단계별 가이드
- 실제 학예사 베타 테스트 필수

### 11.3 운영 위험

| 위험 | 발생 확률 | 영향도 | 대응 방안 |
|------|-----------|--------|-----------|
| AI API 비용 초과 | 중 | 중 | 월 사용량 제한 + 알림 |
| 데이터 손실 | 저 | 고 | 자동 백업 시스템 |
| 보안 취약점 | 저 | 고 | 정기 보안 점검 |

**대응 전략**:
- AI API 월 예산 설정 ($100)
- 일일 자동 백업 (Cloudflare R2)
- HTTPS + CORS + 인증 강화

---

## 12. 결론

### 12.1 프로젝트 요약

**MuseFlow Solo Curator AI System**은 1인 학예사가 6개 핵심 업무를 효과적으로 처리할 수 있도록 지원하는 AI 기반 업무 자동화 시스템입니다.

**핵심 가치**:
1. **시간 절약**: 월 262.5시간 → 130시간 (50% 절감)
2. **AI 자동화**: 반복 업무 자동화 (라벨, SNS, 이메일, 리포트)
3. **우선순위 명확화**: AI가 긴급 작업 3가지만 제시
4. **통합 워크플로우**: Dashboard 중심 Hub & Spoke 아키텍처
5. **번아웃 방지**: 자동 업무 로그 + AI 인사이트

### 12.2 성공 조건

이 시스템이 성공하기 위한 **3가지 필수 조건**:

1. **AI 최대화 (60시간/월 절감)**
   - 라벨, SNS, 이메일, 리포트 자동화
   - 우선순위 자동 계산
   - 스케줄 최적화

2. **외부 협력 (27시간/월 절감)**
   - 보존 처리: 외부 전문가
   - 디자인: 프리랜서
   - 행정: 자원봉사자

3. **업무 우선순위화 (24시간/월 절감)**
   - 연구 축소 (40h → 20h)
   - 회의 간소화
   - 불필요한 보고 제거

### 12.3 장기 비전

**1년 후 목표**:
- AI 자동화율 70% 달성
- 전국 소규모 미술관 10곳 도입
- 학예사 업무 표준화 가이드 구축

**3년 후 목표**:
- 전국 박물관/미술관 네트워크 구축
- 공동 소장품 DB 연계
- 문화체육관광부 공식 인증 솔루션

### 12.4 최종 의견

현재 **1인 학예사 단독 업무 처리는 불가능**하지만, 이 시스템을 통해 **조건부 가능**하게 만들 수 있습니다.

**단, 다음 조건 충족 시**:
- ✅ AI 자동화 최대 활용
- ✅ 외부 협력 네트워크 구축
- ✅ 업무 우선순위 엄격 관리
- ⚠️ 연구 시간 축소 (장기적으로는 외부 연구 협력 필요)
- ⚠️ 번아웃 위험 상시 모니터링

**교수님의 결정이 필요합니다**:
1. 이 계획서대로 개발을 진행할까요?
2. 수정이 필요한 부분이 있나요?
3. 우선순위를 조정해야 할 기능이 있나요?

---

**문서 끝**

**작성자**: AI Assistant  
**검토자**: 남현우 교수  
**버전**: 1.0  
**최종 수정일**: 2025-12-01

# 📋 기존 projects.html 기능 분석 (v2.0.0)

## 🔍 완전 분석 완료

### 📦 **백업 정보**
- **백업 URL**: https://www.genspark.ai/api/files/s/bDijDoA7
- **백업 파일**: museflow-v4-pre-museum-upgrade.tar.gz
- **크기**: 6.3 MB
- **날짜**: 2025-11-29
- **설명**: 뮤지엄 특화 구현 전 완전 백업 (git 히스토리 포함)

---

## ✅ **기존 구현된 핵심 기능**

### 1. **CRUD 기능** (완벽 구현)

#### 📝 Create (생성)
```javascript
// POST /api/projects
// 모달: project-modal (제목, 설명, 상태 입력)
// 생성 후: Canvas로 자동 리다이렉트
// sessionStorage 저장: museflow_current_project
```

#### 📖 Read (조회)
```javascript
// GET /api/projects
// Authorization: Bearer {token}
// Response: { projects: Project[] }
```

#### ✏️ Update (수정)
```javascript
// PUT /api/projects/:id
// 편집 모달: openEditModal(project)
// 수정 후: 목록 새로고침
```

#### 🗑️ Delete (삭제)
```javascript
// DELETE /api/projects/:id
// 확인 다이얼로그
// 삭제 후: 목록 새로고침
```

---

### 2. **UI/UX 기능**

#### 🎨 **디자인 시스템**
- **Glassmorphism**: `backdrop-filter: blur(20px)`
- **Gradient Text**: Purple → Pink
- **애니메이션**: 
  - Card hover: `translateY(-8px) scale(1.02)`
  - Modal: `modalSlideUp`
  - Loading: skeleton animation
- **Progress Bar**: 가짜 진행률 (20/60/100%)

#### 📊 **통계 대시보드**
```javascript
renderStats() {
  total: 전체 프로젝트 수 (📊)
  active: 활성 프로젝트 (⚡)
  completed: 완료 프로젝트 (✅)
}
```

#### 🔍 **필터링 시스템**
```javascript
filterProjects() {
  // 검색: 제목/설명 필터
  searchInput.value
  
  // 상태 필터: all/draft/active/completed
  statusFilter.value
  
  // 정렬: updated/created/title
  sortSelect.value
}
```

#### 👁️ **뷰 모드**
```javascript
// Grid View (기본)
grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))

// List View
grid-template-columns: 1fr
flex-direction: row (카드 가로 배치)

// localStorage 저장
localStorage.setItem('projects_view', view)
```

---

### 3. **다국어 지원 (i18n)**

#### 🌐 **지원 언어 (9개)**
```javascript
ko, en, ja, zh-CN, zh-TW, fr, de, es, it
```

#### 🔄 **번역 시스템**
```javascript
updateLanguage(lang) {
  // DOM 업데이트
  [data-i18n] → textContent
  [data-i18n-placeholder] → placeholder
  
  // 재렌더링
  renderStats()
  filterProjects()
  
  // localStorage 저장
  localStorage.setItem('museflow_language', lang)
}
```

#### 📝 **번역 키 (40+ 키)**
```javascript
myProjects, projectsSubtitle, newProject, searchPlaceholder,
statusAll, statusDraft, statusActive, statusCompleted,
createNewProject, editProject, projectTitle, projectDescription,
create, save, cancel, edit, delete, deleteConfirm,
today, yesterday, daysAgo, noDescription, totalProjects, etc.
```

---

### 4. **상태 관리**

#### 💾 **LocalStorage**
```javascript
'museflow_language'    // 언어 설정
'projects_view'        // 뷰 모드 (grid/list)
'projects_version'     // 버전 (2.0.0)
'authToken'            // JWT 토큰
```

#### 🔄 **SessionStorage**
```javascript
'museflow_current_project' // 현재 프로젝트 정보
{
  id, name, description, status,
  created_at, updated_at
}
```

#### 🌐 **전역 변수**
```javascript
allProjects = []       // 전체 프로젝트 배열
currentLang = 'ko'     // 현재 언어
currentView = 'grid'   // 현재 뷰 모드
token                  // JWT 토큰
```

---

### 5. **Canvas 연동**

#### 🎨 **자동 리다이렉트**
```javascript
// 신규 프로젝트 생성 후
if (!projectId) {
  const projectData = {
    id: data.projectId,
    name: title,
    description,
    status
  };
  sessionStorage.setItem('museflow_current_project', JSON.stringify(projectData));
  window.location.href = `/canvas.html?project=${projectData.id}&t=${Date.now()}`;
}
```

#### 🖱️ **카드 클릭**
```javascript
// 프로젝트 카드 클릭 시
card.addEventListener('click', () => {
  sessionStorage.setItem('museflow_current_project', JSON.stringify(projectData));
  window.location.href = `/canvas.html?project=${project.id}&t=${Date.now()}`;
});
```

---

### 6. **날짜 포맷팅**

#### 📅 **formatDate() 함수**
```javascript
formatDate(dateString) {
  // 오늘, 어제, N일 전
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  
  // 날짜 형식 (언어별)
  ko: '2025년 11월 29일'
  en: 'Nov 29, 2025'
}
```

---

### 7. **모달 시스템**

#### 📝 **project-modal**
```javascript
openModal()        // 신규 생성
openEditModal(p)   // 편집
closeModal()       // 닫기

// 필드
- project-id (hidden)
- project-title (input, required)
- project-description (textarea)
- project-status (select: draft/active/completed)
```

#### 🎬 **애니메이션**
```css
.modal {
  animation: modalFadeIn 0.3s
}
.modal-content {
  animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)
}
```

---

### 8. **카드 렌더링**

#### 🎴 **프로젝트 카드 구조**
```html
<div class="glass-card project-card">
  <div class="project-thumbnail">
    [상태 아이콘: 📝/🚀/✅]
  </div>
  <div class="content">
    [제목] [상태 배지]
    [설명 (3줄)]
    [진행률 바]
    [날짜 정보]
    [편집] [삭제]
  </div>
</div>
```

#### 🎨 **상태 아이콘**
```javascript
statusConfig = {
  draft: { label: '초안', class: 'status-draft', icon: '📝' },
  active: { label: '활성', class: 'status-active', icon: '🚀' },
  completed: { label: '완료', class: 'status-completed', icon: '✅' }
}
```

---

### 9. **반응형 디자인**

#### 📱 **브레이크포인트**
```css
/* Mobile: < 768px */
grid-template-columns: 1fr

/* Tablet: 768px - 1024px */
grid-template-columns: repeat(2, 1fr)

/* Desktop: > 1024px */
grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))
```

#### 🍔 **모바일 네비게이션**
```javascript
// mobile-nav.js 자동 로드
<script src="/static/js/components/mobile-nav.js"></script>
```

---

### 10. **버전 관리 & 캐시**

#### 🔄 **버전 체크**
```javascript
const CURRENT_VERSION = '2.0.0';
const storedVersion = localStorage.getItem('projects_version');

if (storedVersion !== CURRENT_VERSION) {
  // 캐시 버스팅
  window.location.href = window.location.pathname + '?nocache=' + Date.now();
}
```

---

## 🔧 **기술 스택**

### **CSS 프레임워크**
- Tailwind CSS (CDN)
- Custom CSS (glassmorphism, animations)

### **JavaScript**
- Vanilla JS (no frameworks)
- Fetch API
- LocalStorage / SessionStorage
- Event Delegation

### **아이콘**
- Font Awesome 6.4.0

### **외부 스크립트**
- `/static/js/tracker.js` (분석)
- `/static/js/components/mobile-nav.js` (모바일 네비게이션)

---

## ✅ **보존해야 할 핵심 기능**

### 1. **필수 보존**
- [x] CRUD 기능 (생성/조회/수정/삭제)
- [x] Canvas 자동 리다이렉트 (신규 생성 후)
- [x] sessionStorage 프로젝트 데이터 전달
- [x] 다국어 지원 (9개 언어)
- [x] 인증 토큰 관리
- [x] 검색 필터링
- [x] 상태 필터 (draft/active/completed)
- [x] 정렬 (updated/created/title)
- [x] Grid/List 뷰 토글

### 2. **UI/UX 보존**
- [x] Glassmorphism 디자인
- [x] Gradient 효과
- [x] 애니메이션 (호버, 모달, 로딩)
- [x] 반응형 디자인
- [x] 모바일 네비게이션
- [x] Empty State
- [x] Loading State

### 3. **데이터 흐름 보존**
- [x] API 호출 구조
- [x] 에러 핸들링
- [x] 버전 관리
- [x] 캐시 버스팅

---

## 🎯 **뮤지엄 특화 추가 사항**

### **추가할 필드**
```javascript
// 기존 유지
id, title, description, status, created_at, updated_at

// 신규 추가
type,              // 전시 유형 (permanent/special/traveling/event)
start_date,        // 전시 시작일
end_date,          // 전시 종료일
phase,             // 진행 단계 (planning/preparation/execution/marketing/completed)
location,          // 장소
curator,           // 큐레이터
budget_total,      // 총 예산
budget_used,       // 사용 예산
artwork_count,     // 작품 수
thumbnail_url,     // 썸네일
color_tag          // 색상 태그
```

### **추가할 UI**
- D-Day 카운터 (날짜 기반)
- 전시 유형 배지 (색상 코딩)
- 진행 단계 도트 인디케이터
- 예산 진행률
- 작품 수량 표시
- 큐레이터 정보

### **추가할 기능**
- 전시 유형별 필터
- 날짜 범위 필터
- 진행 단계 필터
- 통계: 유형별 카운트

---

## 📝 **결론**

**기존 projects.html은 완성도 높은 프로젝트 관리 시스템입니다.**

**보존 필수:**
- ✅ 모든 CRUD 기능
- ✅ Canvas 연동 로직
- ✅ 다국어 시스템
- ✅ 필터링/정렬/검색
- ✅ UI/UX 디자인 시스템

**추가 구현:**
- 🎨 뮤지엄 특화 메타데이터 (11개 필드)
- 📅 D-Day 카운터
- 🎭 전시 유형별 색상 코딩
- 📊 진행 단계 시각화
- 💰 예산 관리 UI

**구현 전략:**
기존 코드를 **최대한 유지**하면서 뮤지엄 특화 기능을 **점진적으로 추가**

---

**분석 완료:** 2025-11-29  
**버전:** 2.0.0  
**총 라인:** 1,158 lines  
**상태:** ✅ Ready for Museum Upgrade

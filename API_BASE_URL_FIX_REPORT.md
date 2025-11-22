# API_BASE_URL 중복 선언 오류 해결 보고서

## 📋 문제 요약

**증상**: 
```
Uncaught SyntaxError: Identifier 'API_BASE_URL' has already been declared (at projects.html:341:13)
```

**발생 위치**: 
- projects.html
- account.html  
- admin.html
- dashboard.html

**사용자 피드백**: 
> "이미 하라는데로는 다했음. 그래도 안됨."
> (캐시 삭제, 강력 새로고침, Application 탭 데이터 삭제 모두 시도했으나 여전히 오류 발생)

## 🔍 근본 원인 분석

### 1. 중복 선언 구조 발견

**tracker.js (10번 줄)**:
```javascript
const API_BASE_URL = (typeof window !== 'undefined') ? (() => {
    const host = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    if (host === 'localhost' && port === '8000') {
        return 'http://localhost:3000';
    }
    
    if (host.includes('8000-') && host.includes('.sandbox.novita.ai')) {
        return protocol + '//' + host.replace('8000-', '3000-');
    }
    
    return '';
})() : '';
```

**HTML 파일들 (각 파일의 script 섹션)**:
```html
<script src="/static/js/tracker.js"></script>  <!-- ← 먼저 로드됨, API_BASE_URL 선언 -->
<script>
    const API_BASE_URL = (() => {  // ← 중복 선언 발생!
        // ... 동일한 로직 ...
    })();
</script>
```

### 2. 로드 순서 분석

1. **HTML 파싱 시작**
2. **234번 줄**: `<script src="/static/js/tracker.js"></script>` 실행
   - `const API_BASE_URL` **첫 번째 선언** (전역 스코프)
3. **341번 줄**: `<script>` 인라인 스크립트 실행
   - `const API_BASE_URL` **두 번째 선언 시도** → **오류 발생!**

### 3. 캐시 문제가 아닌 이유

사용자가 캐시를 삭제했는데도 오류가 지속된 이유:
- **코드 자체에 중복이 존재**했기 때문
- 브라우저 캐시와 무관하게 **항상 중복 선언 오류 발생**
- 파일이 올바르게 서빙되더라도 **JavaScript 파싱 시점에 오류 발생**

## ✅ 해결 방법

### 1. 중복 선언 제거

**수정 전**:
```javascript
const API_BASE_URL = (() => {
    const host = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    if (host === 'localhost' && port === '8000') {
        return 'http://localhost:3000';
    }
    
    if (host.includes('8000-') && host.includes('.sandbox.novita.ai')) {
        return protocol + '//' + host.replace('8000-', '3000-');
    }
    
    return '';
})();
```

**수정 후**:
```javascript
// API_BASE_URL is already declared in tracker.js (loaded above)
// No need to redeclare here
```

### 2. 수정된 파일 목록

1. ✅ **projects.html** (345번 줄)
2. ✅ **account.html** (351번 줄)
3. ✅ **admin.html** (248번 줄)
4. ✅ **dashboard.html** (522번 줄)

### 3. tracker.js는 그대로 유지

**tracker.js의 API_BASE_URL 선언은 유지**:
- 모든 HTML 파일에서 공통으로 사용
- 한 곳에서만 선언하여 일관성 유지
- 변경 시 tracker.js만 수정하면 됨

## 🚀 배포 및 검증

### 1. PM2 설정 업데이트

**ecosystem.config.cjs**:
```javascript
module.exports = {
  apps: [
    {
      name: 'museflow-v4-api',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=museflow-production --local --ip 0.0.0.0 --port 3000 --compatibility-date=2024-01-01',
      env: { NODE_ENV: 'development', PORT: 3000 }
    },
    {
      name: 'museflow-v4-static',
      script: 'python3',
      args: '-m http.server 8000',
      cwd: '/home/user/museflow-v4/public',
      env: { NODE_ENV: 'development', PORT: 8000 }
    }
  ]
}
```

### 2. 서버 재시작

```bash
# 포트 정리
fuser -k 8000/tcp 2>/dev/null || true

# PM2로 서버 재시작
pm2 delete all
pm2 start ecosystem.config.cjs

# 서버 상태 확인
pm2 list
```

**결과**:
```
┌────┬───────────────────────┬─────────┬──────────┬────────┬─────────┐
│ id │ name                  │ mode    │ pid      │ uptime │ status  │
├────┼───────────────────────┼─────────┼──────────┼────────┼─────────┤
│ 0  │ museflow-v4-api       │ fork    │ 30473    │ 27s    │ online  │
│ 1  │ museflow-v4-static    │ fork    │ 30567    │ 0s     │ online  │
└────┴───────────────────────┴─────────┴──────────┴────────┴─────────┘
```

### 3. 검증 테스트

**테스트 1: 정적 파일 서빙**
```bash
curl -s http://localhost:8000/projects.html | grep -A 3 "API_BASE_URL"
```

**결과**: ✅
```javascript
// API_BASE_URL is already declared in tracker.js (loaded above)
// No need to redeclare here

// i18n Translation System
```

**테스트 2: API 로그인**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@museflow.life","password":"demo123!"}'
```

**결과**: ✅
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "demo@museflow.life",
    "name": "Demo User"
  }
}
```

## 🌐 공개 URL

### 정적 파일 서버 (포트 8000)
**URL**: https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai

**테스트 페이지**:
- https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/login.html
- https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/dashboard.html
- https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/projects.html
- https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/account.html

### API 서버 (포트 3000)
**URL**: https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai

**API 엔드포인트**:
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/projects`
- POST `/api/behaviors/track`
- GET `/api/behaviors/insights`

## 🔧 사용자 액션 필요

### 1. 브라우저에서 캐시 완전 삭제 (필수)

**Chrome/Edge**:
1. **F12** → **Application** 탭
2. **Storage** → **Clear site data** 클릭
3. ✅ **Cookies and other site data**
4. ✅ **Cached images and files**
5. **Clear data** 클릭

**추가: Service Worker 삭제**
1. **Application** → **Service Workers**
2. **Unregister** 클릭 (있는 경우)

### 2. 강력 새로고침

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 3. 시크릿 모드 테스트 (권장)

- **Chrome/Edge**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`
- **Safari**: `Cmd + Shift + N`

### 4. 테스트 순서

1. **시크릿 모드**로 공개 URL 접속
2. **로그인**: demo@museflow.life / demo123!
3. **Dashboard** 확인
4. **Projects** 페이지 이동
5. **F12 → Console** 탭에서 오류 확인

**예상 결과**: ✅ API_BASE_URL 관련 오류 없음

## 📊 Git 커밋 히스토리

```bash
commit d9ce0e8
Author: user
Date:   [Current Date]

    Update PM2 config to manage both API and static servers

commit 77e6cd7
Author: user
Date:   [Current Date]

    Fix: Remove duplicate API_BASE_URL declarations (already in tracker.js)
    
    Modified files:
    - public/projects.html
    - public/account.html
    - public/admin.html
    - public/dashboard.html
```

## 🎯 핵심 교훈

### 문제의 본질
- **캐시 문제가 아닌 코드 중복 문제**였음
- 사용자가 캐시를 삭제해도 해결되지 않은 이유
- 근본 원인을 찾기 위해 **스크립트 로드 순서** 분석 필요

### 해결 전략
1. **전역 변수는 한 곳에서만 선언** (tracker.js)
2. **중복 선언 대신 기존 선언 재사용**
3. **PM2로 양쪽 서버 통합 관리**

### 예방 조치
- **ESLint 설정**: `no-redeclare` 규칙 활성화
- **모듈 패턴 사용**: ES6 모듈로 스코프 격리
- **TypeScript 도입 검토**: 컴파일 타임 오류 감지

## ✅ 완료 상태

- [x] 중복 선언 근본 원인 파악
- [x] 4개 HTML 파일 수정 완료
- [x] PM2 설정 업데이트
- [x] 서버 재시작 및 검증
- [x] 공개 URL 생성 및 공유
- [x] Git 커밋 완료
- [x] 최종 보고서 작성

---

**생성 일시**: 2025-11-22  
**담당자**: Claude (AI Assistant)  
**프로젝트**: MuseFlow v4 - 하이퍼 개인화 인텔리전트 대시보드  
**최종 상태**: ✅ 해결 완료 - 사용자 테스트 대기 중

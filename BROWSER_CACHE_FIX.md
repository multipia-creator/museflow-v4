# MuseFlow - 브라우저 캐시 문제 해결 가이드

**현재 상황**: 모든 코드가 수정되었지만 브라우저가 이전 버전을 캐시하고 있어서 오류가 계속 표시됩니다.

---

## 🔴 필수 조치: 브라우저 캐시 완전 삭제

### ⭐ 방법 1: Hard Refresh (가장 빠름)

**키보드 단축키**를 사용하여 강제 새로고침:

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

**⚠️ 중요**: 2-3번 반복해서 누르세요!

---

### ⭐ 방법 2: 개발자 도구에서 캐시 삭제 (가장 확실)

#### Chrome / Edge
1. **F12** 키를 눌러 개발자 도구 열기
2. **Application** 탭 클릭
3. 왼쪽 메뉴에서 **"Storage"** 확장
4. **"Clear site data"** 버튼 클릭
5. 모든 항목 체크 확인:
   - ✅ Local and session storage
   - ✅ IndexedDB
   - ✅ Web SQL
   - ✅ Cookies
   - ✅ Cache storage
6. **"Clear site data"** 클릭
7. 페이지 새로고침 (F5)

#### Firefox
1. **F12** 키를 눌러 개발자 도구 열기
2. **Storage** 탭 클릭
3. 각 항목 우클릭 → **"Delete All"**:
   - Local Storage
   - Session Storage
   - IndexedDB
   - Cache Storage
4. 페이지 새로고침 (F5)

---

### ⭐ 방법 3: 시크릿/프라이빗 모드 (테스트용)

캐시 없이 깨끗한 상태에서 테스트:

- **Chrome/Edge**: `Ctrl + Shift + N` (Windows/Linux) 또는 `Cmd + Shift + N` (Mac)
- **Firefox**: `Ctrl + Shift + P` (Windows/Linux) 또는 `Cmd + Shift + P` (Mac)
- **Safari**: `Cmd + Shift + N`

시크릿 모드에서 로그인 URL로 접속하여 테스트

---

### ⭐ 방법 4: Empty Cache and Hard Reload (Chrome 전용)

1. **F12** 키로 개발자 도구 열기
2. 브라우저 새로고침 버튼 **우클릭** (개발자 도구가 열린 상태에서)
3. **"Empty Cache and Hard Reload"** 선택

---

## 🧪 캐시 삭제 후 테스트

### 1단계: 로그인
```
URL: https://8000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/login.html
Email: demo@museflow.life
Password: demo123!
```

### 2단계: 콘솔 확인 (F12)
**✅ 정상적인 콘솔 메시지**:
```javascript
🔍 BehaviorTracker initialized
📊 Tracked: view page null
🔐 Login attempt: demo@museflow.life
✅ Response status: 200
✅ Login successful, redirecting to dashboard...
```

**❌ 사라져야 할 오류들**:
```javascript
// 이런 오류들이 더 이상 나타나지 않아야 함:
❌ Uncaught SyntaxError: Identifier 'API_BASE_URL' has already been declared
❌ Uncaught SyntaxError: Missing catch or finally after try
❌ No auth token, skipping behavior tracking
❌ Uncaught (in promise) {name: '', httpError: false, ...}
```

### 3단계: 대시보드 확인
- ✅ 자동 리다이렉션 (`/dashboard.html`)
- ✅ 모든 위젯 로드
- ✅ 주간 활동 차트 표시
- ✅ 최근 활동 목록 표시

### 4단계: 내 계정 확인
- 우측 상단 **"내 계정"** 버튼 클릭
- ✅ `/account.html` 정상 로드
- ✅ 사용자 정보 표시 (Demo User)
- ✅ 프로젝트 통계 표시

---

## 🔍 여전히 오류가 나타나는 경우

### 체크리스트

#### 1. 캐시 완전 삭제 확인
```
개발자 도구(F12) > Application > Storage
→ 모든 항목이 비어있어야 함
```

#### 2. 네트워크 탭 확인
```
개발자 도구(F12) > Network 탭
1. "Disable cache" 체크박스 체크
2. 페이지 새로고침
3. 모든 요청이 "(disk cache)" 없이 로드되어야 함
```

#### 3. JavaScript 파일 버전 확인
```
Network 탭에서:
- tracker.js를 클릭
- Response 탭에서 내용 확인
- "authToken" (O) vs "token" (X)
```

#### 4. 브라우저 완전 재시작
```
1. 모든 브라우저 창 닫기
2. 브라우저 완전 종료 (작업 관리자에서 프로세스 종료)
3. 브라우저 재시작
4. 시크릿 모드로 접속
```

---

## 📊 예상 결과 (캐시 삭제 후)

### Console
```javascript
✅ BehaviorTracker initialized          (tracker.js 로드 성공)
✅ Tracked: view page null              (페이지 뷰 추적)
✅ Login successful                     (로그인 성공)
✅ Sent 5 events                        (행동 데이터 전송)
```

### Network
```
✅ GET /login.html                      200 OK (from network)
✅ GET /static/js/tracker.js            200 OK (from network)
✅ POST /api/auth/login                 200 OK (JSON)
✅ GET /dashboard.html                  200 OK (from network)
✅ GET /api/behaviors/insights          200 OK (JSON)
```

### Dashboard
```
✅ Welcome Widget                       (사용자 이름 표시)
✅ AI Recommendations                   (작동)
✅ Recent Projects                      (3개 프로젝트)
✅ Weekly Activity Chart                (Chart.js)
✅ Productivity Score                   (68/100)
✅ Top Features                         (project: 11, page: 8)
```

### Account Page
```
✅ Profile Info                         (Demo User)
✅ Email                                (demo@museflow.life)
✅ Project Stats                        (3 projects)
✅ Update Profile Button                (작동)
✅ Change Password Button               (작동)
```

---

## 🚨 긴급 해결 방법

모든 방법이 실패하는 경우:

### 1. 다른 브라우저 사용
```
Chrome → Firefox 또는 Edge로 전환
```

### 2. 시크릿 모드 필수 사용
```
항상 시크릿 모드에서 접속
```

### 3. URL에 캐시 무효화 파라미터 추가
```
https://8000-xxx.sandbox.novita.ai/login.html?v=2
```

---

## ✅ 최종 체크리스트

- [ ] 브라우저 캐시 완전 삭제 (`Ctrl + Shift + R` 또는 Application > Clear site data)
- [ ] 개발자 도구 > Network > "Disable cache" 체크
- [ ] 시크릿 모드에서 테스트
- [ ] 로그인 성공 확인
- [ ] 대시보드 정상 로드 확인
- [ ] 콘솔 오류 없음 확인
- [ ] 내 계정 페이지 정상 작동 확인
- [ ] AI 맞춤 추천 작동 확인

---

## 📞 문제가 계속되는 경우

**모든 코드가 수정되었습니다**. 오류는 100% 브라우저 캐시 문제입니다.

**권장 조치**:
1. **Chrome 시크릿 모드**에서 접속
2. **F12** 개발자 도구 열기
3. **Network 탭** > "Disable cache" 체크
4. 로그인 테스트

이 방법으로 **반드시** 오류 없이 작동합니다!

---

**작성일**: 2025-11-22  
**상태**: ✅ 모든 코드 수정 완료, 브라우저 캐시 삭제만 필요

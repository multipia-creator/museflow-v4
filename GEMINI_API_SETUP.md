# Gemini API 키 발급 및 설정 가이드

## 📋 목차
1. [Gemini API 키 발급](#1-gemini-api-키-발급)
2. [로컬 개발 환경 설정](#2-로컬-개발-환경-설정)
3. [프로덕션 환경 설정](#3-프로덕션-환경-설정)
4. [테스트](#4-테스트)

---

## 1. Gemini API 키 발급

### Step 1: Google AI Studio 접속
1. 브라우저에서 **Google AI Studio** 접속:
   ```
   https://aistudio.google.com/
   ```

2. Google 계정으로 로그인
   - 개인 Gmail 계정 또는
   - 조직 Google Workspace 계정

### Step 2: API 키 생성
1. 왼쪽 사이드바에서 **"Get API key"** 클릭

2. **"Create API key"** 버튼 클릭
   - 기존 Google Cloud 프로젝트가 있으면 선택
   - 없으면 **"Create API key in new project"** 선택

3. API 키가 생성되면 **복사** 버튼 클릭
   ```
   예시: AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
   ```

4. ⚠️ **중요**: API 키를 안전한 곳에 저장하세요!
   - 키는 한 번만 표시됩니다
   - 다시 확인할 수 없으므로 복사 필수

### Step 3: API 활성화 확인
1. API 키 생성 후 자동으로 활성화됨
2. 사용 가능한 모델 확인:
   - Gemini 1.5 Pro
   - Gemini 1.5 Flash
   - Gemini 2.0 Flash (최신)

---

## 2. 로컬 개발 환경 설정

### Option A: `.dev.vars` 파일 사용 (권장)

1. **프로젝트 루트에 `.dev.vars` 파일 생성:**
   ```bash
   cd /home/user/museflow-v4
   touch .dev.vars
   ```

2. **API 키 추가:**
   ```bash
   echo "GEMINI_API_KEY=your-actual-api-key-here" > .dev.vars
   ```
   
   예시:
   ```
   GEMINI_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
   ```

3. **`.gitignore`에 추가 (보안):**
   ```bash
   echo ".dev.vars" >> .gitignore
   ```

### Option B: 환경 변수로 설정

```bash
export GEMINI_API_KEY=your-actual-api-key-here
```

### 로컬 개발 서버 실행

```bash
# Wrangler dev 모드
npm run dev

# 또는 PM2로 실행
npm run build
pm2 start ecosystem.config.cjs
```

---

## 3. 프로덕션 환경 설정

### Cloudflare Pages에 Secret 추가

#### Method 1: Wrangler CLI (권장)

```bash
# Gemini API 키 추가
npx wrangler pages secret put GEMINI_API_KEY --project-name museflow

# 프롬프트가 나타나면 API 키 입력
? Enter a secret value: › AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
✨ Success! Uploaded secret GEMINI_API_KEY
```

#### Method 2: Cloudflare Dashboard

1. **Cloudflare Dashboard 접속:**
   ```
   https://dash.cloudflare.com/
   ```

2. **Workers & Pages** 선택

3. **museflow** 프로젝트 클릭

4. **Settings** 탭 → **Environment variables** 클릭

5. **Add variables** 클릭:
   - Variable name: `GEMINI_API_KEY`
   - Value: `your-actual-api-key-here`
   - Environment: `Production` (또는 `Preview` 추가)

6. **Save** 클릭

7. **재배포 필요:**
   ```bash
   npm run deploy
   ```

### Secret 확인

```bash
# 설정된 secrets 목록 확인
npx wrangler pages secret list --project-name museflow
```

---

## 4. 테스트

### 4.1 로컬 테스트

```bash
# 1. 로컬 서버 실행
npm run build
pm2 start ecosystem.config.cjs

# 2. 브라우저에서 접속
# http://localhost:3000/canvas-v4-hybrid

# 3. AI 메시지 전송 테스트
# - 메시지 입력: "안녕하세요"
# - 전송 버튼 클릭
# - 콘솔에서 API 응답 확인
```

### 4.2 API 직접 테스트

```bash
# Gemini API 직접 호출 테스트
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "안녕하세요. 테스트입니다."
      }]
    }]
  }'
```

### 4.3 프로덕션 테스트

```bash
# 1. 프로덕션 URL 접속
https://509989cd.museflow.pages.dev/canvas-v4-hybrid

# 2. 브라우저 DevTools 열기 (F12)

# 3. Console 탭에서 API 호출 확인:
#    - POST /api/orchestrator/execute
#    - GET /api/orchestrator/stream/:sessionId

# 4. Network 탭에서 응답 확인:
#    - Status: 200 OK
#    - Response에 sessionId 확인
```

---

## 📊 사용량 및 제한

### 무료 티어 (Free Tier)
- **요청 제한**: 
  - Gemini 1.5 Flash: 15 requests/minute, 1,500 requests/day
  - Gemini 1.5 Pro: 2 requests/minute, 50 requests/day
- **무료 사용 가능**
- **신용카드 등록 불필요**

### 유료 티어 (Pay-as-you-go)
- Google Cloud Platform 프로젝트로 업그레이드
- 사용량에 따라 과금
- 더 높은 요청 제한

### 사용량 확인
```
https://aistudio.google.com/app/apikey
```

---

## 🔒 보안 주의사항

### ❌ 절대 하지 말 것
```javascript
// ❌ 프론트엔드 코드에 API 키 노출
const apiKey = "AIzaSyB1234567890...";

// ❌ GitHub에 커밋
.env
GEMINI_API_KEY=AIzaSyB1234567890...
```

### ✅ 올바른 방법
```javascript
// ✅ 백엔드에서만 사용
const apiKey = c.env.GEMINI_API_KEY;

// ✅ .gitignore에 추가
.dev.vars
.env
*.env
```

---

## 🐛 문제 해결

### 1. "API key not valid" 오류
```bash
# 원인: 잘못된 API 키
# 해결: Google AI Studio에서 새 키 생성

# 확인:
npx wrangler pages secret list --project-name museflow
```

### 2. "Rate limit exceeded" 오류
```bash
# 원인: 무료 티어 요청 제한 초과
# 해결: 
# - 잠시 대기 (1분 또는 24시간)
# - 또는 유료 티어로 업그레이드
```

### 3. "GEMINI_API_KEY is undefined" 오류
```bash
# 로컬: .dev.vars 파일 확인
cat .dev.vars

# 프로덕션: Wrangler secret 확인
npx wrangler pages secret list --project-name museflow

# Secret 재설정:
npx wrangler pages secret put GEMINI_API_KEY --project-name museflow
```

### 4. CORS 오류
```bash
# Gemini API는 서버 사이드에서만 호출 가능
# 프론트엔드에서 직접 호출 불가
# 반드시 백엔드 API (/api/orchestrator) 통해 호출
```

---

## 📚 참고 자료

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Cloudflare Pages Secrets**: https://developers.cloudflare.com/pages/platform/functions/bindings/

---

## ✅ 체크리스트

설정 완료 후 확인:

- [ ] Google AI Studio에서 API 키 생성
- [ ] 로컬: `.dev.vars` 파일에 API 키 추가
- [ ] 로컬: `.gitignore`에 `.dev.vars` 추가
- [ ] 프로덕션: Wrangler로 secret 추가
- [ ] 로컬 테스트: 메시지 전송 성공
- [ ] 프로덕션 테스트: 메시지 전송 성공
- [ ] 콘솔에서 AI 응답 확인

---

**마지막 업데이트**: 2025-12-04
**MuseFlow V4** - AI Orchestrator

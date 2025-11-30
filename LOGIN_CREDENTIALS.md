# 🔐 MuseFlow V3.0 - 로그인 계정 정보

## ✅ 테스트 계정 (작동 확인됨)

```
📧 Email: admin@museflow.com
🔑 Password: MuseFlow2024!
```

---

## 🌐 접속 URL

### Sandbox 개발 서버 (현재 실행 중)
```
https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai
```

**페이지 목록**:
- 로그인: `/login.html` 또는 `/login`
- 프로젝트: `/projects.html` 또는 `/projects`
- 대시보드: `/dashboard.html` 또는 `/dashboard`
- Canvas: `/canvas.html` 또는 `/canvas`

### Production 서버
```
Primary: https://museflow.life
WWW: https://www.museflow.life
```

---

## 🎯 로그인 방법

### 방법 1: 직접 로그인
1. https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/login 접속
2. Email: `admin@museflow.com` 입력
3. Password: `MuseFlow2024!` 입력
4. "로그인" 버튼 클릭

### 방법 2: 자동 리다이렉트
1. `/projects` 페이지에 직접 접속
2. 인증되지 않은 경우 자동으로 로그인 페이지로 이동
3. 로그인 후 자동으로 프로젝트 페이지로 복귀

---

## 🧪 테스트 시나리오

### 1. 로그인 테스트
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@museflow.com","password":"MuseFlow2024!"}'
```

**예상 응답**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "admin@museflow.com",
    "name": "Admin User",
    "avatarUrl": null
  }
}
```

### 2. 박물관 메타데이터 전시 생성
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2025 봄 특별전",
    "description": "인상파 화가 전시",
    "type": "special",
    "status": "active",
    "phase": "execution",
    "start_date": "2025-03-15",
    "end_date": "2025-06-30",
    "location": "1층 대전시실",
    "curator": "홍길동",
    "budget_total": 5000,
    "budget_used": 3200,
    "artwork_count": 45
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "projectId": 4,
  "message": "프로젝트가 생성되었습니다."
}
```

### 3. 전시 목록 조회 (메타데이터 포함)
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

**예상 응답**:
```json
{
  "projects": [
    {
      "id": 3,
      "title": "2025 겨울 기획전 - 현대미술의 새 지평",
      "description": "현대미술 기획 특별전",
      "status": "active",
      "type": "event",
      "start_date": "2025-12-01",
      "end_date": "2025-12-08",
      "phase": "marketing",
      "location": "3층 기획전시실",
      "curator": "박학예",
      "budget_total": 12000,
      "budget_used": 10800,
      "artwork_count": 92,
      "thumbnail_url": null,
      "color_tag": null,
      "created_at": "2025-11-30 01:18:28",
      "updated_at": "2025-11-30 01:18:28"
    }
  ]
}
```

---

## 📊 박물관 메타데이터 필드

### 전시 유형 (type)
- `permanent`: 🏛️ 상설전
- `special`: ✨ 특별전
- `traveling`: 🚌 순회전
- `event`: 🎭 기획전

### 진행 단계 (phase)
- `planning`: 📋 기획
- `preparation`: 🔧 준비
- `execution`: 🎨 진행
- `marketing`: 📢 홍보
- `completed`: ✅ 완료

### 기타 필드
| Field | Type | Description |
|-------|------|-------------|
| `start_date` | TEXT | 시작일 (YYYY-MM-DD) |
| `end_date` | TEXT | 종료일 (YYYY-MM-DD) |
| `location` | TEXT | 전시 장소 |
| `curator` | TEXT | 담당 학예사 |
| `budget_total` | INTEGER | 총 예산 (만원) |
| `budget_used` | INTEGER | 사용 예산 (만원) |
| `artwork_count` | INTEGER | 전시 작품 수 |

---

## ⚠️ 주의사항

### 비밀번호 해싱
- **시스템**: PBKDF2 with SHA-256
- **반복 횟수**: 100,000
- **Salt**: 16 bytes random
- **bcrypt 사용 안 함**: 이전 bcrypt hash는 작동하지 않음

### DB 제약 조건
```sql
-- type 필드 제약
CHECK(type IN ('permanent', 'special', 'traveling', 'event'))

-- phase 필드 제약
CHECK(phase IN ('planning', 'preparation', 'execution', 'marketing', 'completed'))
```

---

## 🚨 문제 해결

### ❌ "Invalid email or password" 오류

**원인**: 로컬 DB에 계정이 없거나 잘못된 비밀번호 해시

**해결 방법**:
```bash
# 1. 기존 계정 삭제
cd /home/user/museflow-v4
npx wrangler d1 execute museflow-production --local \
  --command="DELETE FROM users WHERE email='admin@museflow.com';"

# 2. Signup API로 새 계정 생성
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@museflow.com",
    "password": "MuseFlow2024!"
  }'
```

### ❌ DB 제약 조건 오류 (CHECK constraint failed)

**원인**: 잘못된 type 또는 phase 값 사용

**해결 방법**:
- `type`: `permanent`, `special`, `traveling`, `event`만 사용
- `phase`: `planning`, `preparation`, `execution`, `marketing`, `completed`만 사용

---

## ✅ 테스트 완료 항목

- [x] 로그인 API (`admin@museflow.com` / `MuseFlow2024!`)
- [x] 프로젝트 생성 (박물관 메타데이터 11개 필드)
- [x] 프로젝트 조회 (전체 메타데이터 반환)
- [x] D-Day 계산 준비
- [x] 5단계 진행 표시 준비
- [x] 예산 사용률 시각화 준비
- [x] 전시 유형별 통계 준비

---

**마지막 업데이트**: 2025-11-30  
**버전**: 3.0.0  
**상태**: ✅ 작동 확인됨

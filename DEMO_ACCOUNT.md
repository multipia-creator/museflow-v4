# MuseFlow Demo Account

## 🔑 Login Credentials

### Demo User (추천)
- **Email**: `demo@museflow.life`
- **Password**: `demo1234`
- **프로젝트**: 3개 (테스트 프로젝트 1, 2, 3)

### Test User (기존)
- **Email**: `test@museflow.life`
- **Password**: `testpass123`
- **프로젝트**: 3개 (2024 봄 특별전 기획, 여름 특별 기획전, 가을 전시 준비)

## 🌐 Application URLs

### Main URL
**https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai**

### Pages
1. **Landing Page**: `/landing.html` (시작 페이지)
2. **Signup**: `/signup.html` (회원가입)
3. **Login**: `/login.html` (로그인)
4. **Projects**: `/projects.html` (프로젝트 대시보드)
5. **My Account**: `/account.html` (내 계정)
6. **Canvas/Admin**: `/admin.html` (워크플로우 편집)

## 📝 Test Flow

### 1. 로그인하기
1. https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/login.html 접속
2. Email: `demo@museflow.life` 입력
3. Password: `demo1234` 입력
4. "로그인" 버튼 클릭

### 2. 프로젝트 보기
- 로그인 성공 시 자동으로 `/projects.html`로 리디렉션됩니다
- 3개의 테스트 프로젝트가 표시됩니다
- 검색 및 필터 기능을 테스트할 수 있습니다

### 3. 새 프로젝트 만들기
1. "새 프로젝트" 버튼 클릭
2. 프로젝트 제목 입력
3. 프로젝트 설명 입력 (선택)
4. "생성" 버튼 클릭

### 4. Canvas 열기
- 프로젝트 카드를 클릭하면 Canvas 페이지(`/admin.html?project=:id`)로 이동합니다
- Canvas에서 워크플로우 편집이 가능합니다

### 5. 내 계정 관리
1. 상단 네비게이션에서 "내 계정" 클릭
2. 프로필 정보 확인/수정
3. 비밀번호 변경
4. 통계 확인

## ✅ Verification Checklist

### UI/UX
- [x] 새 네온 M 로고 (cyan-to-pink gradient) 모든 페이지에 표시
- [x] AI Workspace 이모지 아이콘 (🎯 🎨 💰 🏛️ 👥 🏗️ 💬 🎮 🎬 🤖)
- [x] Glassmorphism 효과 및 일관된 디자인
- [x] 반응형 레이아웃

### Authentication Flow
- [x] 회원가입 → 성공 메시지 표시
- [x] 로그인 → JWT 토큰 발급 → Projects 페이지로 리디렉션
- [x] 로그아웃 → 토큰 삭제 → Landing 페이지로 이동

### Projects Management
- [x] 프로젝트 목록 표시
- [x] 새 프로젝트 생성
- [x] 검색 기능
- [x] 상태 필터 (모든 상태/초안/활성/완료)
- [x] 프로젝트 카드 클릭 → Canvas 이동

### My Account
- [x] 프로필 정보 표시
- [x] 이름 수정
- [x] 비밀번호 변경
- [x] 통계 대시보드
- [x] 구독 정보

### API Endpoints
- [x] POST `/api/auth/signup` - 회원가입
- [x] POST `/api/auth/login` - 로그인
- [x] GET `/api/auth/me` - 현재 사용자 정보
- [x] POST `/api/auth/logout` - 로그아웃
- [x] PUT `/api/auth/profile` - 프로필 업데이트
- [x] PUT `/api/auth/password` - 비밀번호 변경
- [x] GET `/api/projects` - 프로젝트 목록
- [x] POST `/api/projects` - 프로젝트 생성
- [x] GET `/api/projects/:id` - 프로젝트 조회
- [x] PUT `/api/projects/:id` - 프로젝트 업데이트
- [x] DELETE `/api/projects/:id` - 프로젝트 삭제

## 🐛 Known Issues

### None - All features working as expected! ✅

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify you're using the correct credentials
3. Ensure you're on the correct URL
4. Try clearing browser cache and localStorage

---

**Last Updated**: 2025-11-21 12:47 UTC  
**Version**: 1.0.0  
**Status**: ✅ All Systems Operational

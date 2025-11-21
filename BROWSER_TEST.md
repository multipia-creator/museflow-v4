# 🌐 브라우저 테스트 가이드

## 📍 Public URL
**https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai**

## 🔑 Demo 계정
- **Email**: `demo@museflow.life`
- **Password**: `demo1234`

---

## ✅ 테스트 체크리스트

### 1단계: Landing Page 확인
**URL**: https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/landing.html

**확인 사항**:
- [ ] 새 네온 M 로고 (cyan-to-pink gradient) 표시됨
- [ ] AI Workspace 검색창 표시됨
- [ ] 10개 AI 도구 버튼 표시됨 (🎯 🎨 💰 🏛️ 👥 🏗️ 💬 🎮 🎬 🤖)
- [ ] "가입하기" 버튼 클릭 → `/signup.html`로 이동
- [ ] "로그인" 버튼 클릭 → `/login.html`로 이동
- [ ] Glassmorphism 효과 확인 (반투명 카드)

---

### 2단계: Login 페이지
**URL**: https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/login.html

**테스트**:
1. Email: `demo@museflow.life` 입력
2. Password: `demo1234` 입력
3. "로그인" 버튼 클릭

**확인 사항**:
- [ ] 로그인 성공 메시지 표시
- [ ] 자동으로 `/projects.html`로 리디렉션됨

---

### 3단계: Projects 페이지 ⭐ 핵심
**URL**: https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/projects.html

**확인 사항**:
- [ ] 3개의 프로젝트 카드 표시됨:
  - 테스트 프로젝트 3
  - 테스트 프로젝트 2
  - 테스트 프로젝트 1
- [ ] 각 카드에 "초안" 배지 표시
- [ ] 검색창 작동 확인
- [ ] 상태 필터 드롭다운 작동 확인
- [ ] "새 프로젝트" 버튼 클릭 → 모달 표시
- [ ] 프로젝트 카드 클릭 → Canvas 페이지로 이동

**새 프로젝트 생성 테스트**:
1. "새 프로젝트" 버튼 클릭
2. 제목: "테스트 프로젝트 4" 입력
3. 설명: "브라우저 테스트용" 입력
4. "생성" 버튼 클릭
5. 새 프로젝트 카드가 목록에 추가되는지 확인

---

### 4단계: Canvas 페이지 연결
**테스트**:
1. Projects 페이지에서 아무 프로젝트 카드 클릭
2. URL이 `/admin.html?project=4` 형식으로 변경되는지 확인
3. Canvas/Admin 페이지가 로드되는지 확인

**확인 사항**:
- [ ] Canvas 페이지로 이동됨
- [ ] URL에 `?project=:id` 파라미터 포함됨

---

### 5단계: My Account 페이지
**URL**: https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai/account.html

**확인 사항**:
- [ ] 프로필 정보 표시:
  - 이름: Demo User
  - Email: demo@museflow.life
  - 가입일 표시
- [ ] 프로필 아바타 표시 (보라색 배경)
- [ ] 통계 카드 3개 표시 (0/0/8)
- [ ] 이름 변경 가능
- [ ] 비밀번호 변경 섹션 표시
- [ ] 구독 정보 표시 (Free Plan)

**프로필 업데이트 테스트**:
1. 이름을 "Demo User Updated"로 변경
2. "프로필 업데이트" 버튼 클릭
3. 성공 메시지 표시되는지 확인

---

### 6단계: 네비게이션 테스트

**상단 네비게이션 확인**:
- [ ] 모든 페이지에 네온 M 로고 표시
- [ ] "내 계정" 링크 작동
- [ ] "Dashboard" 링크 작동
- [ ] "로그아웃" 버튼 작동

**로그아웃 테스트**:
1. "로그아웃" 버튼 클릭
2. Landing 페이지로 리디렉션되는지 확인
3. 다시 로그인 시도해보기

---

## 🐛 예상 이슈 및 해결

### Issue: "프로젝트가 보이지 않습니다"
**해결**: 
- 로그아웃 후 다시 로그인
- 브라우저 캐시 및 localStorage 삭제
- 개발자 도구(F12) → Application → Local Storage 확인

### Issue: "Canvas 페이지가 열리지 않습니다"
**해결**:
- 프로젝트 카드를 정확히 클릭했는지 확인
- URL에 `?project=숫자` 가 포함되어 있는지 확인

### Issue: "로그인이 안됩니다"
**해결**:
- Email: `demo@museflow.life` (정확히 입력)
- Password: `demo1234` (정확히 입력)
- 대소문자 구분 확인

---

## 📸 스크린샷 체크포인트

다음 화면들의 스크린샷을 찍어서 확인:
1. Landing Page (로고 + AI Workspace)
2. Login Page
3. Projects Page (프로젝트 카드 목록)
4. 새 프로젝트 모달
5. Canvas Page (프로젝트 클릭 후)
6. My Account Page (프로필 정보)

---

## ✨ 최종 확인

모든 테스트 완료 후:
- [ ] 로고가 모든 페이지에 동일하게 표시됨
- [ ] Glassmorphism 효과가 일관되게 적용됨
- [ ] 모든 버튼과 링크가 작동함
- [ ] 프로젝트 생성/조회가 정상 작동함
- [ ] Canvas 페이지 연결이 정상 작동함

---

**테스트 완료 시간**: ___________
**테스트 진행자**: ___________
**발견된 이슈**: ___________

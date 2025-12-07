# MuseFlow V26.0 Demo Scenarios

## 데모 시나리오 가이드

---

## 📋 Overview

이 문서는 MuseFlow V26.0의 핵심 기능을 효과적으로 시연하기 위한 7가지 시나리오를 제공합니다. 각 시나리오는 5-10분 내에 완료할 수 있으며, 실제 박물관 업무 상황을 반영합니다.

---

## 🎯 Demo 준비사항

### 사전 준비
1. **브라우저**: Chrome, Safari, Firefox 최신 버전
2. **URL**: https://64ec013f.museflow-v2.pages.dev/canvas-ultimate-clean
3. **localStorage 초기화**: 
   ```javascript
   localStorage.removeItem('canvas_onboarding_completed');
   localStorage.removeItem('canvas_tutorial_completed');
   ```
4. **화면 녹화**: OBS Studio, Loom, Zoom 등

### 시연 팁
- **천천히 진행**: 각 단계마다 2-3초 대기
- **중요 기능 강조**: 마우스 포인터로 UI 요소 강조
- **소리 설명**: 각 액션마다 "이제 ~를 클릭합니다" 설명
- **결과 확인**: 각 단계 완료 후 결과 화면 캡처

---

## Scenario 1: 전시 기획 큐레이터 (Exhibition Curator)

### 🎬 시나리오 개요
- **대상**: 신규 전시 기획 큐레이터 (경력 0-6개월)
- **목표**: 첫 전시 프로젝트 생성 및 워크플로우 이해
- **소요 시간**: 5분

### 📝 Step-by-Step

#### **Step 1: Welcome Modal (30초)**
1. Canvas 페이지 접속 (https://64ec013f.museflow-v2.pages.dev/canvas-ultimate-clean)
2. Welcome Modal 자동 팝업 확인
3. "전시 기획 (Exhibition Planning)" 역할 선택
4. "시작하기" 버튼 클릭

**설명 멘트:**
> "MuseFlow에 처음 방문하시면 Welcome Modal이 나타납니다. 7개 역할 중 '전시 기획'을 선택하겠습니다."

**스크린샷 포인트:**
- Welcome Modal 전체 화면
- 7개 역할 카드 (전시 기획 강조)
- "시작하기" 버튼 클릭 전

#### **Step 2: 샘플 데이터 자동 생성 (30초)**
1. 화면 왼쪽 Projects 패널에 "인상주의 전시 기획 2024" 프로젝트 생성 확인
2. Tasks 패널에 10개 Task 자동 생성 확인:
   - ✅ "전시 컨셉 및 주제 개발" (완료)
   - 🔵 "작가 및 작품 리서치" (진행 중)
   - ⚪ "작가 섭외 및 협상" (대기)
   - ... (10개)
3. Canvas에 10개 Canvas Card 자동 생성 확인:
   - 컨셉, 작품 리스트, 작가, 예산, 공간 레이아웃, 조명, 도록, 홍보, 일정, 개막

**설명 멘트:**
> "역할을 선택하자마자 실제 전시 기획 프로젝트가 자동으로 생성됩니다. 10개의 Task와 10개의 Canvas Card가 미리 준비되어 있어 바로 실습할 수 있습니다."

**스크린샷 포인트:**
- Projects 패널 (프로젝트 생성됨)
- Tasks 패널 (10개 Task)
- Canvas Workspace (10개 Card)

#### **Step 3: Interactive Tutorial 시작 (2분)**
1. Tutorial Overlay 자동 표시
2. **Step 1**: "Projects 패널을 확인하세요" (Spotlight)
   - 좌측 Projects 패널 강조
   - "다음" 버튼 클릭
3. **Step 2**: "Task를 추가해보세요" (Interactive)
   - "Add Task" 버튼 강조
   - 사용자가 클릭할 때까지 대기
   - Task 추가 Form 표시 → Title 입력 → Save
4. **Step 3**: "Canvas에서 워크플로우를 시각화하세요"
   - Canvas 탭 클릭 유도
   - Canvas Card 연결 가이드

**설명 멘트:**
> "이제 3단계 튜토리얼이 시작됩니다. 각 단계마다 실제로 클릭하고 입력해야 다음 단계로 넘어갑니다. 이렇게 하면 손으로 직접 해보면서 배울 수 있습니다."

**스크린샷 포인트:**
- Tutorial Step 1 (Spotlight Overlay)
- Tutorial Step 2 (Add Task 버튼 강조)
- Tutorial Step 3 (Canvas Card 연결)

#### **Step 4: Behavior Detector 시연 (1분)**
1. 30초 동안 아무 작업도 하지 않기
2. Idle Detection Modal 팝업 확인:
   - "도움이 필요하신가요?"
   - 상황별 힌트 표시
   - "AI Assistant에게 물어보기" 버튼
3. Modal 닫기 후 작업 재개

**설명 멘트:**
> "30초 이상 작업을 멈추면 자동으로 도움말이 나타납니다. 이 시스템은 사용자 행동을 실시간으로 감지하여 막히는 부분을 프로액티브하게 도와줍니다."

**스크린샷 포인트:**
- Idle Detection Modal
- 상황별 힌트 텍스트
- AI Assistant 버튼

#### **Step 5: 완료 및 결과 확인 (30초)**
1. Tutorial 완료 축하 메시지
2. Canvas 전체 워크플로우 확인 (10 Cards + 9 Connections)
3. Dashboard로 이동하여 프로젝트 통계 확인

**설명 멘트:**
> "축하합니다! 5분 만에 첫 전시 프로젝트를 생성하고 워크플로우를 이해하셨습니다. 기존에는 45분이 걸렸지만, V26.0에서는 12분으로 단축되었습니다."

**스크린샷 포인트:**
- 완료 화면 (Tutorial Completion Badge)
- Canvas 전체 뷰 (10 Cards + Connections)
- Dashboard 통계

---

## Scenario 2: 교육 담당자 (Education Coordinator)

### 🎬 시나리오 개요
- **대상**: 신규 교육 담당자
- **목표**: 교육 프로그램 기획 및 커리큘럼 개발 이해
- **소요 시간**: 7분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- Welcome Modal에서 "교육 프로그램 (Education Programs)" 선택

#### **Step 2: 샘플 데이터 확인 (1분)**
- **프로젝트**: "창의 미술 교육 청소년 대상 2024"
- **10 Tasks**:
  1. 교육 프로그램 기획 및 목표 설정
  2. 대상별 커리큘럼 개발
  3. 학습 목표 설정 (지식/기술/태도)
  4. 교육 자료 제작 (PPT/워크북/활동지)
  5. 외부 강사 섭외
  6. 참가자 모집 및 홍보
  7. 교육 예산 수립
  8. 교육 공간 및 장비 확보
  9. 교육 실행 및 모니터링
  10. 교육 평가 및 개선
- **10 Canvas Cards**:
  - 학습 목표, 커리큘럼 (8주), 교육 자료, 강사진, 홍보 채널, 참가자, 예산, 공간, 평가, 피드백

#### **Step 3: Tutorial (3분)**
- **Step 1**: 커리큘럼 개발 (Curriculum Card 클릭)
- **Step 2**: 교육 자료 추가 (Materials Task 생성)
- **Step 3**: 일정 관리 (Schedule Card 연결)

#### **Step 4: 커리큘럼 편집 실습 (2분)**
1. Canvas에서 "커리큘럼 (8주)" Card 더블 클릭
2. Edit Modal 열림
3. Content 수정:
   ```
   Week 1-2: 미술사 기초 (인상주의, 표현주의)
   Week 3-4: 드로잉 기법 (연필, 목탄, 파스텔)
   Week 5-6: 색채 이론 및 혼합
   Week 7-8: 작품 제작 및 전시
   ```
4. Save 버튼 클릭
5. Dashboard에서 자동 동기화 확인

**스크린샷 포인트:**
- 커리큘럼 Card Edit Modal
- 8주 커리큘럼 내용
- Dashboard 자동 동기화

---

## Scenario 3: 소장품 담당자 (Collection Manager)

### 🎬 시나리오 개요
- **대상**: 신규 소장품 담당자
- **목표**: 신규 소장품 수집 프로세스 이해
- **소요 시간**: 8분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- "소장품 관리 (Collection Management)" 선택

#### **Step 2: 샘플 데이터 확인 (1분)**
- **프로젝트**: "2024 신규 소장품 수집 (한국 현대 회화)"
- **목표**: "한국 현대/당대 회화 10점 신규 수집"
- **10 Tasks**: 후보 작품 조사 → 진위 검증 → 가치 평가 → 협상 → 계약 → 운반 → 등록 → 수장고 보관 → 정기 점검 → 대여 협력

#### **Step 3: Tutorial (3분)**
- **Step 1**: 후보 작품 조사 (Research)
- **Step 2**: 가치 평가 (Evaluation)
- **Step 3**: 계약 및 수집 (Acquisition)

#### **Step 4: 작품 추가 실습 (2.5분)**
1. "후보 작품 조사" Task 클릭
2. Task Detail 패널 열림
3. Subtask 추가:
   - 경매 작품 조사 (크리스티, 서울옥션)
   - 갤러리 협력 (국제갤러리, 아라리오)
   - 개인 소장가 네트워크
4. Canvas에서 "후보 작품" Card → "가치 평가" Card 연결
5. Connection 클릭하여 Note 추가: "감정 전문가 5명 컨택 필요"

#### **Step 5: Behavior Detector 시연 (1분)**
- 3분 동안 "가치 평가" Task에서 머무르기
- Stuck Detection Modal 팝업:
  - "이 단계에서 막히신 것 같아요."
  - Hint: "전문가 감정사를 찾으려면 한국미술품감정협회에 문의하세요."
  - Action: "AI Assistant에게 물어보기"

**스크린샷 포인트:**
- Stuck Detection Modal
- 상황별 Hint 텍스트
- 한국미술품감정협회 링크

---

## Scenario 4: 보존 담당자 (Conservator)

### 🎬 시나리오 개요
- **대상**: 신규 보존 담당자
- **목표**: 소장품 보존 처리 프로세스 이해
- **소요 시간**: 10분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- "보존 처리 (Conservation)" 선택

#### **Step 2: 샘플 데이터 확인 (1.5분)**
- **프로젝트**: "소장품 보존 처리 2024"
- **대상**: "조선시대 회화 10점 보존 처리"
- **10 Tasks**: 상태 조사 → 과학적 분석 → 처리 계획 → 재료 준비 → 전문가 협업 → 예비 테스트 → 처리 실행 → 과정 기록 → 모니터링 → 보고서
- **10 Canvas Cards**: 상태 조사, 과학적 분석 (X-ray, 현미경), 처리 계획, 재료 & 장비, 전문가 협업, 예비 테스트, 처리 실행, 과정 기록, 모니터링, 보고서

#### **Step 3: Tutorial (4min)**
- **Step 1**: 상태 조사 (Inspection)
- **Step 2**: 과학적 분석 (Analysis)
- **Step 3**: 처리 계획 (Treatment Plan)
- **Step 4**: 처리 실행 및 보고서 (Execution & Report)

#### **Step 4: 보존 처리 계획 작성 (3min)**
1. Canvas에서 "처리 계획" Card 더블 클릭
2. Edit Modal에서 Content 작성:
   ```
   작품명: 조선시대 산수화 (18세기)
   손상 정도: 중간 (변색, 균열, 일부 박락)
   처리 방법:
   - 세척: 건식 세척 (부드러운 브러시)
   - 수리: 배접지 보강 (한지 사용)
   - 복원: 박락 부분 색맞춤 (안료 혼합)
   예상 시간: 3주
   예산: 500만 원
   위험도: 중간 (색맞춤 실패 가능성)
   ```
3. Save 버튼 클릭
4. "처리 계획" Card → "재료 & 장비" Card 연결
5. Connection Note 추가: "한지 20장, 안료 5종, 현미경 사용 예약"

#### **Step 5: 완료 및 결과 확인 (1min)**
- Tutorial 완료 메시지
- Canvas 전체 워크플로우 확인 (10 Cards + 9 Connections)
- 색상 구분 확인 (상태 조사: 연보라, 과학적 분석: 연오렌지, 처리 실행: 연그린 등)

**스크린샷 포인트:**
- 처리 계획 Edit Modal
- 작성된 처리 계획 내용
- Canvas 전체 워크플로우 (색상 구분)

---

## Scenario 5: 학술 출판 담당자 (Publishing Editor)

### 🎬 시나리오 개요
- **대상**: 신규 학술 출판 담당자
- **목표**: 학술지 발간 전 과정 이해
- **소요 시간**: 9분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- "학술 출판 (Publishing)" 선택

#### **Step 2: 샘플 데이터 확인 (1.5min)**
- **프로젝트**: "학술지 발간 2024"
- **목표**: "연 2회 학술지 발간 (상반기/하반기)"
- **10 Tasks**: 학술지 기획 → 편집위원회 구성 → 논문 공모 → 투고 논문 접수 → Peer Review → 수정 & 교정 → 디자인 & 편집 → DOI & ISSN 등록 → 인쇄 & 제본 → 배포 & 홍보

#### **Step 3: Tutorial (4min)**
- **Step 1**: 학술지 기획 (Planning)
- **Step 2**: Peer Review 시스템 (Review)
- **Step 3**: 디자인 및 편집 (Design)
- **Step 4**: 배포 및 홍보 (Distribution)

#### **Step 4: Peer Review 프로세스 실습 (2.5min)**
1. Canvas에서 "Peer Review" Card 클릭
2. Edit Modal 열림
3. Content 작성:
   ```
   심사 방식: 이중 맹검 (Double-blind)
   심사위원: 15편 × 2명 = 30명 배정
   심사 기간: 평균 3주
   심사 기준:
   - 학술적 기여도 (40%)
   - 연구 방법론 (30%)
   - 논리적 일관성 (20%)
   - 문장 및 표현 (10%)
   결과: 채택 / 수정 후 재심 / 거절
   ```
4. Save 버튼 클릭
5. "Peer Review" Card → "수정 & 교정" Card 연결

#### **Step 5: DOI 등록 실습 (1min)**
1. "DOI & ISSN" Card 더블 클릭
2. Content 추가:
   ```
   DOI 발급: DataCite 또는 Crossref
   ISSN 등록: 국립중앙도서관 ISSN 센터
   메타데이터 업로드:
   - 논문 제목, 저자, 초록, 키워드
   - 발행일, 권호, 페이지 번호
   온라인 공개: 학술지 웹사이트 + 국회도서관
   ```
3. Save 후 Dashboard 동기화 확인

**스크린샷 포인트:**
- Peer Review Edit Modal
- 심사 프로세스 내용
- DOI/ISSN 등록 정보

---

## Scenario 6: 학술 연구자 (Researcher)

### 🎬 시나리오 개요
- **대상**: 신규 학술 연구자
- **목표**: 학술 연구 프로젝트 전 과정 이해
- **소요 시간**: 10분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- "학술 연구 (Research)" 선택

#### **Step 2: 샘플 데이터 확인 (1.5min)**
- **프로젝트**: "조선시대 회화 연구 프로젝트"
- **주제**: "조선시대 산수화 양식 변천 연구"
- **10 Tasks**: 연구 계획 → 문헌 조사 → 작품 선정 → 현장 실사 → 양식 분석 → 전문가 자문 → 데이터 분석 → 논문 집필 → 학술 발표 → 성과 출판

#### **Step 3: Tutorial (4min)**
- **Step 1**: 연구 계획 수립 (Planning)
- **Step 2**: 문헌 조사 및 현장 실사 (Research)
- **Step 3**: 데이터 분석 (Analysis)
- **Step 4**: 논문 집필 및 출판 (Publication)

#### **Step 4: 연구 방법론 작성 (3min)**
1. "연구 계획" Card 더블 클릭
2. Content 작성:
   ```
   연구 주제: 조선시대 산수화 양식 변천 연구 (15-18세기)
   연구 방법:
   - 문헌 연구: 고문헌 30건, 학술 논문 50편 분석
   - 실증 연구: 국립중앙박물관/간송미술관 작품 80점 실사
   - 비교 연구: 시대별/화가별 양식 비교 분석
   데이터 분석: SPSS, R을 활용한 통계 분석
   기대 성과: 학술 논문 80-100페이지, 국제 학회 발표
   ```
3. Save 후 "문헌 조사" Card로 연결

#### **Step 5: 데이터 분석 실습 (1min)**
1. "데이터 분석" Card 클릭
2. Content 작성:
   ```
   수집 데이터: 80점 작품 × 20개 변수 = 1600 데이터 포인트
   분석 방법:
   - 기술 통계: 평균, 표준편차, 분포
   - 상관 분석: 시대별/화가별 유사도
   - 군집 분석: K-means clustering (3-5개 그룹)
   - 회귀 분석: 양식 변천 예측 모델
   도구: SPSS 25, R Studio
   ```
3. Save 후 Dashboard 확인

**스크린샷 포인트:**
- 연구 계획 Edit Modal
- 연구 방법론 내용
- 데이터 분석 계획

---

## Scenario 7: 행정 관리자 (Administrator)

### 🎬 시나리오 개요
- **대상**: 신규 행정 관리자
- **목표**: 박물관 행정 및 예산 관리 이해
- **소요 시간**: 8분

### 📝 Step-by-Step

#### **Step 1: 역할 선택 (30초)**
- "행정 관리 (Administration)" 선택

#### **Step 2: 샘플 데이터 확인 (1min)**
- **프로젝트**: "2024년 예산 집행 관리"
- **총 예산**: 50억 원
- **10 Tasks**: 예산 계획 → 집행 모니터링 → 지원금 관리 → 인사 관리 → 급여 & 복지 → 시설 & 안전 → IT & 보안 → 법무 & 규정 → 실적 보고서 → 감사 & 평가

#### **Step 3: Tutorial (3min)**
- **Step 1**: 예산 계획 수립 (Budget Planning)
- **Step 2**: 집행 모니터링 (Monitoring)
- **Step 3**: 실적 보고서 작성 (Reports)

#### **Step 4: 예산 배분 실습 (2.5min)**
1. "예산 계획" Card 더블 클릭
2. Content 작성:
   ```
   총 예산: 50억 원
   부서별 배분:
   - 전시 기획: 15억 (30%)
   - 교육 프로그램: 8억 (16%)
   - 소장품 수집: 12억 (24%)
   - 보존 처리: 5억 (10%)
   - 학술 연구: 3억 (6%)
   - 행정 운영: 7억 (14%)
   예비비: 2억 (4%)
   ```
3. Save 후 "집행 모니터링" Card 연결

#### **Step 5: 감사 대응 실습 (1min)**
1. "감사 & 평가" Card 클릭
2. Content 작성:
   ```
   외부 회계 감사: 2024년 12월 예정
   정부 평가: 문화체육관광부 공공기관 평가
   준비 사항:
   - 회계 장부 정리 (월별/부서별)
   - 지출 증빙 서류 준비 (영수증, 계약서)
   - 예산 집행 실적 보고서 작성
   - 개선 계획 수립 (차년도 반영)
   ```
3. Save 후 Dashboard 확인

**스크린샷 포인트:**
- 예산 배분 Edit Modal
- 부서별 예산 비율
- 감사 대응 체크리스트

---

## 📸 스크린샷 가이드

### 필수 스크린샷 (각 시나리오당)

1. **Welcome Modal**
   - 전체 화면
   - 7개 역할 카드
   - 선택한 역할 강조

2. **샘플 데이터 생성**
   - Projects 패널 (프로젝트 생성)
   - Tasks 패널 (10개 Task)
   - Canvas Workspace (10개 Card)

3. **Tutorial Overlay**
   - Spotlight 효과
   - Tooltip 설명
   - Progress Bar (1/3, 2/3, 3/3)

4. **Behavior Detector**
   - Idle/Stuck Detection Modal
   - 상황별 Hint 텍스트
   - AI Assistant 버튼

5. **완료 화면**
   - Tutorial Completion Badge
   - Canvas 전체 워크플로우 (10 Cards + Connections)
   - Dashboard 통계 (Projects: 1, Tasks: 10, Canvas Cards: 10)

### 스크린샷 설정

**해상도**: 1920x1080 (Full HD)
**브라우저 창 크기**: 전체 화면 (F11)
**Zoom Level**: 100% (Ctrl+0)
**파일 형식**: PNG (lossless)
**파일명 규칙**: `scenario{N}_step{M}_{description}.png`
- 예: `scenario1_step2_sample_data_generated.png`

---

## 🎥 비디오 녹화 가이드

### 녹화 설정

**해상도**: 1920x1080 @ 30fps
**오디오**: 마이크 ON (설명 음성)
**포맷**: MP4 (H.264)
**길이**: 각 시나리오당 5-10분

### 녹화 스크립트 템플릿

```
[Opening]
"안녕하세요, 오늘은 MuseFlow V26.0의 {역할} 시나리오를 시연하겠습니다."

[Welcome Modal]
"먼저 Canvas 페이지에 접속하면 Welcome Modal이 나타납니다. 7개 역할 중 '{역할}'을 선택하겠습니다."

[샘플 데이터 생성]
"역할을 선택하자마자 실제 {업무} 프로젝트가 자동으로 생성됩니다. 10개의 Task와 10개의 Canvas Card가 미리 준비되어 있습니다."

[Tutorial]
"이제 {N}단계 튜토리얼이 시작됩니다. 각 단계마다 실제로 클릭하고 입력해야 다음으로 넘어갑니다."

[Behavior Detector]
"잠시 작업을 멈추면... 30초 후 자동으로 도움말이 나타납니다. 이 시스템은 사용자 행동을 실시간으로 감지합니다."

[Closing]
"이렇게 {N}분 만에 {역할} 업무를 이해하고 첫 프로젝트를 완성했습니다. 감사합니다."
```

---

## 🔧 Troubleshooting

### 문제 1: Welcome Modal이 나타나지 않음
**원인**: localStorage에 `canvas_onboarding_completed` 키 존재
**해결**:
```javascript
localStorage.removeItem('canvas_onboarding_completed');
location.reload();
```

### 문제 2: Tutorial이 자동 시작되지 않음
**원인**: Tutorial System 초기화 실패
**해결**:
1. 브라우저 Console 열기 (F12)
2. 에러 메시지 확인
3. 페이지 새로고침 (Ctrl+R)

### 문제 3: Behavior Detector가 작동하지 않음
**원인**: JavaScript 실행 순서 문제
**해결**:
1. 페이지 새로고침
2. Welcome Modal부터 다시 시작
3. 브라우저 Console에서 `window.behaviorDetector` 확인

### 문제 4: Canvas Card 연결이 안 됨
**원인**: Connection Point 클릭 정확도
**해결**:
1. Zoom In (Ctrl + +)
2. Connection Point를 정확히 클릭
3. 마우스 드래그하여 연결

---

## 📝 Feedback & Improvement

### 시연 후 수집할 피드백

1. **사용자 만족도** (5-point Likert Scale)
   - Welcome Modal이 도움이 되었나요?
   - 샘플 데이터가 실무에 도움이 되나요?
   - Tutorial이 이해하기 쉬웠나요?
   - Behavior Detector가 유용했나요?

2. **개선 사항**
   - 어떤 기능이 가장 유용했나요?
   - 어떤 부분이 개선되어야 하나요?
   - 추가로 원하는 샘플 데이터가 있나요?
   - Tutorial에서 부족한 부분이 있나요?

3. **시간 및 효율성**
   - 첫 프로젝트 완료까지 걸린 시간은?
   - 멘토 없이도 학습이 가능했나요?
   - 기존 방법 대비 얼마나 빨랐나요?

---

**End of Demo Scenarios Guide**
